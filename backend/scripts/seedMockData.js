import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";
import Progress from "../models/progress.model.js";
import Module from "../models/module.model.js";
import Drill from "../models/drill.model.js";
import Alert from "../models/alert.model.js";
import ResourceCenter from "../models/resourceCenter.model.js";
import VolunteerTask from "../models/volunteerTask.model.js";

const MOCK_USERS = [
  {
    name: "Aarav Student",
    email: "student1.demo@disasterprep.local",
    password: "Demo@12345",
    role: "student",
    region: "Odisha",
    institution: "City Public School",
  },
  {
    name: "Isha Student",
    email: "student2.demo@disasterprep.local",
    password: "Demo@12345",
    role: "student",
    region: "West Bengal",
    institution: "Riverdale Academy",
  },
  {
    name: "Rohan Teacher",
    email: "teacher1.demo@disasterprep.local",
    password: "Demo@12345",
    role: "teacher",
    region: "Odisha",
    institution: "City Public School",
  },
  {
    name: "Meera Teacher",
    email: "teacher2.demo@disasterprep.local",
    password: "Demo@12345",
    role: "teacher",
    region: "Andhra Pradesh",
    institution: "Coastal Learning Center",
  },
  {
    name: "Admin One",
    email: "admin1.demo@disasterprep.local",
    password: "Demo@12345",
    role: "admin",
    region: "India",
    institution: "DisasterPrep HQ",
  },
  {
    name: "Admin Two",
    email: "admin2.demo@disasterprep.local",
    password: "Demo@12345",
    role: "admin",
    region: "India",
    institution: "DisasterPrep Operations",
  },
];

const buildModule = ({
  title,
  category,
  icon,
  difficulty,
  regions,
  description,
  readingTopic,
  actionTopic,
  warningSign,
}) => ({
  title,
  category,
  icon,
  difficulty,
  regions,
  duration: "45 min",
  description,
  isPublished: true,
  sections: [
    {
      title: `${category} Fundamentals`,
      type: "reading",
      duration: "12 min",
      content: `<h3>${readingTopic}</h3><p>This section explains causes, local risk patterns, and preparedness priorities.</p>`,
      keyPoints: [
        "Understand local risk map and vulnerable zones",
        "Prepare family communication plan",
        "Keep emergency kit ready and updated",
      ],
    },
    {
      title: `Response Actions During ${category}`,
      type: "text",
      duration: "15 min",
      content: `<h3>${actionTopic}</h3><p>Learn immediate actions that reduce injury and improve survival outcomes.</p>`,
      keyPoints: [
        "Follow verified alerts from official channels",
        "Move to safe zones without delay",
        "Avoid panic and assist vulnerable people",
      ],
    },
  ],
  quiz: {
    title: `${category} Safety Assessment`,
    timeLimit: 360,
    questions: [
      {
        question: `What is the first safe action when a ${category.toLowerCase()} threat is confirmed?`,
        options: [
          "Ignore alerts until others react",
          "Follow official safety protocol immediately",
          "Wait for social media rumors",
          "Drive without a route plan",
        ],
        correctAnswer: 1,
        explanation:
          "Official protocols are designed to minimize risk in the first critical minutes.",
      },
      {
        question: `Which is an early warning sign associated with ${category.toLowerCase()} risk?`,
        options: [warningSign, "Festival traffic", "Cloudless noon", "Routine maintenance"],
        correctAnswer: 0,
        explanation: "Recognizing early signs helps communities respond faster.",
      },
    ],
  },
});

const MOCK_MODULES = [
  buildModule({
    title: "Earthquake Preparedness Masterclass",
    category: "earthquake",
    icon: "🌍",
    difficulty: "beginner",
    regions: ["North", "West", "Central"],
    description:
      "End-to-end earthquake readiness including home retrofitting, evacuation, and first response.",
    readingTopic: "Plate Movement and Urban Seismic Risk",
    actionTopic: "Drop, Cover, Hold and Post-Shock Protocol",
    warningSign: "Sudden tremors and structural cracking",
  }),
  buildModule({
    title: "Flood Survival and Evacuation Planning",
    category: "flood",
    icon: "🌊",
    difficulty: "intermediate",
    regions: ["East", "South", "All"],
    description:
      "Flood-level interpretation, safe evacuation routes, shelter readiness, and recovery planning.",
    readingTopic: "Monsoon Patterns and River Basin Risk",
    actionTopic: "High-Ground Evacuation and Shelter Safety",
    warningSign: "Rapid water rise in drains and riverbanks",
  }),
  buildModule({
    title: "Cyclone Readiness for Coastal Communities",
    category: "cyclone",
    icon: "🌀",
    difficulty: "intermediate",
    regions: ["Odisha", "Andhra Pradesh", "Tamil Nadu"],
    description:
      "Prepare homes, schools, and institutions for cyclone alerts, landfall impact, and recovery.",
    readingTopic: "Cyclone Formation and Impact Zones",
    actionTopic: "Pre-Landfall Securing and Safe Shelter",
    warningSign: "Escalating wind bands and official cyclone bulletins",
  }),
  buildModule({
    title: "Fire Safety and Building Evacuation",
    category: "fire",
    icon: "🔥",
    difficulty: "beginner",
    regions: ["All"],
    description:
      "Fire prevention, extinguisher basics, evacuation drills, and emergency coordination.",
    readingTopic: "Common Fire Hazards in Homes and Schools",
    actionTopic: "Alarm, Exit Routes, and Assembly Management",
    warningSign: "Smoke buildup and electrical burn smell",
  }),
  buildModule({
    title: "Tsunami Response and Coastal Evacuation",
    category: "tsunami",
    icon: "🌊",
    difficulty: "advanced",
    regions: ["Coastal"],
    description:
      "Critical tsunami warning interpretation, rapid evacuation, and post-event safety protocols.",
    readingTopic: "Undersea Quakes and Tsunami Waves",
    actionTopic: "Vertical Evacuation and High-Ground Routing",
    warningSign: "Strong offshore quake and sudden sea retreat",
  }),
  buildModule({
    title: "General Disaster Preparedness Foundations",
    category: "general",
    icon: "🛡️",
    difficulty: "beginner",
    regions: ["All"],
    description:
      "Universal preparedness framework for families, institutions, and communities.",
    readingTopic: "Risk Assessment and Resource Planning",
    actionTopic: "Incident Communication and Role Allocation",
    warningSign: "Official emergency advisories",
  }),
];

const buildDrill = ({
  title,
  description,
  type,
  difficulty,
  duration,
  region,
  status,
  instructions,
}) => ({
  title,
  description,
  type,
  difficulty,
  duration,
  region,
  status,
  instructions,
  questions: [
    {
      question: `What is the first priority during a ${type} drill?`,
      options: [
        "Wait for others to react",
        "Follow official drill instructions immediately",
        "Record videos first",
        "Ignore warning signals",
      ],
      correctAnswer: 1,
    },
    {
      question: "Which action improves drill effectiveness?",
      options: [
        "Skipping safety briefing",
        "Practicing assigned roles and communication",
        "Blocking exits",
        "Spreading unverified updates",
      ],
      correctAnswer: 1,
    },
  ],
});

const MOCK_DRILLS = [
  buildDrill({
    title: "Earthquake School Evacuation Drill",
    description:
      "School-wide simulation for earthquake response, safe assembly, and headcount verification.",
    type: "earthquake",
    difficulty: "easy",
    duration: 20,
    region: "Odisha",
    status: "pending",
    instructions:
      "On alarm, perform Drop-Cover-Hold, then evacuate using designated corridors.",
  }),
  buildDrill({
    title: "Flood Community Shelter Drill",
    description:
      "Neighborhood flood response with evacuation route check and temporary shelter activation.",
    type: "flood",
    difficulty: "medium",
    duration: 30,
    region: "West Bengal",
    status: "in-progress",
    instructions:
      "Move to elevated zones, support elderly residents, and verify emergency supplies.",
  }),
  buildDrill({
    title: "Cyclone Coastal Preparedness Drill",
    description:
      "Pre-landfall readiness drill for coastal institutions and public emergency teams.",
    type: "cyclone",
    difficulty: "medium",
    duration: 35,
    region: "Andhra Pradesh",
    status: "pending",
    instructions:
      "Secure facilities, suspend operations, and shift participants to cyclone-safe shelters.",
  }),
  buildDrill({
    title: "Fire Building Exit Drill",
    description:
      "Multi-floor fire safety drill with smoke-safe movement and assembly point coordination.",
    type: "fire",
    difficulty: "easy",
    duration: 15,
    region: "all",
    status: "completed",
    instructions:
      "Activate alarm, avoid elevators, and assemble at marked open area for roll call.",
  }),
  buildDrill({
    title: "Tsunami High-Ground Evacuation Drill",
    description:
      "Rapid evacuation simulation from coastal lowland to vertical/high-ground safe zones.",
    type: "tsunami",
    difficulty: "hard",
    duration: 40,
    region: "Tamil Nadu",
    status: "pending",
    instructions:
      "Follow siren protocol and evacuate immediately using pre-mapped safe routes.",
  }),
];

const MOCK_ALERTS = [
  {
    type: "Heavy Rainfall Warning",
    severity: "High",
    region: "Odisha",
    message:
      "IMD indicates heavy to very heavy rainfall in coastal districts for the next 24 hours.",
    source: "IMD",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "Active",
  },
  {
    type: "Cyclone Watch",
    severity: "Critical",
    region: "Andhra Pradesh",
    message:
      "Cyclone watch issued. Authorities advise preparedness and possible evacuation for vulnerable zones.",
    source: "NDMA",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: "Active",
  },
  {
    type: "River Level Advisory",
    severity: "Medium",
    region: "West Bengal",
    message:
      "River level rising steadily. Low-lying communities should stay alert for further instructions.",
    source: "State Disaster Cell",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    status: "Active",
  },
  {
    type: "Heatwave Alert",
    severity: "Medium",
    region: "India",
    message:
      "Daytime temperatures expected above normal. Stay hydrated and avoid direct exposure.",
    source: "IMD",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    status: "Active",
  },
  {
    type: "Earthquake Preparedness Advisory",
    severity: "Low",
    region: "North",
    message:
      "No active threat. Conduct institutional preparedness checks and drill verification this week.",
    source: "NDMA",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "Active",
  },
];

const MOCK_RESOURCES = [
  {
    name: "Bhubaneswar Mega Shelter",
    type: "shelter",
    region: "Odisha",
    city: "Bhubaneswar",
    address: "Unit 9 Community Complex",
    capacity: 500,
    currentOccupancy: 120,
    contact: "+91-9001001001",
  },
  {
    name: "Kolkata Emergency Medical Hub",
    type: "hospital",
    region: "West Bengal",
    city: "Kolkata",
    address: "Sector V Emergency Block",
    capacity: 220,
    currentOccupancy: 95,
    contact: "+91-9001001002",
  },
  {
    name: "Visakhapatnam Relief Logistics Center",
    type: "relief",
    region: "Andhra Pradesh",
    city: "Visakhapatnam",
    address: "Port Road Warehouse 2",
    capacity: 300,
    currentOccupancy: 110,
    contact: "+91-9001001003",
  },
];

const buildVolunteerTask = ({
  title,
  region,
  skillRequired,
  zone,
  priority = "p3-medium",
  requiredVolunteers = 2,
  estimatedHours = 3,
  daysAhead = 1,
}) => ({
  title,
  description: "Priority disaster-response assignment for trained volunteers.",
  region,
  zone,
  skillRequired,
  priority,
  requiredVolunteers,
  estimatedHours,
  status: "open",
  dueDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
});

const MOCK_VOLUNTEER_TASKS = [
  buildVolunteerTask({
    title: "Distribute medical kits to flood-prone wards",
    region: "Odisha",
    skillRequired: "medical",
    zone: "Ward 11",
    priority: "p1-critical",
    requiredVolunteers: 6,
    estimatedHours: 5,
    daysAhead: 2,
  }),
  buildVolunteerTask({
    title: "Shelter logistics and inventory verification",
    region: "West Bengal",
    skillRequired: "logistics",
    zone: "Shelter Zone B",
    priority: "p2-high",
    requiredVolunteers: 4,
    estimatedHours: 4,
    daysAhead: 1,
  }),
  buildVolunteerTask({
    title: "Coastal evacuation communication support",
    region: "Andhra Pradesh",
    skillRequired: "communications",
    zone: "Coastal Belt",
    priority: "p2-high",
    requiredVolunteers: 3,
    estimatedHours: 3,
    daysAhead: 3,
  }),
];

const upsertUsers = async () => {
  const createdUsers = [];

  for (const userData of MOCK_USERS) {
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create(userData);
    }
    createdUsers.push(user);

    await Progress.findOneAndUpdate(
      { userId: user._id },
      {
        $setOnInsert: {
          userId: user._id,
          xp: 0,
          level: 1,
          completedModules: 0,
          perfectQuizzes: 0,
          drillsCompleted: 0,
          dailyStreak: 0,
          earnedBadges: [],
        },
      },
      { upsert: true, new: true }
    );
  }

  return createdUsers;
};

const upsertModules = async () => {
  for (const moduleData of MOCK_MODULES) {
    await Module.findOneAndUpdate(
      { title: moduleData.title },
      { $set: moduleData },
      { upsert: true, new: true }
    );
  }
};

const upsertDrills = async (users) => {
  const admins = users.filter((u) => u.role === "admin");
  const students = users.filter((u) => u.role === "student");

  for (let i = 0; i < MOCK_DRILLS.length; i++) {
    const drillData = MOCK_DRILLS[i];
    const admin = admins[i % Math.max(admins.length, 1)] || null;
    const student = students[i % Math.max(students.length, 1)] || null;

    await Drill.findOneAndUpdate(
      { title: drillData.title },
      {
        $set: {
          ...drillData,
          createdBy: admin?._id,
          userId: student?._id,
          date: new Date(Date.now() - i * 6 * 60 * 60 * 1000),
          score: drillData.status === "completed" ? 85 : 0,
        },
      },
      { upsert: true, new: true }
    );
  }
};

const upsertAlerts = async () => {
  for (const alertData of MOCK_ALERTS) {
    await Alert.findOneAndUpdate(
      {
        type: alertData.type,
        region: alertData.region,
        source: alertData.source,
      },
      { $set: alertData },
      { upsert: true, new: true }
    );
  }
};

const upsertResources = async () => {
  for (const resource of MOCK_RESOURCES) {
    await ResourceCenter.findOneAndUpdate(
      { name: resource.name, region: resource.region },
      { $set: { ...resource, isActive: true } },
      { upsert: true, new: true }
    );
  }
};

const upsertVolunteerTasks = async (users) => {
  const teacherOrAdmin = users.find((u) => ["teacher", "admin"].includes(u.role));
  if (!teacherOrAdmin) return;

  for (const task of MOCK_VOLUNTEER_TASKS) {
    await VolunteerTask.findOneAndUpdate(
      { title: task.title, region: task.region },
      {
        $set: {
          ...task,
          createdBy: teacherOrAdmin._id,
        },
      },
      { upsert: true, new: true }
    );
  }
};

const main = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is missing. Add it in backend/.env");
    }

    await connectDB();

    const users = await upsertUsers();
    await upsertModules();
    await upsertDrills(users);
    await upsertAlerts();
    await upsertResources();
    await upsertVolunteerTasks(users);

    const roleSummary = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      { student: 0, teacher: 0, admin: 0 }
    );

    console.log("Mock data seeded successfully.");
    console.log("Users by role:", roleSummary);
    console.log("Modules seeded:", MOCK_MODULES.length);
    console.log("Drills seeded:", MOCK_DRILLS.length);
    console.log("Alerts seeded:", MOCK_ALERTS.length);
    console.log("Resources seeded:", MOCK_RESOURCES.length);
    console.log("Volunteer tasks seeded:", MOCK_VOLUNTEER_TASKS.length);
    console.log("Demo password for all users: Demo@12345");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

main();