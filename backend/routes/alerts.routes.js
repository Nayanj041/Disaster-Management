import express from "express";
import Alert from "../models/alert.model.js";
import EmergencyContact from "../models/emergencyContact.model.js";

const router = express.Router();

const REGION_COORDINATES = {
  Punjab: { latitude: 31.1471, longitude: 75.3412 },
  Amritsar: { latitude: 31.634, longitude: 74.8723 },
  Ludhiana: { latitude: 30.901, longitude: 75.8573 },
  Jalandhar: { latitude: 31.326, longitude: 75.5762 },
  Patiala: { latitude: 30.3398, longitude: 76.3869 },
  Mohali: { latitude: 30.7046, longitude: 76.7179 },
  Bathinda: { latitude: 30.211, longitude: 74.9455 },
};

const toRad = (v) => (v * Math.PI) / 180;
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getAlertCoordinate = (alert) => {
  if (Number.isFinite(alert.latitude) && Number.isFinite(alert.longitude)) {
    return { latitude: alert.latitude, longitude: alert.longitude };
  }
  return REGION_COORDINATES[String(alert.region || "")] || null;
};

const DEFAULT_CONTACTS = [
  {
    name: "National Emergency Response",
    description: "Primary national emergency response line",
    phone: "112",
    type: "helpline",
    priority: "high",
    region: "All",
  },
  {
    name: "Fire and Rescue",
    description: "Fire incidents and rescue operations",
    phone: "101",
    type: "fire",
    priority: "high",
    region: "All",
  },
  {
    name: "Medical Emergency",
    description: "Ambulance and urgent health support",
    phone: "108",
    type: "ambulance",
    priority: "high",
    region: "All",
  },
];

// GET /api/alerts?region=Odisha&severity=Critical
router.get("/", async (req, res) => {
  try {
    const { region, severity, status, latitude, longitude, radiusKm } = req.query;
    const query = {};
    if (region) query.region = region;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const alerts = await Alert.find(query).sort({ timestamp: -1 }).lean();

    const lat = Number(latitude);
    const lng = Number(longitude);
    const radius = Number(radiusKm || 50);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.json(alerts);
    }

    const geofenced = alerts
      .map((alert) => {
        const coords = getAlertCoordinate(alert);
        if (!coords) return null;
        const distanceKm = haversineDistanceKm(lat, lng, coords.latitude, coords.longitude);
        if (distanceKm > radius) return null;
        return {
          ...alert,
          distanceKm: Number(distanceKm.toFixed(1)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(geofenced);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// POST /api/alerts/predict-severity
router.post("/predict-severity", async (req, res) => {
  try {
    const {
      windSpeed = 0,
      rainfall = 0,
      temperature = 30,
      waterLevel = 0,
      historicalIncidents = 0,
    } = req.body || {};

    const score =
      Number(windSpeed) * 0.25 +
      Number(rainfall) * 0.35 +
      Number(waterLevel) * 0.2 +
      Number(historicalIncidents) * 4 +
      Math.max(0, Number(temperature) - 38) * 1.5;

    let severity = "low";
    if (score >= 85) severity = "critical";
    else if (score >= 60) severity = "high";
    else if (score >= 35) severity = "medium";

    res.json({
      model: "heuristic-v1",
      riskScore: Math.round(score),
      predictedSeverity: severity,
      explanation:
        "Severity estimate based on combined weather intensity, water level, and historical incident pressure.",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to predict severity" });
  }
});

// GET /api/alerts/contacts
router.get("/contacts", async (req, res) => {
  try {
    const count = await EmergencyContact.countDocuments();
    if (count === 0) {
      await EmergencyContact.insertMany(DEFAULT_CONTACTS);
    }

    const contacts = await EmergencyContact.find().sort({ priority: 1, name: 1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch emergency contacts" });
  }
});

export default router;
