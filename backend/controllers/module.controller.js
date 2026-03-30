import Module from "../models/module.model.js";
import UserProgress from "../models/user.progress.js";
import Progress from "../models/progress.model.js";
import User from "../models/user.model.js";

const DEFAULT_MODULES = [
  {
    title: "Earthquake Preparedness Basics",
    description:
      "Learn safety actions before, during, and after an earthquake.",
    category: "Earthquake",
    icon: "🌍",
    duration: "40 min",
    difficulty: "beginner",
    regions: ["North", "West", "Central"],
    rating: 4.7,
    enrolled: 210,
    sections: [
      {
        title: "What Causes Earthquakes",
        type: "reading",
        duration: "8 min",
        content:
          "<h3>Understanding Earthquakes</h3><p>Earthquakes happen because tectonic plates shift suddenly. Preparedness reduces injury and panic.</p>",
        keyPoints: [
          "Keep heavy objects secured",
          "Prepare an emergency kit",
          "Practice family evacuation drills",
        ],
      },
      {
        title: "Drop, Cover, and Hold",
        type: "video",
        duration: "6 min",
        content:
          "<p>Watch and practice the Drop-Cover-Hold technique in homes, schools, and workplaces.</p>",
      },
    ],
    quiz: {
      title: "Earthquake Readiness Quiz",
      timeLimit: 300,
      questions: [
        {
          question: "What is the safest immediate action during shaking?",
          options: [
            "Run to stairs",
            "Drop, cover, and hold",
            "Use elevator",
            "Stand near windows",
          ],
          correctAnswer: 1,
          explanation:
            "Drop, cover, and hold protects you from falling debris and glass.",
        },
        {
          question: "Which item belongs in a go-bag?",
          options: ["Firecrackers", "Water and first aid", "Perfume", "Laptop charger only"],
          correctAnswer: 1,
          explanation: "Emergency essentials include water, first aid, and basic supplies.",
        },
      ],
    },
  },
  {
    title: "Flood Safety and Evacuation",
    description:
      "Build practical flood response skills including safe routes and warning interpretation.",
    category: "Flood",
    icon: "🌊",
    duration: "50 min",
    difficulty: "intermediate",
    regions: ["East", "South", "All"],
    rating: 4.6,
    enrolled: 180,
    sections: [
      {
        title: "Flood Warning Levels",
        type: "reading",
        duration: "10 min",
        content:
          "<h3>Warning Levels</h3><p>Understand watch, alert, and evacuation notices. Early action is critical.</p>",
        keyPoints: [
          "Track official alerts",
          "Avoid low-lying roads",
          "Know nearest shelter",
        ],
      },
      {
        title: "Safe Evacuation Planning",
        type: "text",
        duration: "12 min",
        content:
          "<p>Prepare routes, communication plans, and emergency contacts before monsoon season.</p>",
      },
    ],
    quiz: {
      title: "Flood Response Quiz",
      timeLimit: 360,
      questions: [
        {
          question: "What should you avoid during urban flooding?",
          options: ["High ground", "Fast-moving water", "Emergency radio", "Early evacuation"],
          correctAnswer: 1,
          explanation: "Even shallow fast-moving water can be deadly.",
        },
      ],
    },
  },
];

const ensureSeedModules = async () => {
  const count = await Module.countDocuments();
  if (count === 0) {
    await Module.insertMany(DEFAULT_MODULES);
  }
};

const getScoreFromAnswers = (moduleDoc, answers) => {
  if (!Array.isArray(answers) || !moduleDoc?.quiz?.questions?.length) {
    return 0;
  }

  const correct = moduleDoc.quiz.questions.reduce((acc, q, idx) => {
    return acc + (answers[idx] === q.correctAnswer ? 1 : 0);
  }, 0);

  return Math.round((correct / moduleDoc.quiz.questions.length) * 100);
};

export const getModules = async (req, res) => {
  try {
    await ensureSeedModules();

    const modules = await Module.find({ isPublished: true }).sort({ createdAt: -1 });
    const progressRows = await UserProgress.find({ userId: req.user._id });

    const progressMap = new Map(
      progressRows.map((row) => [String(row.moduleId), row])
    );

    const response = modules.map((m) => {
      const p = progressMap.get(String(m._id));
      const progress = p?.status === "complete" ? 100 : p?.lastSection ? 60 : 0;
      return {
        ...m.toObject(),
        progress,
      };
    });

    res.json(response);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ message: "Failed to fetch modules" });
  }
};

export const getModuleById = async (req, res) => {
  try {
    await ensureSeedModules();

    const moduleDoc = await Module.findById(req.params.id);
    if (!moduleDoc || !moduleDoc.isPublished) {
      return res.status(404).json({ message: "Module not found" });
    }

    const progressRow = await UserProgress.findOne({
      userId: req.user._id,
      moduleId: moduleDoc._id,
    });

    res.json({
      ...moduleDoc.toObject(),
      progress: progressRow?.status === "complete" ? 100 : progressRow?.lastSection ? 60 : 0,
    });
  } catch (error) {
    console.error("Error fetching module by id:", error);
    res.status(500).json({ message: "Failed to fetch module" });
  }
};

export const createModule = async (req, res) => {
  try {
    const moduleDoc = await Module.create(req.body);
    res.status(201).json(moduleDoc);
  } catch (error) {
    console.error("Error creating module:", error);
    res.status(500).json({ message: "Failed to create module" });
  }
};

export const updateModuleProgress = async (req, res) => {
  try {
    const { completed, sectionId } = req.body;

    const progress = await UserProgress.findOneAndUpdate(
      {
        userId: req.user._id,
        moduleId: req.params.id,
      },
      {
        $set: {
          status: completed ? "complete" : "incomplete",
          lastSection: sectionId ?? null,
        },
      },
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (error) {
    console.error("Error updating module progress:", error);
    res.status(500).json({ message: "Failed to update progress" });
  }
};

export const submitModuleQuiz = async (req, res) => {
  try {
    const moduleDoc = await Module.findById(req.params.id);
    if (!moduleDoc) {
      return res.status(404).json({ message: "Module not found" });
    }

    const score =
      typeof req.body.score === "number"
        ? req.body.score
        : getScoreFromAnswers(moduleDoc, req.body.answers);

    const existing = await UserProgress.findOne({
      userId: req.user._id,
      moduleId: req.params.id,
    });
    const wasComplete = existing?.status === "complete";

    await UserProgress.findOneAndUpdate(
      {
        userId: req.user._id,
        moduleId: req.params.id,
      },
      {
        $set: {
          status: "complete",
          score,
          lastSection: null,
        },
      },
      { upsert: true, new: true }
    );

    const xpGain = score >= 80 ? 120 : 80;

    const gamification = await Progress.findOneAndUpdate(
      { userId: req.user._id },
      {
        $inc: {
          xp: xpGain,
          completedModules: wasComplete ? 0 : 1,
          perfectQuizzes: score === 100 ? 1 : 0,
        },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true, new: true }
    );

    gamification.level = Math.floor(gamification.xp / 1000) + 1;
    await gamification.save();

    await User.findByIdAndUpdate(req.user._id, {
      "stats.xp": gamification.xp,
      "stats.level": gamification.level,
      "stats.badges": gamification.earnedBadges.length,
      "stats.drillsCompleted": gamification.drillsCompleted,
    });

    res.json({ message: "Quiz submitted successfully", score, xpGain });
  } catch (error) {
    console.error("Error submitting module quiz:", error);
    res.status(500).json({ message: "Failed to submit quiz" });
  }
};