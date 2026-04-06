import User from "../models/user.model.js";
import Module from "../models/module.model.js";
import Drill from "../models/drill.model.js";
import UserProgress from "../models/user.progress.js";
import Progress from "../models/progress.model.js";
import Report from "../models/report.model.js";
import RiskAssessment from "../models/riskAssessment.model.js";

const toDayString = (date) => new Date(date).toISOString().slice(0, 10);

const buildTimeline = (days) => {
  const points = [];
  const end = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    points.push(toDayString(d));
  }
  return points;
};

const seriesFromMap = (timeline, map, key = "value") =>
  timeline.map((day) => ({ name: day, [key]: map.get(day) || 0 }));

export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, modulesCount, drillsCount, progressRows, users, totalReports] =
      await Promise.all([
        User.countDocuments(),
        Module.countDocuments(),
        Drill.countDocuments(),
        UserProgress.find(),
        User.find().select("role"),
        Report.countDocuments(),
      ]);

    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    const completedSessions = progressRows.filter((p) => p.status === "complete").length;
    const moduleCompletionRate = progressRows.length
      ? Math.round((completedSessions / progressRows.length) * 100)
      : 0;
    const averageScore = progressRows.length
      ? Math.round(
          progressRows.reduce((sum, row) => sum + (row.score || 0), 0) /
            progressRows.length
        )
      : 0;

    const [averageXpResult, averageLevelResult] = await Promise.all([
      Progress.aggregate([{ $group: { _id: null, avgXp: { $avg: "$xp" } } }]),
      Progress.aggregate([{ $group: { _id: null, avgLevel: { $avg: "$level" } } }]),
    ]);

    const avgXp = Math.round(averageXpResult[0]?.avgXp || 0);
    const avgLevel = Number((averageLevelResult[0]?.avgLevel || 0).toFixed(1));

    const roleCounts = users.reduce(
      (acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      },
      { student: 0, teacher: 0, admin: 0 }
    );

    res.json({
      totalUsers,
      activeUsers,
      completedSessions,
      moduleCompletionRate,
      averageScore,
      totalReports,
      avgXp,
      avgLevel,
      modulesCount,
      drillsCount,
      roleCounts,
      systemUptime: 99.9,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name role createdAt");

    const activity = recentUsers.map((u) => ({
      id: String(u._id),
      user: u.name,
      action: "joined the platform",
      timestamp: u.createdAt,
      icon: "👤",
    }));

    res.json(activity);
  } catch (error) {
    console.error("Error fetching admin activity:", error);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role stats createdAt updatedAt").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getProgressTrends = async (req, res) => {
  try {
    const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
    const timeline = buildTimeline(days);
    const startDate = new Date(`${timeline[0]}T00:00:00.000Z`);

    const [userGrowthRaw, reportTrendRaw, completionTrendRaw, progressTrendRaw] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Report.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            count: { $sum: 1 },
          },
        },
      ]),
      UserProgress.aggregate([
        {
          $match: {
            status: "complete",
            updatedAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Progress.aggregate([
        { $match: { lastUpdated: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastUpdated" } },
            avgXp: { $avg: "$xp" },
            avgLevel: { $avg: "$level" },
          },
        },
      ]),
    ]);

    const userGrowthMap = new Map(userGrowthRaw.map((row) => [row._id, row.count]));
    const reportTrendMap = new Map(reportTrendRaw.map((row) => [row._id, row.count]));
    const completionMap = new Map(completionTrendRaw.map((row) => [row._id, row.count]));
    const avgXpMap = new Map(
      progressTrendRaw.map((row) => [row._id, Math.round(row.avgXp || 0)])
    );
    const avgLevelMap = new Map(
      progressTrendRaw.map((row) => [row._id, Number((row.avgLevel || 0).toFixed(1))])
    );

    res.json({
      days,
      timeline,
      userGrowth: seriesFromMap(timeline, userGrowthMap),
      reportTrend: seriesFromMap(timeline, reportTrendMap),
      moduleCompletions: seriesFromMap(timeline, completionMap),
      avgXpTrend: seriesFromMap(timeline, avgXpMap),
      avgLevelTrend: seriesFromMap(timeline, avgLevelMap),
    });
  } catch (error) {
    console.error("Error fetching progress trends:", error);
    res.status(500).json({ message: "Failed to fetch progress trends" });
  }
};

export const generateAnalyticsReport = async (req, res) => {
  try {
    const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [usersInPeriod, reportsInPeriod, completedInPeriod, topRegions, severityBreakdown] =
      await Promise.all([
        User.countDocuments({ createdAt: { $gte: startDate } }),
        Report.countDocuments({ timestamp: { $gte: startDate } }),
        UserProgress.countDocuments({ status: "complete", updatedAt: { $gte: startDate } }),
        User.aggregate([
          { $group: { _id: "$region", users: { $sum: 1 } } },
          { $sort: { users: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, region: "$_id", users: 1 } },
        ]),
        Report.aggregate([
          { $group: { _id: "$severity", count: { $sum: 1 } } },
          { $project: { _id: 0, severity: "$_id", count: 1 } },
        ]),
      ]);

    const payload = {
      generatedAt: new Date().toISOString(),
      periodDays: days,
      summary: {
        usersInPeriod,
        reportsInPeriod,
        completedModulesInPeriod: completedInPeriod,
      },
      topRegions,
      reportSeverityBreakdown: severityBreakdown,
    };

    if (String(req.query.format || "json").toLowerCase() === "csv") {
      const rows = [
        ["metric", "value"],
        ["generatedAt", payload.generatedAt],
        ["periodDays", String(payload.periodDays)],
        ["usersInPeriod", String(payload.summary.usersInPeriod)],
        ["reportsInPeriod", String(payload.summary.reportsInPeriod)],
        ["completedModulesInPeriod", String(payload.summary.completedModulesInPeriod)],
      ];

      for (const region of payload.topRegions) {
        rows.push([`topRegion:${region.region}`, String(region.users)]);
      }
      for (const sev of payload.reportSeverityBreakdown) {
        rows.push([`severity:${sev.severity}`, String(sev.count)]);
      }

      const csv = rows.map((row) => row.join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=analytics-report-${days}d.csv`);
      return res.status(200).send(csv);
    }

    res.json(payload);
  } catch (error) {
    console.error("Error generating analytics report:", error);
    res.status(500).json({ message: "Failed to generate analytics report" });
  }
};

export const getPreparednessIndex = async (req, res) => {
  try {
    const sinceDays = Math.min(180, Math.max(7, Number(req.query.days) || 90));
    const since = new Date();
    since.setDate(since.getDate() - sinceDays);

    const [userRows, progressRows, moduleRows, drillRows, riskRows] = await Promise.all([
      User.find().select("_id region role"),
      Progress.find().select("userId completedModules drillsCompleted"),
      UserProgress.find({ updatedAt: { $gte: since } }).select("userId status score updatedAt"),
      Drill.find({ updatedAt: { $gte: since } }).select("region status score updatedAt"),
      RiskAssessment.find({ createdAt: { $gte: since } }).select("location.region overallRisk createdAt"),
    ]);

    const userRegionMap = new Map();
    const regionStats = new Map();

    const ensureRegion = (region) => {
      const key = String(region || "Unknown");
      if (!regionStats.has(key)) {
        regionStats.set(key, {
          region: key,
          users: 0,
          trainingUsers: new Set(),
          moduleCompletions: 0,
          drillEvents: 0,
          drillCompleted: 0,
          drillScoreTotal: 0,
          drillScoreCount: 0,
          riskTotal: 0,
          riskCount: 0,
        });
      }
      return regionStats.get(key);
    };

    for (const u of userRows) {
      const region = u.region || "Unknown";
      userRegionMap.set(String(u._id), region);
      const bucket = ensureRegion(region);
      bucket.users += 1;
    }

    for (const row of progressRows) {
      const userId = String(row.userId);
      const region = userRegionMap.get(userId);
      if (!region) continue;
      const bucket = ensureRegion(region);
      const completedModules = Number(row.completedModules || 0);
      const completedDrills = Number(row.drillsCompleted || 0);
      if (completedModules > 0 || completedDrills > 0) {
        bucket.trainingUsers.add(userId);
      }
      bucket.moduleCompletions += completedModules;
      bucket.drillCompleted += completedDrills;
    }

    for (const row of moduleRows) {
      if (row.status !== "complete") continue;
      const region = userRegionMap.get(String(row.userId));
      if (!region) continue;
      const bucket = ensureRegion(region);
      bucket.moduleCompletions += 1;
      bucket.trainingUsers.add(String(row.userId));
    }

    for (const drill of drillRows) {
      const bucket = ensureRegion(drill.region || "Unknown");
      bucket.drillEvents += 1;
      if (drill.status === "completed") {
        bucket.drillCompleted += 1;
      }
      if (Number.isFinite(drill.score)) {
        bucket.drillScoreTotal += Number(drill.score || 0);
        bucket.drillScoreCount += 1;
      }
    }

    for (const risk of riskRows) {
      const bucket = ensureRegion(risk?.location?.region || "Unknown");
      bucket.riskTotal += Number(risk.overallRisk || 0);
      bucket.riskCount += 1;
    }

    const rows = Array.from(regionStats.values()).map((bucket) => {
      const users = Math.max(1, bucket.users);
      const trainingCompletionRate = Math.min(
        100,
        Math.round((bucket.trainingUsers.size / users) * 100)
      );
      const drillEffectivenessScore = bucket.drillScoreCount
        ? Math.round(bucket.drillScoreTotal / bucket.drillScoreCount)
        : bucket.drillEvents
          ? Math.round((bucket.drillCompleted / Math.max(1, bucket.drillEvents)) * 100)
          : 0;
      const incidentResponseScore = Math.min(
        100,
        Math.round(
          (Math.min(bucket.moduleCompletions / users, 1) * 55) +
            (Math.min(bucket.drillCompleted / users, 1) * 45)
        )
      );
      const riskExposureWeight = bucket.riskCount
        ? Math.round(bucket.riskTotal / bucket.riskCount)
        : 50;

      const preparednessIndex = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            trainingCompletionRate * 0.35 +
              drillEffectivenessScore * 0.30 +
              incidentResponseScore * 0.20 +
              (100 - riskExposureWeight) * 0.15
          )
        )
      );

      return {
        region: bucket.region,
        users: bucket.users,
        trainingCompletionRate,
        drillEffectivenessScore,
        incidentResponseScore,
        riskExposureWeight,
        preparednessIndex,
      };
    });

    rows.sort((a, b) => b.preparednessIndex - a.preparednessIndex);

    const statePreparednessIndex = rows.length
      ? Math.round(rows.reduce((sum, r) => sum + r.preparednessIndex, 0) / rows.length)
      : 0;

    res.json({
      sinceDays,
      statePreparednessIndex,
      topRegions: rows.slice(0, 5),
      vulnerableRegions: [...rows].sort((a, b) => a.preparednessIndex - b.preparednessIndex).slice(0, 5),
      regions: rows,
    });
  } catch (error) {
    console.error("Error fetching preparedness index:", error);
    res.status(500).json({ message: "Failed to fetch preparedness index" });
  }
};