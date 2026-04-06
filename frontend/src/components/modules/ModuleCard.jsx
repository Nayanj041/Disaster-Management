"use client"

import { useState } from "react"
import { BookOpen, Clock, Users, Star, ChevronRight, CheckCircle } from "lucide-react"

const ModuleCard = ({ module, onStart }) => {
  const [isHovered, setIsHovered] = useState(false)

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: "bg-emerald-100 text-emerald-700",
      intermediate: "bg-amber-100 text-amber-700",
      advanced: "bg-rose-100 text-rose-700",
    }
    return colors[difficulty] || colors.beginner
  }

  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-emerald-500"
    if (progress >= 50) return "bg-amber-500"
    return "bg-primary"
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-[0_10px_28px_hsl(210_35%_20%_/_0.08)] transition-all duration-300 cursor-pointer ${
        isHovered ? "-translate-y-1" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onStart(module)}
    >
      {/* Module Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/25 via-cyan-100/40 to-accent/15">
        <img
          src={module.image || `/placeholder.svg?height=200&width=400&query=${module.title}`}
          alt={module.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
            {module.difficulty}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="rounded-full border border-white/40 bg-white/90 p-2 backdrop-blur">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
        </div>
        {module.progress > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="rounded-xl border border-white/40 bg-white/90 p-2 backdrop-blur">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{module.progress}% Complete</span>
                {module.progress === 100 && <CheckCircle className="h-4 w-4 text-emerald-600" />}
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(module.progress)}`}
                  style={{ width: `${module.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Module Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{module.title}</h3>
          <div className="flex items-center ml-2">
            <Star className="h-4 w-4 fill-current text-amber-400" />
            <span className="ml-1 text-sm text-muted-foreground">{module.rating}</span>
          </div>
        </div>

        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{module.description}</p>

        {/* Module Meta */}
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{module.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{module.enrolled} enrolled</span>
          </div>
        </div>

        {/* Region Relevance */}
        <div className="mb-4">
          <p className="mb-1 text-xs text-muted-foreground">Relevant for regions:</p>
          <div className="flex flex-wrap gap-1">
            {module.regions.map((region) => (
              <span key={region} className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                {region}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          className={`flex w-full items-center justify-center rounded-xl px-4 py-2 font-medium transition-all duration-200 ${
            module.progress === 100
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : module.progress > 0
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          <span>
            {module.progress === 100 ? "Review Module" : module.progress > 0 ? "Continue Learning" : "Start Module"}
          </span>
          <ChevronRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  )
}

export default ModuleCard
