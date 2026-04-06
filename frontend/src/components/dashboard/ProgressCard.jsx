"use client";

import { CheckCircle, Clock, AlertCircle } from "lucide-react";

const ProgressCard = ({
  title,
  description,
  progress,
  status,
  dueDate,
  onClick,
}) => {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: "text-emerald-700",
      bg: "bg-emerald-100",
      border: "border-emerald-200",
    },
    in_progress: {
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-100",
      border: "border-amber-200",
    },
    overdue: {
      icon: AlertCircle,
      color: "text-rose-700",
      bg: "bg-rose-100",
      border: "border-rose-200",
    },
  };

  const config = statusConfig[status] || statusConfig.in_progress;
  const StatusIcon = config.icon;

  return (
    <div
      className="card cursor-pointer border-border/70 p-5 transition-all duration-200 hover:-translate-y-0.5"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
          <StatusIcon className={`h-5 w-5 ${config.color}`} />
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-1 flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {dueDate && (
        <div className="text-sm text-muted-foreground">
          Due: {new Date(dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default ProgressCard;
