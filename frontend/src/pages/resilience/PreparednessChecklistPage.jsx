import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";

const PreparednessChecklistPage = () => {
  const [checklist, setChecklist] = useState(null);
  const [error, setError] = useState("");

  const loadChecklist = async () => {
    try {
      setError("");
      const { data } = await axiosInstance.get("/resilience/checklist");
      setChecklist(data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch checklist");
    }
  };

  useEffect(() => {
    loadChecklist();
  }, []);

  const toggleItem = async (key) => {
    try {
      const { data } = await axiosInstance.post(`/resilience/checklist/${key}/toggle`);
      setChecklist(data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update checklist");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-bold text-gray-900">Household Preparedness Checklist</h1>
          <p className="text-gray-600">Track and improve actionable preparedness completion.</p>
          <p className="text-sm text-gray-700 mt-2">Completion Score: {checklist?.completionScore || 0}%</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="bg-white rounded-xl border p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {(checklist?.items || []).map((item) => (
            <button
              key={item.key}
              onClick={() => toggleItem(item.key)}
              className={`text-left border rounded-lg p-3 ${item.completed ? "bg-green-50 border-green-300" : "bg-white"}`}
            >
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.category}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreparednessChecklistPage;
