import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";

const AlertChannelsPage = () => {
  const [pref, setPref] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");
      const [prefRes, previewRes] = await Promise.all([
        axiosInstance.get("/resilience/alert-preferences"),
        axiosInstance.get("/resilience/notifications/preview"),
      ]);
      setPref(prefRes.data || null);
      setPreview(Array.isArray(previewRes.data?.simulatedDelivery) ? previewRes.data.simulatedDelivery : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load alert channels");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const save = async () => {
    try {
      setError("");
      await axiosInstance.put("/resilience/alert-preferences", pref);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save preferences");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-bold text-gray-900">Real-Time Alert Channels</h1>
          <p className="text-gray-600">Configure your emergency delivery channels and preview delivery queue.</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        {pref && (
          <div className="bg-white rounded-xl border p-5 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(pref.channels || {}).map(([name, enabled]) => (
                <label key={name} className="border rounded-lg p-3 flex items-center justify-between text-sm">
                  <span className="capitalize">{name}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(enabled)}
                    onChange={(e) =>
                      setPref((current) => ({
                        ...current,
                        channels: { ...current.channels, [name]: e.target.checked },
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <button className="bg-indigo-600 text-white rounded-lg px-4 py-2" onClick={save}>Save Preferences</button>
            <div className="text-sm text-gray-600">Delivery Preview: {preview.map((p) => `${p.channel}:${p.status}`).join(", ") || "No active channels"}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertChannelsPage;
