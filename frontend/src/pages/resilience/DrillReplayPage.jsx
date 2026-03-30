import { useState } from "react";
import axiosInstance from "../../lib/axios";

const DrillReplayPage = () => {
  const [drillId, setDrillId] = useState("");
  const [replay, setReplay] = useState(null);
  const [error, setError] = useState("");

  const loadReplay = async () => {
    if (!drillId) return;
    try {
      setError("");
      const { data } = await axiosInstance.get(`/resilience/drill-replay/${drillId}`);
      setReplay(data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load replay");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-bold text-gray-900">Drill Performance Replay</h1>
          <p className="text-gray-600">Load a drill timeline replay and bottleneck summary by drill ID.</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="bg-white rounded-xl border p-5 flex gap-2">
          <input className="border rounded-lg px-3 py-2 flex-1" placeholder="Enter drill id" value={drillId} onChange={(e) => setDrillId(e.target.value)} />
          <button className="bg-slate-700 text-white rounded-lg px-4 py-2" onClick={loadReplay}>Load</button>
        </div>

        {replay && (
          <div className="bg-white rounded-xl border p-5 space-y-3">
            <p className="font-semibold text-gray-900">{replay.title}</p>
            <p className="text-sm text-gray-600">Response Time Score: {replay.performance?.responseTimeScore} • Coordination: {replay.performance?.coordinationScore}</p>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {(replay.timeline || []).map((step, idx) => (
                <li key={idx}>T+{step.minute}m: {step.event}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrillReplayPage;
