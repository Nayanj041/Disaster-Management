import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { ShieldCheck, Brain, RefreshCw } from "lucide-react";

const PreparednessScore = () => {
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPreparedness = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const historyRes = await axiosInstance.get("/risk/history");
      const latest = Array.isArray(historyRes.data) ? historyRes.data[0] : null;
      setLatestAssessment(latest);

      const payload = {
        riskScore: latest?.overallRisk ?? 50,
        infrastructure: latest?.infrastructure || {
          buildingQuality: 5,
          hospitalAccess: 5,
          roadAccess: 5,
          communicationAccess: 5,
          shelterAvailability: 5,
        },
        engagement: {
          modulesCompleted: latest?.preparednessScore > 60 ? 3 : 1,
          drillsCompleted: latest?.preparednessScore > 60 ? 2 : 1,
        },
      };

      const scoreRes = await axiosInstance.post("/ml/preparedness-score", payload);
      setScoreResult(scoreRes.data || null);
    } catch (error) {
      console.error("Failed to calculate preparedness score:", error);
      setScoreResult(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPreparedness();
  }, []);

  if (loading) {
    return <div className="min-h-screen p-6">Calculating preparedness score...</div>;
  }

  const score = scoreResult?.preparednessScore ?? 0;
  const grade = scoreResult?.grade || "N/A";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow border p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Preparedness Score</h1>
            <p className="text-gray-600">
              AI-assisted preparedness scoring based on your regional risk and infrastructure profile.
            </p>
          </div>
          <button
            onClick={() => fetchPreparedness(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Recalculate"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
              <ShieldCheck className="w-5 h-5" /> Preparedness Score
            </div>
            <p className="text-5xl font-bold text-gray-900">{score}</p>
            <p className="text-sm text-gray-600 mt-2">Grade: {grade}</p>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-2 text-purple-700 font-semibold mb-2">
              <Brain className="w-5 h-5" /> Latest Risk Snapshot
            </div>
            {latestAssessment ? (
              <div className="space-y-1 text-sm text-gray-700">
                <p>Region: {latestAssessment.location?.region || "N/A"}</p>
                <p>City: {latestAssessment.location?.city || "N/A"}</p>
                <p>Overall Risk: {latestAssessment.overallRisk}</p>
                <p>Baseline Preparedness: {latestAssessment.preparednessScore}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No risk assessment found yet. Run an assessment first from Assess Risk page.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Actionable Recommendations</h2>
          {Array.isArray(scoreResult?.recommendations) && scoreResult.recommendations.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {scoreResult.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No recommendations available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreparednessScore;