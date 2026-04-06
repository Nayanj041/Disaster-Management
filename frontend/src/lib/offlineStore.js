const DB_NAME = "suraksha-offline-db";
const DB_VERSION = 1;
const STORE_NAME = "offline_cache";

const withDb = async (handler) => {
  if (typeof window === "undefined" || !window.indexedDB) {
    return null;
  }

  const db = await new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  try {
    return await handler(db);
  } finally {
    db.close();
  }
};

export const saveOfflineData = async (key, value) => {
  return withDb(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put({ key, value, updatedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      })
  );
};

export const getOfflineData = async (key) => {
  return withDb(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      })
  );
};

export const appendOfflineQueue = async (queueKey, item) => {
  const existing = await getOfflineData(queueKey);
  const current = Array.isArray(existing?.value) ? existing.value : [];
  const queued = [...current, { ...item, queuedAt: new Date().toISOString() }];
  await saveOfflineData(queueKey, queued);
  return queued.length;
};

export const getOfflineQueue = async (queueKey) => {
  const existing = await getOfflineData(queueKey);
  return Array.isArray(existing?.value) ? existing.value : [];
};

export const setOfflineQueue = async (queueKey, items) => {
  const safeItems = Array.isArray(items) ? items : [];
  await saveOfflineData(queueKey, safeItems);
  return safeItems.length;
};
