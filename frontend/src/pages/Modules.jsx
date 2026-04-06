"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import ModuleCard from "../components/modules/ModuleCard";
import ModuleViewer from "../components/modules/ModuleViewer";
import axiosInstance from "../lib/axios";
import { Search, BookOpen, Clock, Star, Sparkles } from "lucide-react";

const Modules = () => {
  const { user, updateUserStats } = useAuth();
  const [selectedModule, setSelectedModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [modules, setModules] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationMeta, setRecommendationMeta] = useState({
    targetDifficulty: "beginner",
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const [{ data }, recRes] = await Promise.all([
        axiosInstance.get("/modules"),
        axiosInstance.get("/modules/recommendations"),
      ]);
      setModules(Array.isArray(data) ? data : []);
      setRecommendations(Array.isArray(recRes?.data?.recommendations) ? recRes.data.recommendations : []);
      setRecommendationMeta({
        targetDifficulty: recRes?.data?.targetDifficulty || "beginner",
        avgScore: Number(recRes?.data?.avgScore || 0),
      });
    } catch (error) {
      console.error("Failed to fetch modules:", error);
      setModules([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleModuleStart = (module) => {
    setSelectedModule(module);
  };

  const handleModuleComplete = (completionData) => {
    const submitCompletion = async () => {
      try {
        const moduleId = selectedModule?._id || selectedModule?.id;
        await axiosInstance.put(`/modules/${moduleId}/progress`, {
          completed: true,
        });
        await axiosInstance.post(`/modules/${moduleId}/quiz`, {
          score: completionData.quizScore,
        });

        updateUserStats({
          xp: (user?.stats?.xp || 0) + completionData.xpEarned,
        });

        await fetchModules();
      } catch (error) {
        console.error("Failed to complete module:", error);
      } finally {
        setSelectedModule(null);
      }
    };

    submitCompletion();
  };

  const filteredModules = useMemo(() => modules.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === "all" || module.difficulty === filterDifficulty;
    const matchesRegion =
      filterRegion === "all" || module.regions?.includes(filterRegion);

    return matchesSearch && matchesDifficulty && matchesRegion;
  }), [modules, searchTerm, filterDifficulty, filterRegion]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card border-border/70 p-6">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Education Modules</h1>
          <p className="text-muted-foreground">Loading modules from database...</p>
        </div>
      </div>
    );
  }

  if (selectedModule) {
    return (
      <ModuleViewer
        module={selectedModule}
        onClose={() => setSelectedModule(null)}
        onComplete={handleModuleComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card border-border/70 p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Education Modules
            </h1>
            <p className="text-muted-foreground">
              Interactive learning modules tailored for {user?.region || "your"} region
              disasters
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{filteredModules.length} modules</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {filteredModules.reduce(
                  (total, module) => total + Number.parseInt(module.duration),
                  0
                )}{" "}
                min total
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search modules..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <select
              className="input-field min-w-[150px]"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}>
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              className="input-field min-w-[150px]"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}>
              <option value="all">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-border/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed Modules
              </p>
              <p className="text-2xl font-bold text-foreground">
                {user?.stats?.modulesCompleted || 0}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-100 p-3">
              <BookOpen className="h-6 w-6 text-emerald-700" />
            </div>
          </div>
        </div>

        <div className="card border-border/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Learning Time</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.floor(((user?.stats?.modulesCompleted || 0) * 45) / 60)}h{" "}
                {((user?.stats?.modulesCompleted || 0) * 45) % 60}m
              </p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-100 p-3">
              <Clock className="h-6 w-6 text-sky-700" />
            </div>
          </div>
        </div>

        <div className="card border-border/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold text-foreground">87%</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-100 p-3">
              <Star className="h-6 w-6 text-amber-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <ModuleCard
            key={module._id || module.id}
            module={module}
            onStart={handleModuleStart}
          />
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="card border-dashed border-border/80 py-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium text-foreground">
            No modules found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {recommendations.length > 0 && (
        <section className="space-y-4">
          <div className="card border-border/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Adaptive Recommendations</h2>
                <p className="text-sm text-muted-foreground">
                  Suggested difficulty: <span className="font-medium capitalize text-foreground">{recommendationMeta.targetDifficulty}</span> ·
                  Recent average quiz score: <span className="font-medium text-foreground"> {recommendationMeta.avgScore}%</span>
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                AI Curated
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((module) => (
              <ModuleCard
                key={`recommended-${module._id || module.id}`}
                module={module}
                onStart={handleModuleStart}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Modules;
