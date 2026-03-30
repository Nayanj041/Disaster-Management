import IncidentReport from "../models/incidentReport.model.js";
import AlertPreference from "../models/alertPreference.model.js";
import PreparednessChecklist from "../models/preparednessChecklist.model.js";
import ResourceCenter from "../models/resourceCenter.model.js";
import VolunteerTask from "../models/volunteerTask.model.js";
import Drill from "../models/drill.model.js";
import RiskAssessment from "../models/riskAssessment.model.js";

const DEFAULT_CHECKLIST = [
  { key: "water_kit", label: "Store 72-hour water supply", category: "supplies" },
  { key: "food_kit", label: "Store non-perishable food kit", category: "supplies" },
  { key: "first_aid", label: "Maintain complete first-aid box", category: "medical" },
  { key: "family_plan", label: "Create family communication plan", category: "planning" },
  { key: "documents", label: "Protect IDs and critical documents", category: "planning" },
  { key: "power_backup", label: "Prepare torch and battery backup", category: "utilities" },
  { key: "evac_route", label: "Know nearest evacuation route", category: "evacuation" },
  { key: "drill_done", label: "Complete one monthly preparedness drill", category: "training" },
];

const TRANSLATIONS = {
  hi: {
    "Emergency Alert": "आपातकालीन चेतावनी",
    "Evacuate Immediately": "तुरंत निकासी करें",
    "Nearest Shelter": "निकटतम आश्रय",
  },
  bn: {
    "Emergency Alert": "জরুরি সতর্কতা",
    "Evacuate Immediately": "অবিলম্বে সরিয়ে নিন",
    "Nearest Shelter": "নিকটস্থ আশ্রয়",
  },
  ta: {
    "Emergency Alert": "அவசர எச்சரிக்கை",
    "Evacuate Immediately": "உடனே வெளியேறவும்",
    "Nearest Shelter": "அருகிலுள்ள தங்குமிடம்",
  },
  te: {
    "Emergency Alert": "అత్యవసర హెచ్చరిక",
    "Evacuate Immediately": "వెంటనే ఖాళీ చేయండి",
    "Nearest Shelter": "సమీప ఆశ్రయం",
  },
};

const isPrivilegedVerifier = (role) => ["teacher", "admin"].includes((role || "").toLowerCase());

const gradeRisk = (score) => {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "moderate";
  return "low";
};

const getPagination = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildEvacuationPlan = ({ region, role, blockedRoads = [] }) => {
  const blocked = new Set((blockedRoads || []).map((s) => String(s).toLowerCase()));

  const baseRoutes = [
    {
      routeId: "R1",
      name: `${region} Primary Corridor`,
      etaMinutes: 18,
      risk: "medium",
      checkpoints: ["Main Junction", "School Ground", "Zone Shelter A"],
      accessibleFor: ["student", "teacher", "admin", "public"],
    },
    {
      routeId: "R2",
      name: `${region} Elevated Bypass`,
      etaMinutes: 24,
      risk: "low",
      checkpoints: ["Bridge Access", "Community Hall", "Highland Shelter B"],
      accessibleFor: ["student", "teacher", "admin", "public"],
    },
    {
      routeId: "R3",
      name: `${region} Emergency Medical Lane`,
      etaMinutes: 15,
      risk: "low",
      checkpoints: ["Hospital Gate", "Relief Hub", "Medical Shelter"],
      accessibleFor: ["teacher", "admin"],
    },
  ];

  return baseRoutes
    .filter((route) => route.accessibleFor.includes(role || "public"))
    .filter((route) => !blocked.has(route.routeId.toLowerCase()))
    .map((route, index) => ({
      ...route,
      recommendationPriority: index + 1,
      instruction:
        index === 0
          ? "Use this route first unless local authority directs otherwise."
          : "Keep this route as fallback if primary path is congested.",
    }));
};

export const createIncidentReport = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.title || !payload.description || !payload.location?.region) {
      return res.status(400).json({ message: "title, description, and location.region are required" });
    }

    const incident = await IncidentReport.create({
      userId: req.user._id,
      title: payload.title,
      description: payload.description,
      incidentType: payload.incidentType || "other",
      severity: payload.severity || "medium",
      location: {
        region: payload.location.region,
        city: payload.location.city || "",
        address: payload.location.address || "",
        latitude: payload.location.latitude ?? null,
        longitude: payload.location.longitude ?? null,
      },
      mediaUrls: Array.isArray(payload.mediaUrls) ? payload.mediaUrls : [],
      reporterContact: {
        phone: payload.reporterContact?.phone || "",
        alternatePhone: payload.reporterContact?.alternatePhone || "",
        preferredChannel: payload.reporterContact?.preferredChannel || "in-app",
        isAnonymous: Boolean(payload.reporterContact?.isAnonymous || false),
      },
      impact: {
        peopleAffected: Number(payload.impact?.peopleAffected || 0),
        injuriesReported: Number(payload.impact?.injuriesReported || 0),
        infrastructureDamage: payload.impact?.infrastructureDamage || "none",
        utilityOutage: {
          power: Boolean(payload.impact?.utilityOutage?.power || false),
          water: Boolean(payload.impact?.utilityOutage?.water || false),
          telecom: Boolean(payload.impact?.utilityOutage?.telecom || false),
        },
      },
      operational: {
        sourceReliability: payload.operational?.sourceReliability || "community",
        priority: payload.operational?.priority || "p3-medium",
        responseSlaMinutes: Number(payload.operational?.responseSlaMinutes || 60),
        tags: Array.isArray(payload.operational?.tags) ? payload.operational.tags : [],
      },
      status: "open",
      timeline: [
        {
          event: "Incident reported",
          actor: req.user?.name || "reporter",
          timestamp: new Date(),
        },
      ],
    });

    res.status(201).json(incident);
  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({ message: "Failed to create incident report" });
  }
};

export const listIncidentReports = async (req, res) => {
  try {
    const role = (req.user.role || "").toLowerCase();
    const { page, limit, skip } = getPagination(req.query);
    const query = {};

    if (!isPrivilegedVerifier(role)) {
      query.userId = req.user._id;
    }

    if (req.query.region) query["location.region"] = req.query.region;
    if (req.query.verificationStatus) query["verification.status"] = req.query.verificationStatus;
    if (req.query.severity) query.severity = req.query.severity;
    if (req.query.status) query.status = req.query.status;
    if (req.query.incidentType) query.incidentType = req.query.incidentType;

    const sortField = req.query.sortBy === "priority" ? "operational.priority" : "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const [incidents, total] = await Promise.all([
      IncidentReport.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email role")
        .populate("verification.verifiedBy", "name role")
        .populate("operational.assignedResponder", "name role"),
      IncidentReport.countDocuments(query),
    ]);

    res.json({
      data: incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing incidents:", error);
    res.status(500).json({ message: "Failed to fetch incidents" });
  }
};

export const updateIncidentVerification = async (req, res) => {
  try {
    if (!isPrivilegedVerifier(req.user.role)) {
      return res.status(403).json({ message: "Only teacher/admin can verify incidents" });
    }

    const { status, notes, assignedResponder, priority, responseSlaMinutes } = req.body || {};
    if (!["verified", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid verification status" });
    }

    const nextStatus = status === "verified" ? "triaged" : status === "rejected" ? "closed" : "open";

    const incident = await IncidentReport.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: nextStatus,
          "verification.status": status,
          "verification.notes": notes || "",
          "verification.verifiedBy": req.user._id,
          "verification.verifiedAt": new Date(),
          "operational.assignedResponder": assignedResponder || null,
          ...(priority ? { "operational.priority": priority } : {}),
          ...(responseSlaMinutes ? { "operational.responseSlaMinutes": Number(responseSlaMinutes) } : {}),
        },
        $push: {
          timeline: {
            event: `Verification updated: ${status}`,
            actor: req.user?.name || req.user?.role || "reviewer",
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(incident);
  } catch (error) {
    console.error("Error verifying incident:", error);
    res.status(500).json({ message: "Failed to verify incident" });
  }
};

export const getAlertPreferences = async (req, res) => {
  try {
    let pref = await AlertPreference.findOne({ userId: req.user._id });
    if (!pref) {
      pref = await AlertPreference.create({ userId: req.user._id });
    }
    res.json(pref);
  } catch (error) {
    console.error("Error fetching alert preferences:", error);
    res.status(500).json({ message: "Failed to fetch alert preferences" });
  }
};

export const updateAlertPreferences = async (req, res) => {
  try {
    const payload = req.body || {};
    const pref = await AlertPreference.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          channels: {
            inApp: Boolean(payload.channels?.inApp ?? true),
            email: Boolean(payload.channels?.email ?? true),
            sms: Boolean(payload.channels?.sms ?? false),
            whatsapp: Boolean(payload.channels?.whatsapp ?? false),
            voice: Boolean(payload.channels?.voice ?? false),
          },
          quietHours: {
            enabled: Boolean(payload.quietHours?.enabled ?? false),
            start: payload.quietHours?.start || "22:00",
            end: payload.quietHours?.end || "06:00",
          },
          preferredLanguage: payload.preferredLanguage || "en",
          emergencyOverride: Boolean(payload.emergencyOverride ?? true),
        },
      },
      { new: true, upsert: true }
    );

    res.json(pref);
  } catch (error) {
    console.error("Error updating alert preferences:", error);
    res.status(500).json({ message: "Failed to update alert preferences" });
  }
};

export const getNotificationPreview = async (req, res) => {
  try {
    const pref = await AlertPreference.findOne({ userId: req.user._id });
    const channels = pref?.channels || {
      inApp: true,
      email: true,
      sms: false,
      whatsapp: false,
      voice: false,
    };

    const activeChannels = Object.entries(channels)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);

    res.json({
      channels: activeChannels,
      simulatedDelivery: activeChannels.map((c) => ({
        channel: c,
        status: "queued",
        etaSeconds: c === "sms" ? 8 : c === "whatsapp" ? 12 : 3,
      })),
    });
  } catch (error) {
    console.error("Error generating notification preview:", error);
    res.status(500).json({ message: "Failed to generate preview" });
  }
};

export const getEvacuationRecommendations = async (req, res) => {
  try {
    const { region, role, blockedRoads } = req.body || {};
    if (!region) {
      return res.status(400).json({ message: "region is required" });
    }

    const routes = buildEvacuationPlan({
      region,
      role: role || req.user.role || "public",
      blockedRoads,
    });

    res.json({
      region,
      totalRoutes: routes.length,
      routes,
      note: "Route plans are advisory. Always follow official on-ground instructions.",
    });
  } catch (error) {
    console.error("Error generating evacuation recommendations:", error);
    res.status(500).json({ message: "Failed to generate evacuation routes" });
  }
};

export const getPreparednessChecklist = async (req, res) => {
  try {
    let checklist = await PreparednessChecklist.findOne({ userId: req.user._id });
    if (!checklist) {
      checklist = await PreparednessChecklist.create({
        userId: req.user._id,
        items: DEFAULT_CHECKLIST,
      });
    }

    const completed = checklist.items.filter((item) => item.completed).length;
    const score = checklist.items.length
      ? Math.round((completed / checklist.items.length) * 100)
      : 0;

    res.json({ ...checklist.toObject(), completionScore: score });
  } catch (error) {
    console.error("Error fetching checklist:", error);
    res.status(500).json({ message: "Failed to fetch checklist" });
  }
};

export const toggleChecklistItem = async (req, res) => {
  try {
    const { key } = req.params;

    let checklist = await PreparednessChecklist.findOne({ userId: req.user._id });
    if (!checklist) {
      checklist = await PreparednessChecklist.create({
        userId: req.user._id,
        items: DEFAULT_CHECKLIST,
      });
    }

    checklist.items = checklist.items.map((item) => {
      if (item.key !== key) return item;
      return {
        ...item.toObject(),
        completed: !item.completed,
        lastCompletedAt: !item.completed ? new Date() : null,
      };
    });

    await checklist.save();

    const completed = checklist.items.filter((item) => item.completed).length;
    const score = checklist.items.length
      ? Math.round((completed / checklist.items.length) * 100)
      : 0;

    res.json({ ...checklist.toObject(), completionScore: score });
  } catch (error) {
    console.error("Error toggling checklist item:", error);
    res.status(500).json({ message: "Failed to update checklist" });
  }
};

export const listResources = async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.query.region) query.region = req.query.region;
    if (req.query.type) query.type = req.query.type;

    let resources = await ResourceCenter.find(query)
      .sort({ updatedAt: -1 })
      .limit(100);

    if (!resources.length) {
      resources = await ResourceCenter.insertMany([
        {
          name: "Central Relief Shelter",
          type: "shelter",
          region: req.query.region || "Odisha",
          city: "Bhubaneswar",
          address: "Sector 7 Community Hall",
          capacity: 350,
          currentOccupancy: 120,
          contact: "+91-9000000001",
        },
        {
          name: "District Emergency Hospital",
          type: "hospital",
          region: req.query.region || "Odisha",
          city: "Bhubaneswar",
          address: "Civil Lines",
          capacity: 120,
          currentOccupancy: 65,
          contact: "+91-9000000002",
        },
        {
          name: "Rapid Ambulance Node",
          type: "ambulance",
          region: req.query.region || "Odisha",
          city: "Bhubaneswar",
          address: "Ring Road Junction",
          capacity: 20,
          currentOccupancy: 8,
          contact: "108",
        },
      ]);
    }

    res.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

export const translateText = async (req, res) => {
  try {
    const language = String(req.query.lang || "en").toLowerCase();
    const text = String(req.query.text || "Emergency Alert");
    const lexicon = TRANSLATIONS[language] || {};

    res.json({
      original: text,
      language,
      translated: lexicon[text] || text,
      supportedLanguages: ["en", ...Object.keys(TRANSLATIONS)],
    });
  } catch (error) {
    console.error("Error translating text:", error);
    res.status(500).json({ message: "Failed to translate text" });
  }
};

export const getForecast = async (req, res) => {
  try {
    const region = req.query.region || "India";

    const latest = await RiskAssessment.find({ "location.region": region })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("overallRisk preparednessScore createdAt");

    const avgRisk = latest.length
      ? Math.round(latest.reduce((sum, row) => sum + row.overallRisk, 0) / latest.length)
      : 52;

    const trendFactor = latest.length > 1
      ? latest[0].overallRisk - latest[latest.length - 1].overallRisk
      : 3;

    const horizons = [24, 48, 72].map((h, idx) => {
      const projectedRisk = Math.max(0, Math.min(100, avgRisk + Math.round((trendFactor / 3) * (idx + 1))));
      return {
        horizonHours: h,
        projectedRisk,
        riskBand: gradeRisk(projectedRisk),
        confidence: Math.max(45, 88 - idx * 12),
      };
    });

    res.json({ region, baseRisk: avgRisk, forecast: horizons });
  } catch (error) {
    console.error("Error generating forecast:", error);
    res.status(500).json({ message: "Failed to generate forecast" });
  }
};

export const getDrillReplay = async (req, res) => {
  try {
    const drill = await Drill.findById(req.params.id);
    if (!drill) {
      return res.status(404).json({ message: "Drill not found" });
    }

    const startedAt = drill.createdAt;
    const durationMinutes = Number(drill.duration || 20);

    const timeline = [
      { minute: 0, event: "Drill initiated", status: "ok" },
      { minute: Math.round(durationMinutes * 0.2), event: "Alert acknowledged by participants", status: "ok" },
      { minute: Math.round(durationMinutes * 0.45), event: "Evacuation to assembly points", status: "ok" },
      { minute: Math.round(durationMinutes * 0.7), event: "Headcount and medical check", status: "warning" },
      { minute: durationMinutes, event: "Debrief and corrective actions", status: "ok" },
    ];

    res.json({
      drillId: drill._id,
      title: drill.title,
      type: drill.type,
      status: drill.status,
      startedAt,
      durationMinutes,
      timeline,
      performance: {
        responseTimeScore: Math.max(40, 92 - durationMinutes),
        coordinationScore: drill.score || 78,
        bottlenecks: ["Exit B congestion", "Late attendance confirmation"],
      },
    });
  } catch (error) {
    console.error("Error creating drill replay:", error);
    res.status(500).json({ message: "Failed to fetch drill replay" });
  }
};

export const listVolunteerTasks = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const query = {};
    if (req.query.region) query.region = req.query.region;
    if (req.query.status) query.status = req.query.status;
    if (req.query.skillRequired) query.skillRequired = req.query.skillRequired;
    if (req.query.priority) query.priority = req.query.priority;

    const sortField = req.query.sortBy === "dueDate" ? "dueDate" : "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const [tasks, total] = await Promise.all([
      VolunteerTask.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate("assignedTo", "name role")
        .populate("createdBy", "name role"),
      VolunteerTask.countDocuments(query),
    ]);

    res.json({
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching volunteer tasks:", error);
    res.status(500).json({ message: "Failed to fetch volunteer tasks" });
  }
};

export const createVolunteerTask = async (req, res) => {
  try {
    if (!isPrivilegedVerifier(req.user.role)) {
      return res.status(403).json({ message: "Only teacher/admin can create volunteer tasks" });
    }

    const payload = req.body || {};
    if (!payload.title || !payload.region) {
      return res.status(400).json({ message: "title and region are required" });
    }

    const task = await VolunteerTask.create({
      title: payload.title,
      description: payload.description || "",
      region: payload.region,
      zone: payload.zone || "",
      skillRequired: payload.skillRequired || "general",
      priority: payload.priority || "p3-medium",
      requiredVolunteers: Number(payload.requiredVolunteers || 1),
      estimatedHours: Number(payload.estimatedHours || 1),
      geofence: {
        latitude: payload.geofence?.latitude ?? null,
        longitude: payload.geofence?.longitude ?? null,
        radiusMeters: Number(payload.geofence?.radiusMeters || 500),
      },
      dueDate: payload.dueDate || null,
      createdBy: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating volunteer task:", error);
    res.status(500).json({ message: "Failed to create volunteer task" });
  }
};

export const updateVolunteerTask = async (req, res) => {
  try {
    if (!isPrivilegedVerifier(req.user.role)) {
      return res.status(403).json({ message: "Only teacher/admin can update volunteer tasks" });
    }

    const updates = req.body || {};
    const nextState = {};

    if (updates.status) nextState.status = updates.status;
    if (updates.assignedTo) nextState.assignedTo = updates.assignedTo;
    if (updates.priority) nextState.priority = updates.priority;
    if (updates.dueDate) nextState.dueDate = updates.dueDate;
    if (updates.completionReport) {
      nextState.completionReport = {
        summary: updates.completionReport.summary || "",
        verified: Boolean(updates.completionReport.verified || false),
        completedAt:
          updates.status === "completed"
            ? new Date()
            : updates.completionReport.completedAt || null,
      };
    } else if (updates.status === "completed") {
      nextState.completionReport = {
        summary: "Task marked completed",
        verified: false,
        completedAt: new Date(),
      };
    }

    const task = await VolunteerTask.findByIdAndUpdate(
      req.params.id,
      { $set: nextState },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error updating volunteer task:", error);
    res.status(500).json({ message: "Failed to update volunteer task" });
  }
};

export const getOfflinePack = async (req, res) => {
  try {
    const region = req.query.region || "India";
    const [resources, checklist, pref] = await Promise.all([
      ResourceCenter.find({ region, isActive: true }).limit(20),
      PreparednessChecklist.findOne({ userId: req.user._id }),
      AlertPreference.findOne({ userId: req.user._id }),
    ]);

    res.json({
      generatedAt: new Date(),
      region,
      emergencyContacts: [
        { name: "National Emergency", number: "112" },
        { name: "Ambulance", number: "108" },
        { name: "Fire", number: "101" },
      ],
      resources,
      checklistItems: checklist?.items || DEFAULT_CHECKLIST,
      alertPreference: pref,
      sop: [
        "Keep emergency kit, IDs, and medicines ready.",
        "Follow official alerts, avoid rumors.",
        "Move to designated shelter when advised.",
      ],
    });
  } catch (error) {
    console.error("Error generating offline pack:", error);
    res.status(500).json({ message: "Failed to generate offline pack" });
  }
};
