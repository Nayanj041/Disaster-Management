import { TrendingUp, TrendingDown } from "lucide-react"

const StatCard = ({ title, value, change, changeType, icon: Icon, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary/15 text-primary border-primary/25",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-rose-100 text-rose-700 border-rose-200",
  }

  return (
    <div className="card border-border/70 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === "increase" ? (
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-rose-500" />
              )}
              <span className={`text-sm font-medium ${changeType === "increase" ? "text-emerald-600" : "text-rose-600"}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-xl border p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export default StatCard
