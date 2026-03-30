import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../context/AuthProvider";

const EarlyWarningForecastPage = () => {
  const { user } = useAuth();
  const [region, setRegion] = useState(user?.region || "India");
  const [forecast, setForecast] = useState([]);
  const [baseRisk, setBaseRisk] = useState(null);
  const [error, setError] = useState("");

  const loadForecast = async () => {
    try {
      setError("");
      const { data } = await axiosInstance.get("/resilience/forecast", {
        params: { region },
      });
      setBaseRisk(data?.baseRisk ?? null);
      setForecast(Array.isArray(data?.forecast) ? data.forecast : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load forecast");
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-bold text-gray-900">Predictive Early Warning Dashboard</h1>
          <p className="text-gray-600">View 24h/48h/72h projected risk with confidence levels.</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="bg-white rounded-xl border p-5 flex gap-2">
          <input className="border rounded-lg px-3 py-2 flex-1" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" />
          <button className="bg-purple-600 text-white rounded-lg px-4 py-2" onClick={loadForecast}>Refresh</button>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-600">Base Risk: <span className="font-semibold text-gray-900">{baseRisk ?? "-"}</span></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {forecast.map((item) => (
              <div key={item.horizonHours} className="border rounded-lg p-3">
                <p className="font-semibold text-gray-900">Next {item.horizonHours}h</p>
                <p className="text-sm text-gray-600">Risk: {item.projectedRisk} ({item.riskBand})</p>
                <p className="text-sm text-gray-600">Confidence: {item.confidence}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarlyWarningForecastPage;
