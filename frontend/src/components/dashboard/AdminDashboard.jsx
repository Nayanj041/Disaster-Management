"use client";

import { useAuth } from "../../context/AuthProvider";
import StatCard from "./StatCard";
import QuickActions from "./QuickActions";
import { Users, BookOpen, Target, AlertTriangle, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import RegionReportChart from "../RegionReportChart"; // ✅ Chart component

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Users",
      value: 1247,
      change: "+12% this month",
      changeType: "increase",
      icon: Users,
      color: "primary",
    },
    {
      title: "Active Modules",
      value: 24,
      change: "+3 this month",
      changeType: "increase",
      icon: BookOpen,
      color: "success",
    },
    {
      title: "Drills Completed",
      value: 156,
      change: "+8% this week",
      changeType: "increase",
      icon: Target,
      color: "warning",
    },
    {
      title: "System Alerts",
      value: 7,
      change: "-2 today",
      changeType: "decrease",
      icon: AlertTriangle,
      color: "danger",
    },
  ];

  const drillParticipationData = [
    { month: "Jan", participation: 65 },
    { month: "Feb", participation: 72 },
    { month: "Mar", participation: 68 },
    { month: "Apr", participation: 78 },
    { month: "May", participation: 85 },
    { month: "Jun", participation: 82 },
  ];

  const preparednessData = [
    { region: "North", score: 85 },
    { region: "South", score: 78 },
    { region: "East", score: 92 },
    { region: "West", score: 74 },
    { region: "Central", score: 88 },
  ];

  const recentSystemActivity = [
    {
      id: 1,
      type: "user_registration",
      title: "15 new users registered",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: "drill_completed",
      title: "Fire drill completed in North region",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: "module_updated",
      title: "Earthquake module content updated",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white shadow-lg">
        <h1 className="mb-2 text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-200/90">
          System overview and management tools. Monitor platform performance and
          user engagement.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drill Participation Chart */}
        <div className="card border-border/70 p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Drill Participation Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={drillParticipationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="participation"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Preparedness Scores by Region */}
        <div className="card border-border/70 p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Preparedness Scores by Region
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={preparednessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Region Report Chart */}
        <RegionReportChart />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Activity */}
        <div className="lg:col-span-2">
          <div className="card border-border/70 p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Recent System Activity
            </h2>
            <div className="space-y-4">
              {recentSystemActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 rounded-xl border border-border/65 bg-secondary/35 p-4">
                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-2">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()} at{" "}
                      {new Date(activity.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full text-sm font-medium text-primary transition hover:text-primary/80">
              View System Logs
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions userRole="admin" />

          {/* System Health */}
          <div className="card border-border/70 p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Server Status</span>
                <span className="text-sm font-medium text-emerald-600">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-medium text-emerald-600">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Response</span>
                <span className="text-sm font-medium text-emerald-600">Fast</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage</span>
                <span className="text-sm font-medium text-amber-600">
                  78% Used
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
