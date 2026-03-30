import RiskAssessment from "../models/riskAssessment.model.js";
import Drill from "../models/drill.model.js";
import Progress from "../models/progress.model.js";

const REGION_HAZARD_BASE = {
  Odisha: { earthquake: 45, flood: 70, cyclone: 85, fire: 35 },
  "West Bengal": { earthquake: 40, flood: 75, cyclone: 80, fire: 40 },
  "Andhra Pradesh": { earthquake: 42, flood: 65, cyclone: 82, fire: 38 },
  "Tamil Nadu": { earthquake: 35, flood: 60, cyclone: 78, fire: 36 },
  North: { earthquake: 72, flood: 42, cyclone: 28, fire: 35 },
  South: { earthquake: 38, flood: 58, cyclone: 62, fire: 40 },
  East: { earthquake: 48, flood: 72, cyclone: 70, fire: 37 },
  West: { earthquake: 65, flood: 40, cyclone: 25, fire: 42 },
  Central: { earthquake: 58, flood: 46, cyclone: 22, fire: 44 },
  India: { earthquake: 55, flood: 60, cyclone: 58, fire: 40 },
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const computeScores = ({ region, infrastructure }) => {
  const base = REGION_HAZARD_BASE[region] || REGION_HAZARD_BASE.India;
  const infraAvg =
    (infrastructure.buildingQuality +
      infrastructure.hospitalAccess +
      infrastructure.roadAccess +
      infrastructure.communicationAccess +
      infrastructure.shelterAvailability) /
    5;

  const infraShield = (10 - infraAvg) * 4;

  const hazardProfile = {
    earthquake: clamp(Math.round(base.earthquake + infraShield), 0, 100),
    flood: clamp(Math.round(base.flood + infraShield), 0, 100),
    cyclone: clamp(Math.round(base.cyclone + infraShield), 0, 100),
    fire: clamp(Math.round(base.fire + infraShield), 0, 100),
  };

  const overallRisk = Math.round(
    (hazardProfile.earthquake +
      hazardProfile.flood +
      hazardProfile.cyclone +
      hazardProfile.fire) /
      4
  );

  const preparednessScore = clamp(Math.round(100 - overallRisk * 0.6 + infraAvg * 4), 0, 100);

  const recommendations = [];
  if (hazardProfile.cyclone >= 70) {
    recommendations.push("Pre-position cyclone emergency kits and verify nearest shelters.");
  }
  if (hazardProfile.flood >= 70) {
    recommendations.push("Map high-ground evacuation routes and set flood alert triggers.");
  }
  if (hazardProfile.earthquake >= 65) {
    recommendations.push("Run drop-cover-hold drills and secure heavy indoor fixtures.");
  }
  if (hazardProfile.fire >= 60) {
    recommendations.push("Inspect fire exits, extinguishers, and electrical load safety.");
  }
  if (preparednessScore < 50) {
    recommendations.push("Increase weekly training and complete at least two preparedness modules.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Maintain current preparedness level and run monthly multi-hazard drills.");
  }

  return { hazardProfile, overallRisk, preparednessScore, recommendations };
};

export const assessRisk = async (req, res) => {
  try {
    const { location, infrastructure } = req.body;

    if (!location?.region) {
      return res.status(400).json({ message: "location.region is required" });
    }

    const normalizedInfra = {
      buildingQuality: Number(infrastructure?.buildingQuality || 5),
      hospitalAccess: Number(infrastructure?.hospitalAccess || 5),
      roadAccess: Number(infrastructure?.roadAccess || 5),
      communicationAccess: Number(infrastructure?.communicationAccess || 5),
      shelterAvailability: Number(infrastructure?.shelterAvailability || 5),
    };

    const computed = computeScores({
      region: location.region,
      infrastructure: normalizedInfra,
    });

    const assessment = await RiskAssessment.create({
      userId: req.user._id,
      location: {
        region: location.region,
        city: location.city || "",
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
      },
      infrastructure: normalizedInfra,
      ...computed,
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error("Error assessing risk:", error);
    res.status(500).json({ message: "Failed to assess risk" });
  }
};

export const getRiskHistory = async (req, res) => {
  try {
    const history = await RiskAssessment.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(25);
    res.json(history);
  } catch (error) {
    console.error("Error fetching risk history:", error);
    res.status(500).json({ message: "Failed to fetch risk history" });
  }
};

export const getRegionalRiskMap = async (_req, res) => {
  try {
    const latestByRegion = await RiskAssessment.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$location.region",
          averageRisk: { $avg: "$overallRisk" },
          preparednessScore: { $avg: "$preparednessScore" },
          assessments: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          region: "$_id",
          averageRisk: { $round: ["$averageRisk", 0] },
          preparednessScore: { $round: ["$preparednessScore", 0] },
          assessments: 1,
        },
      },
      { $sort: { averageRisk: -1 } },
    ]);

    res.json(latestByRegion);
  } catch (error) {
    console.error("Error fetching regional risk map:", error);
    res.status(500).json({ message: "Failed to fetch regional risk map" });
  }
};

export const getDrillParticipationAnalytics = async (_req, res) => {
  try {
    const drillsByType = await Drill.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          avgScore: { $avg: "$score" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          total: 1,
          completed: 1,
          completionRate: {
            $cond: [{ $eq: ["$total", 0] }, 0, { $round: [{ $multiply: [{ $divide: ["$completed", "$total"] }, 100] }, 0] }],
          },
          avgScore: { $round: ["$avgScore", 0] },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const preparedness = await Progress.aggregate([
      {
        $group: {
          _id: null,
          avgXp: { $avg: "$xp" },
          avgLevel: { $avg: "$level" },
          avgDrillsCompleted: { $avg: "$drillsCompleted" },
        },
      },
      {
        $project: {
          _id: 0,
          avgXp: { $round: ["$avgXp", 0] },
          avgLevel: { $round: ["$avgLevel", 1] },
          avgDrillsCompleted: { $round: ["$avgDrillsCompleted", 1] },
        },
      },
    ]);

    res.json({
      drillsByType,
      preparedness: preparedness[0] || { avgXp: 0, avgLevel: 0, avgDrillsCompleted: 0 },
    });
  } catch (error) {
    console.error("Error fetching drill participation analytics:", error);
    res.status(500).json({ message: "Failed to fetch drill analytics" });
  }
};
