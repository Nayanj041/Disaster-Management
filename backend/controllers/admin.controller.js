import User from "../models/user.model.js";
import Module from "../models/module.model.js";
import Drill from "../models/drill.model.js";
import UserProgress from "../models/user.progress.js";
import Progress from "../models/progress.model.js";
import Report from "../models/report.model.js";

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