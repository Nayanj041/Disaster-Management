"use client"

import { useNavigate } from "react-router-dom";
import { BookOpen, Target, AlertTriangle, Users, Award, Settings } from "lucide-react"

const QuickActions = ({ userRole }) => {
  const navigate = useNavigate();

  const getActionsForRole = (role) => {
    const commonActions = [
      { icon: BookOpen, label: "Browse Modules", href: "/modules", color: "bg-blue-500" },
      { icon: Target, label: "Join Drill", href: "/drills", color: "bg-green-500" },
      { icon: AlertTriangle, label: "Emergency Alerts", href: "/alerts", color: "bg-red-500" },
    ]

    const roleSpecificActions = {
      student: [
        { icon: Award, label: "View Badges", href: "/gamification", color: "bg-yellow-500" },
        { icon: Users, label: "Leaderboard", href: "/leaderboard", color: "bg-purple-500" },
      ],
      teacher: [
        { icon: Users, label: "My Students", href: "/students", color: "bg-indigo-500" },
        { icon: Settings, label: "Create Drill", href: "/drills/create", color: "bg-gray-500" },
      ],
      admin: [
        { icon: Settings, label: "Admin Panel", href: "/admin", color: "bg-gray-800" },
        { icon: Users, label: "User Management", href: "/admin/users", color: "bg-indigo-500" },
      ],
    }

    return [...commonActions, ...(roleSpecificActions[role] || [])]
  }

  const actions = getActionsForRole(userRole)

  return (
    <div className="card border-border/70 p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              className="flex flex-col items-center rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary/70"
              onClick={() => navigate(action.href)}
            >
              <div className={`p-3 rounded-full ${action.color} mb-2`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-center text-sm font-medium text-foreground">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default QuickActions
