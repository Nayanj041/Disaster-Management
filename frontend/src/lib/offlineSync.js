import axiosInstance from "./axios";
import { getOfflineQueue, setOfflineQueue } from "./offlineStore";

const QUEUE_KEY = "sync-queue";
const MAX_RETRIES = 3;
const STALE_MS = 1000 * 60 * 60 * 24;

const fingerprintFor = (item) => {
  return [item.type, item.userId || "guest", item.region || "", item.payloadHash || ""].join("|");
};

const isStale = (item) => {
  const ts = new Date(item.queuedAt || 0).getTime();
  if (!Number.isFinite(ts)) return true;
  return Date.now() - ts > STALE_MS;
};

const executeQueueItem = async (item) => {
  switch (item.type) {
    case "offline-pack-refresh": {
      await axiosInstance.get("/resilience/offline-pack", {
        params: { region: item.region || "India" },
      });
      return true;
    }
    default:
      return true;
  }
};

export const processOfflineQueue = async () => {
  const queue = await getOfflineQueue(QUEUE_KEY);
  if (!queue.length) return { processed: 0, pending: 0, dropped: 0 };

  const dedupedMap = new Map();
  for (const item of queue) {
    const key = fingerprintFor(item);
    dedupedMap.set(key, item);
  }

  const deduped = Array.from(dedupedMap.values());
  let processed = 0;
  let dropped = 0;
  const pending = [];

  for (const item of deduped) {
    if (isStale(item)) {
      dropped += 1;
      continue;
    }

    try {
      await executeQueueItem(item);
      processed += 1;
    } catch (_error) {
      const retryCount = Number(item.retryCount || 0) + 1;
      if (retryCount <= MAX_RETRIES) {
        pending.push({ ...item, retryCount });
      } else {
        dropped += 1;
      }
    }
  }

  await setOfflineQueue(QUEUE_KEY, pending);
  return { processed, pending: pending.length, dropped };
};

export const queueKey = QUEUE_KEY;

let syncTimer = null;
let currentDelayMs = 5000;
const MIN_DELAY_MS = 5000;
const MAX_DELAY_MS = 60000;

const shouldRunNow = () => {
  if (typeof window === "undefined") return false;
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;
  const visible = typeof document !== "undefined" ? document.visibilityState === "visible" : true;
  return online && visible;
};

const scheduleNext = (runner, delay) => {
  if (syncTimer) {
    clearTimeout(syncTimer);
  }
  syncTimer = setTimeout(runner, delay);
};

export const startOfflineSyncLoop = () => {
  if (typeof window === "undefined") return;
  if (syncTimer) return;

  const tick = async () => {
    if (!shouldRunNow()) {
      currentDelayMs = Math.min(MAX_DELAY_MS, currentDelayMs * 1.5);
      scheduleNext(tick, currentDelayMs);
      return;
    }

    const result = await processOfflineQueue();
    if (result.pending > 0) {
      currentDelayMs = Math.min(MAX_DELAY_MS, currentDelayMs * 1.4);
    } else {
      currentDelayMs = MIN_DELAY_MS;
    }
    scheduleNext(tick, currentDelayMs);
  };

  currentDelayMs = MIN_DELAY_MS;
  scheduleNext(tick, currentDelayMs);
};

export const stopOfflineSyncLoop = () => {
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }
};
