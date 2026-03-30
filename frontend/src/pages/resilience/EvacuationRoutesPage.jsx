import { useState } from "react";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../context/AuthProvider";

const EvacuationRoutesPage = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState("");

  const generate = async () => {
    try {
      setError("");
      const { data } = await axiosInstance.post("/resilience/evacuation/recommendations", {
        region: user?.region || "Odisha",
        role: user?.role || "student",
      });
      setRoutes(Array.isArray(data?.routes) ? data.routes : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate routes");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-bold text-gray-900">Evacuation Route Intelligence</h1>
          <p className="text-gray-600">Generate role-aware safe route recommendations.</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
        <button className="bg-emerald-600 text-white rounded-lg px-4 py-2" onClick={generate}>Generate Routes</button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {routes.map((route) => (
            <div key={route.routeId} className="bg-white border rounded-lg p-4">
              <p className="font-semibold text-gray-900">{route.name}</p>
              <p className="text-sm text-gray-600">ETA: {route.etaMinutes} min • Risk: {route.risk}</p>
              <p className="text-xs text-gray-500 mt-1">{(route.checkpoints || []).join(" -> ")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvacuationRoutesPage;
