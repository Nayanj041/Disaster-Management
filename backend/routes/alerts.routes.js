import express from "express";
import Alert from "../models/alert.model.js";
import EmergencyContact from "../models/emergencyContact.model.js";

const router = express.Router();

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
    const { region, severity, status } = req.query;
    const query = {};
    if (region) query.region = region;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const alerts = await Alert.find(query).sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alerts" });
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
