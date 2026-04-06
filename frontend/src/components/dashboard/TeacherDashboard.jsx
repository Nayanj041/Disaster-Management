"use client";

import { useAuth } from "../../context/AuthProvider";
import StatCard from "./StatCard";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import { Users, BookOpen, Target, AlertTriangle } from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Students Enrolled",
      value: 28,
      change: "+3 this month",
      changeType: "increase",
      icon: Users,
      color: "primary",
    },
    {
      title: "Active Modules",
      value: 5,
      change: "+1 this week",
      changeType: "increase",
      icon: BookOpen,
      color: "success",
    },
    {
      title: "Drills Conducted",
      value: 12,
      change: "+2 this month",
      changeType: "increase",
      icon: Target,
      color: "warning",
    },
    {
      title: "Pending Alerts",
      value: 3,
      change: "-1 today",
      changeType: "decrease",
      icon: AlertTriangle,
      color: "danger",
    },
  ];

  const studentProgress = [
    { name: "Alice Johnson", progress: 85, status: "excellent", modules: 4 },
    { name: "Bob Smith", progress: 72, status: "good", modules: 3 },
    {
      name: "Carol Davis",
      progress: 45,
      status: "needs_attention",
      modules: 2,
    },
    { name: "David Wilson", progress: 91, status: "excellent", modules: 5 },
    { name: "Emma Brown", progress: 38, status: "needs_attention", modules: 2 },
  ];

  const getStatusColor = (status) => {
    const colors = {
      excellent: "text-green-600 bg-green-50",
      good: "text-yellow-600 bg-yellow-50",
      needs_attention: "text-red-600 bg-red-50",
    };
    return colors[status] || "text-gray-600 bg-gray-50";
  };

  const upcomingDrills = [
    {
      title: "Fire Evacuation Drill",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      participants: 25,
      type: "evacuation",
    },
    {
      title: "Earthquake Response Drill",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      participants: 30,
      type: "shelter",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-lg">
        <h1 className="mb-2 text-2xl font-bold">Good morning, {user?.name}!</h1>
        <p className="text-emerald-50/90">
          You have 28 students enrolled and 3 pending alerts that need your
          attention.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card border-border/70 p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Student Progress Overview
            </h2>
            <div className="space-y-4">
              {studentProgress.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/35 p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/diverse-user-avatars.png"
                      alt={student.name}
                      className="h-10 w-10 rounded-full ring-1 ring-border"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {student.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.modules} modules completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {student.progress}%
                      </p>
                      <div className="mt-1 h-2 w-20 rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${student.progress}%` }}></div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        student.status
                      )}`}>
                      {student.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full text-sm font-medium text-primary transition hover:text-primary/80">
              View All Students
            </button>
          </div>

          {/* Upcoming Drills */}
          <div className="card border-border/70 p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Upcoming Drills
            </h2>
            <div className="space-y-4">
              {upcomingDrills.map((drill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-border/70 p-4">
                  <div>
                    <h3 className="font-medium text-foreground">{drill.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {drill.date.toLocaleDateString()} at{" "}
                      {drill.date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {drill.participants} participants
                    </p>
                    <span className="text-xs capitalize text-muted-foreground">
                      {drill.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions userRole="teacher" />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
