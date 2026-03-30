import { useState } from "react";
import axiosInstance from "../lib/axios";
import { AlertTriangle, ShieldCheck, Bot } from "lucide-react";

const initialForm = {
  region: "Odisha",
  city: "",
  buildingQuality: 5,
  hospitalAccess: 5,
  roadAccess: 5,
  communicationAccess: 5,
  shelterAvailability: 5,
};

const RiskAssessment = () => {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        location: {
          region: form.region,
          city: form.city,
        },
        infrastructure: {
          buildingQuality: Number(form.buildingQuality),
          hospitalAccess: Number(form.hospitalAccess),
          roadAccess: Number(form.roadAccess),
          communicationAccess: Number(form.communicationAccess),
          shelterAvailability: Number(form.shelterAvailability),
        },
      };

      const { data } = await axiosInstance.post("/risk/assess", payload);
      setResult(data);

      const [mlRiskRes, mlPreparednessRes, mlGamificationRes] = await Promise.all([
        axiosInstance.post("/ml/risk-prediction", payload),
        axiosInstance.post("/ml/preparedness-score", {
          riskScore: data.overallRisk,
          infrastructure: payload.infrastructure,
        }),
        axiosInstance.post("/ml/gamification-score", {
          activityType: "risk_assessment",
          preparednessScore: data.preparednessScore,
        }),
      ]);

      setMlResult({
        risk: mlRiskRes.data,
        preparedness: mlPreparednessRes.data,
        gamification: mlGamificationRes.data,
      });
    } catch (error) {
      console.error("Risk assessment failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assess Disaster Risk</h1>
          <p className="text-gray-600">Evaluate disaster risks based on location and infrastructure readiness.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                name="region"
                value={form.region}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              ["buildingQuality", "Building"],
              ["hospitalAccess", "Hospital"],
              ["roadAccess", "Road"],
              ["communicationAccess", "Comms"],
              ["shelterAvailability", "Shelter"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label} (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Assessing..." : "Run Assessment"}
          </button>
        </form>

        {result && (
          <div className="bg-white rounded-lg shadow border p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <AlertTriangle className="w-5 h-5" /> Overall Risk
                </div>
                <p className="text-3xl font-bold text-red-700 mt-2">{result.overallRisk}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <ShieldCheck className="w-5 h-5" /> Preparedness Score
                </div>
                <p className="text-3xl font-bold text-green-700 mt-2">{result.preparednessScore}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Regional Hazard Profile</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.hazardProfile || {}).map(([k, v]) => (
                  <div key={k} className="p-3 border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 capitalize">{k}</p>
                    <p className="text-xl font-bold text-gray-900">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Actionable Recommendations</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {(result.recommendations || []).map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

            {mlResult && (
              <div className="mt-6 p-4 rounded-lg border bg-blue-50 border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-blue-800 font-semibold">
                  <Bot className="w-5 h-5" /> ML Microservice Insights
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg border p-3">
                    <p className="text-sm text-gray-600">Predicted Risk Category</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {mlResult.risk?.category || "n/a"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Score: {mlResult.risk?.riskScore ?? "n/a"}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border p-3">
                    <p className="text-sm text-gray-600">ML Preparedness Grade</p>
                    <p className="text-lg font-bold text-gray-900">
                      {mlResult.preparedness?.grade || "n/a"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Score: {mlResult.preparedness?.preparednessScore ?? "n/a"}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border p-3">
                    <p className="text-sm text-gray-600">Gamification Reward</p>
                    <p className="text-lg font-bold text-gray-900">
                      +{mlResult.gamification?.xpAward ?? 0} XP
                    </p>
                    <p className="text-sm text-gray-600">
                      Level Delta: {mlResult.gamification?.levelDelta ?? 0}
                    </p>
                  </div>
                </div>

                {Array.isArray(mlResult.preparedness?.recommendations) &&
                  mlResult.preparedness.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">ML Recommendations</h4>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        {mlResult.preparedness.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAssessment;
