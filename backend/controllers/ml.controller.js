import axios from "axios";

const ML_BASE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

const forward = async (path, payload, fallback) => {
  try {
    const { data } = await axios.post(`${ML_BASE_URL}${path}`, payload, {
      timeout: 5000,
    });
    return data;
  } catch (_error) {
    return fallback;
  }
};

export const mlRiskPrediction = async (req, res) => {
  const fallback = {
    source: "fallback",
    riskScore: 50,
    category: "medium",
    confidence: 0.5,
  };

  const data = await forward("/predict-risk", req.body, fallback);
  res.json(data);
};

export const mlPreparednessScore = async (req, res) => {
  const fallback = {
    source: "fallback",
    preparednessScore: 55,
    grade: "C",
    recommendations: ["Complete more modules", "Join weekly drills"],
  };

  const data = await forward("/preparedness-score", req.body, fallback);
  res.json(data);
};

export const mlGamificationScore = async (req, res) => {
  const fallback = {
    source: "fallback",
    xpAward: 40,
    levelDelta: 0,
    badgeCandidate: null,
  };

  const data = await forward("/gamification-score", req.body, fallback);
  res.json(data);
};
