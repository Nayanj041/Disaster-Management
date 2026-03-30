import { Clock, CheckCircle, Target, BookOpen, Award } from "lucide-react"

const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    const icons = {
      module_completed: BookOpen,
      drill_participated: Target,
      badge_earned: Award,
      quiz_completed: CheckCircle,
    }
    return icons[type] || Clock
  }

  const getActivityColor = (type) => {
    const colors = {
      module_completed: "text-blue-600 bg-blue-50",
      drill_participated: "text-green-600 bg-green-50",
      badge_earned: "text-yellow-600 bg-yellow-50",
      quiz_completed: "text-purple-600 bg-purple-50",
    }
    return colors[type] || "text-gray-600 bg-gray-50"
  }

  const displayActivities = activities

  return (
    <div className="bg-card rounded-lg shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {displayActivities.length > 0 ? displayActivities.map((activity) => {
          const Icon = getActivityIcon(activity.type)
          const colorClass = getActivityColor(activity.type)

          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()} at{" "}
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {activity.points && (
                    <span className="text-xs font-medium text-primary-600">+{activity.points} XP</span>
                  )}
                </div>
              </div>
            </div>
          )
        }) : (
          <p className="text-sm text-gray-500">No recent activity yet.</p>
        )}
      </div>
      <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
        View All Activity
      </button>
    </div>
  )
}

export default RecentActivity
