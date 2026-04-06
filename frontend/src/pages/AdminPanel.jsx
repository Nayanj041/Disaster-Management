"use client"

import { useEffect, useMemo, useState } from "react"
import AnalyticsChart from "../components/admin/AnalyticsChart"
import UserManagement from "../components/admin/UserManagement"
import axiosInstance from "../lib/axios"
import { Users, BookOpen, TrendingUp, Activity, Settings, BarChart3, PieChart, Clock, Shield, Building2 } from "lucide-react"

const toCsv = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (value) => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCell(row[h])).join(","));
  }
  return lines.join("\n");
};

const downloadCsv = (filename, csvContent) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const AdminPanel = () => {
  const rangeOptions = [7, 30, 60, 90]
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedDays, setSelectedDays] = useState(30)
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [regionalRiskMap, setRegionalRiskMap] = useState([])
  const [drillAnalytics, setDrillAnalytics] = useState([])
  const [progressTrends, setProgressTrends] = useState({
    userGrowth: [],
    reportTrend: [],
    moduleCompletions: [],
    avgXpTrend: [],
    avgLevelTrend: [],
  })
  const [preparednessIndex, setPreparednessIndex] = useState({
    statePreparednessIndex: 0,
    regions: [],
    topRegions: [],
    vulnerableRegions: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        const [statsRes, activityRes, riskMapRes, drillAnalyticsRes, trendsRes, psiRes] = await Promise.all([
          axiosInstance.get("/admin/stats"),
          axiosInstance.get("/admin/activity"),
          axiosInstance.get("/risk/region-map"),
          axiosInstance.get("/risk/drill-analytics"),
          axiosInstance.get("/admin/progress-trends", { params: { days: selectedDays } }),
          axiosInstance.get("/admin/preparedness-index", { params: { days: selectedDays } }),
        ])

        setStats(statsRes.data)
        setRecentActivity(Array.isArray(activityRes.data) ? activityRes.data : [])
        setRegionalRiskMap(Array.isArray(riskMapRes.data) ? riskMapRes.data : [])
        setDrillAnalytics(Array.isArray(drillAnalyticsRes.data?.drillsByType) ? drillAnalyticsRes.data.drillsByType : [])
        setProgressTrends({
          userGrowth: Array.isArray(trendsRes.data?.userGrowth) ? trendsRes.data.userGrowth : [],
          reportTrend: Array.isArray(trendsRes.data?.reportTrend) ? trendsRes.data.reportTrend : [],
          moduleCompletions: Array.isArray(trendsRes.data?.moduleCompletions) ? trendsRes.data.moduleCompletions : [],
          avgXpTrend: Array.isArray(trendsRes.data?.avgXpTrend) ? trendsRes.data.avgXpTrend : [],
          avgLevelTrend: Array.isArray(trendsRes.data?.avgLevelTrend) ? trendsRes.data.avgLevelTrend : [],
        })
        setPreparednessIndex({
          statePreparednessIndex: Number(psiRes.data?.statePreparednessIndex || 0),
          regions: Array.isArray(psiRes.data?.regions) ? psiRes.data.regions : [],
          topRegions: Array.isArray(psiRes.data?.topRegions) ? psiRes.data.topRegions : [],
          vulnerableRegions: Array.isArray(psiRes.data?.vulnerableRegions) ? psiRes.data.vulnerableRegions : [],
        })
      } catch (error) {
        console.error("Failed to load admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [selectedDays])

  const analyticsData = useMemo(() => {
    if (!stats) {
      return {
        userGrowth: [],
        userRoles: [],
        moduleCompletion: [],
        engagementTrends: [],
      }
    }

    return {
      userGrowth: [
        { name: "Total", value: stats.totalUsers || 0 },
        { name: "Active", value: stats.activeUsers || 0 },
      ],
      userRoles: [
        { name: "Students", value: stats.roleCounts?.student || 0 },
        { name: "Teachers", value: stats.roleCounts?.teacher || 0 },
        { name: "Admins", value: stats.roleCounts?.admin || 0 },
      ],
      moduleCompletion: [
        { name: "Completed Sessions", value: stats.completedSessions || 0 },
        { name: "Modules", value: stats.modulesCount || 0 },
        { name: "Drills", value: stats.drillsCount || 0 },
      ],
      engagementTrends: [
        { name: "Avg Score", value: stats.averageScore || 0 },
        { name: "Uptime", value: stats.systemUptime || 0 },
        { name: "Avg XP", value: stats.avgXp || 0 },
        { name: "Avg Level", value: stats.avgLevel || 0 },
      ],
    }
  }, [stats])

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "User Management", icon: Users },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "government", label: "Government", icon: Building2 },
    { id: "system", label: "System Settings", icon: Settings },
  ]

  const statCards = [
    {
      title: "Total Users",
      value: (stats?.totalUsers || 0).toLocaleString(),
      change: "+12%",
      changeType: "positive",
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Users",
      value: (stats?.activeUsers || 0).toLocaleString(),
      change: "+8%",
      changeType: "positive",
      icon: Activity,
      color: "green",
    },
    {
      title: "Completed Sessions",
      value: (stats?.completedSessions || 0).toLocaleString(),
      change: "+23%",
      changeType: "positive",
      icon: BookOpen,
      color: "purple",
    },
    {
      title: "Average Score",
      value: `${stats?.averageScore || 0}%`,
      change: "+2.1%",
      changeType: "positive",
      icon: TrendingUp,
      color: "orange",
    },
    {
      title: "Module Completion Rate",
      value: `${stats?.moduleCompletionRate || 0}%`,
      change: "+4.7%",
      changeType: "positive",
      icon: BookOpen,
      color: "green",
    },
    {
      title: "Reports Logged",
      value: (stats?.totalReports || 0).toLocaleString(),
      change: "+9%",
      changeType: "positive",
      icon: Activity,
      color: "blue",
    },
  ]

  const getStatColor = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
    }
    return colors[color] || colors.blue
  }

  const exportAnalyticsCsv = () => {
    const regionRows = regionalRiskMap.map((r) => ({
      section: "regional_risk",
      region: r.region,
      averageRisk: r.averageRisk,
      preparednessScore: r.preparednessScore,
      assessments: r.assessments,
    }));

    const drillRows = drillAnalytics.map((d) => ({
      section: "drill_analytics",
      type: d.type,
      total: d.total,
      completed: d.completed,
      completionRate: d.completionRate,
      avgScore: d.avgScore,
    }));

    const summaryRows = [
      {
        section: "summary",
        totalUsers: stats?.totalUsers || 0,
        activeUsers: stats?.activeUsers || 0,
        completedSessions: stats?.completedSessions || 0,
        averageScore: stats?.averageScore || 0,
      },
    ];

    const csv = toCsv([...summaryRows, ...regionRows, ...drillRows]);
    downloadCsv("admin-analytics-report.csv", csv);
  };

  const exportAnalyticsPdf = () => {
    const reportWindow = window.open("", "_blank", "width=1024,height=768");
    if (!reportWindow) return;

    const regionTable = regionalRiskMap
      .map(
        (r) =>
          `<tr><td>${r.region}</td><td>${r.averageRisk}</td><td>${r.preparednessScore}</td><td>${r.assessments}</td></tr>`
      )
      .join("");
    const drillTable = drillAnalytics
      .map(
        (d) =>
          `<tr><td>${d.type}</td><td>${d.total}</td><td>${d.completed}</td><td>${d.completionRate}%</td><td>${d.avgScore}</td></tr>`
      )
      .join("");

    reportWindow.document.write(`
      <html>
        <head>
          <title>Admin Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1, h2 { margin: 0 0 12px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
            .meta { margin-bottom: 16px; color: #4b5563; }
          </style>
        </head>
        <body>
          <h1>Admin Analytics Report</h1>
          <div class="meta">Generated: ${new Date().toLocaleString()}</div>

          <h2>Summary</h2>
          <table>
            <tr><th>Total Users</th><th>Active Users</th><th>Completed Sessions</th><th>Average Score</th></tr>
            <tr><td>${stats?.totalUsers || 0}</td><td>${stats?.activeUsers || 0}</td><td>${stats?.completedSessions || 0}</td><td>${stats?.averageScore || 0}</td></tr>
          </table>

          <h2>Regional Risk Mapping</h2>
          <table>
            <tr><th>Region</th><th>Average Risk</th><th>Preparedness Score</th><th>Assessments</th></tr>
            ${regionTable}
          </table>

          <h2>Drill Participation Analytics</h2>
          <table>
            <tr><th>Type</th><th>Total</th><th>Completed</th><th>Completion Rate</th><th>Avg Score</th></tr>
            ${drillTable}
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  };

  const exportGeneratedReportCsv = async () => {
    try {
      const response = await axiosInstance.get("/admin/reports/generate", {
        params: { days: selectedDays, format: "csv" },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `admin-generated-report-${selectedDays}d.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export generated report:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 py-8 px-4">Loading admin dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Platform management and analytics dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-1">
                {rangeOptions.map((days) => (
                  <button
                    key={days}
                    onClick={() => setSelectedDays(days)}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedDays === days
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
              <button
                onClick={exportAnalyticsCsv}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Export CSV
              </button>
              <button
                onClick={exportAnalyticsPdf}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Export PDF
              </button>
              <button
                onClick={exportGeneratedReportCsv}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* System Status Banner */}
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">System Status: Operational</h3>
              <p className="text-sm text-green-700">
                Uptime: {stats?.systemUptime || 0}% | All services running normally
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm border">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <span
                            className={`text-sm font-medium ${
                              stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">vs last month</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${getStatColor(stat.color)} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart type="line" data={progressTrends.userGrowth} title={`User Growth Over Time (${selectedDays}d)`} color="#3B82F6" />
              <AnalyticsChart type="pie" data={analyticsData.userRoles} title="User Distribution" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart type="line" data={progressTrends.reportTrend} title={`Reports Logged Over Time (${selectedDays}d)`} color="#EF4444" />
              <AnalyticsChart type="line" data={progressTrends.moduleCompletions} title={`Module Completions Over Time (${selectedDays}d)`} color="#10B981" />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <UserManagement />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart
                type="bar"
                data={analyticsData.moduleCompletion}
                title="Module Completion Rates"
                color="#10B981"
              />
              <AnalyticsChart
                type="line"
                data={progressTrends.avgXpTrend}
                title={`Average XP Trend (${selectedDays}d)`}
                color="#8B5CF6"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart
                type="line"
                data={progressTrends.avgLevelTrend}
                title={`Average Level Trend (${selectedDays}d)`}
                color="#06B6D4"
              />
              <AnalyticsChart
                type="bar"
                data={analyticsData.engagementTrends}
                title="Dashboard Statistics Snapshot"
                color="#F59E0B"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Risk Mapping</h3>
                <div className="space-y-3">
                  {regionalRiskMap.slice(0, 8).map((row) => (
                    <div key={row.region} className="flex items-center justify-between p-3 rounded border bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{row.region}</p>
                        <p className="text-sm text-gray-600">Assessments: {row.assessments}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Risk: {row.averageRisk}</p>
                        <p className="text-sm text-gray-600">Preparedness: {row.preparednessScore}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Drill Participation Analytics</h3>
                <div className="space-y-3">
                  {drillAnalytics.map((row) => (
                    <div key={row.type} className="flex items-center justify-between p-3 rounded border bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{row.type}</p>
                        <p className="text-sm text-gray-600">Total Drills: {row.total}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Completion: {row.completionRate}%</p>
                        <p className="text-sm text-gray-600">Avg Score: {row.avgScore}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === "government" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg shadow-sm p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Government Control Panel</h2>
              <p className="text-slate-200">Preparedness Score Index (PSI) and district-level resilience intelligence.</p>
              <div className="mt-4 inline-flex rounded-lg bg-white/10 px-4 py-2 text-sm">
                State Preparedness Index: <span className="ml-2 font-semibold">{preparednessIndex.statePreparednessIndex}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Regions</h3>
                <div className="space-y-3">
                  {preparednessIndex.topRegions.map((row) => (
                    <div key={`top-${row.region}`} className="flex items-center justify-between rounded border bg-green-50 p-3">
                      <div>
                        <p className="font-medium text-gray-900">{row.region}</p>
                        <p className="text-xs text-gray-600">TCR {row.trainingCompletionRate}% · DES {row.drillEffectivenessScore}</p>
                      </div>
                      <div className="text-lg font-bold text-green-700">{row.preparednessIndex}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Intervention Regions</h3>
                <div className="space-y-3">
                  {preparednessIndex.vulnerableRegions.map((row) => (
                    <div key={`risk-${row.region}`} className="flex items-center justify-between rounded border bg-red-50 p-3">
                      <div>
                        <p className="font-medium text-gray-900">{row.region}</p>
                        <p className="text-xs text-gray-600">Risk Exposure {row.riskExposureWeight} · IRS {row.incidentResponseScore}</p>
                      </div>
                      <div className="text-lg font-bold text-red-700">{row.preparednessIndex}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Region-wise Preparedness Index (PSI)</h3>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-600">
                      <th className="py-2 pr-3">Region</th>
                      <th className="py-2 pr-3">PSI</th>
                      <th className="py-2 pr-3">Training %</th>
                      <th className="py-2 pr-3">Drill Score</th>
                      <th className="py-2 pr-3">Incident Response</th>
                      <th className="py-2 pr-3">Risk Exposure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preparednessIndex.regions.map((row) => (
                      <tr key={`psi-${row.region}`} className="border-b">
                        <td className="py-2 pr-3 font-medium text-gray-900">{row.region}</td>
                        <td className="py-2 pr-3 text-gray-900">{row.preparednessIndex}</td>
                        <td className="py-2 pr-3 text-gray-700">{row.trainingCompletionRate}%</td>
                        <td className="py-2 pr-3 text-gray-700">{row.drillEffectivenessScore}</td>
                        <td className="py-2 pr-3 text-gray-700">{row.incidentResponseScore}</td>
                        <td className="py-2 pr-3 text-gray-700">{row.riskExposureWeight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === "system" && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">System Settings</h2>
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Panel</h3>
              <p className="text-gray-600">System configuration options will be available here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
