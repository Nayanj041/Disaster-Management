import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  AlertTriangle,
  Settings,
  Trophy,
  Radar,
  MapPinned,
  Shield,
  LifeBuoy,
  ClipboardCheck,
  HandHelping,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCompact, setIsCompact] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Modules",
      href: "/modules",
      icon: BookOpen,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Drills",
      href: "/drills",
      icon: Target,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Assess Risk",
      href: "/assess",
      icon: Radar,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Geo-Intelligence",
      href: "/geo-intelligence",
      icon: MapPinned,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Preparedness",
      href: "/preparedness-score",
      icon: Shield,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Resilience Center",
      href: "/resilience-center",
      icon: LifeBuoy,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Incident Reports",
      href: "/resilience/incidents",
      icon: ClipboardCheck,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Volunteer Tasks",
      href: "/resilience/volunteers",
      icon: HandHelping,
      roles: ["teacher", "admin"],
    },
    {
      name: "Gamification",
      href: "/gamification",
      icon: Trophy,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Alerts",
      href: "/alerts",
      icon: AlertTriangle,
      roles: ["student", "teacher", "admin"],
    },
    { name: "Admin Panel", href: "/admin", icon: Settings, roles: ["admin"] },
    {
      name: "Report Case",
      href: "/report-case",
      icon: AlertTriangle,
      roles: ["student", "teacher"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role?.toLowerCase())
  );

  return (
    <aside
      className={`fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] border-r border-border/70 bg-card/88 backdrop-blur-lg transition-all duration-300 lg:block ${
        isCompact ? "w-20" : "w-72"
      }`}>
      <div className="flex h-full flex-col">
        <button
          onClick={() => setIsCompact(!isCompact)}
          className="mx-3 mt-3 inline-flex h-9 items-center justify-center self-end rounded-lg border border-border/70 bg-secondary/40 px-2 text-muted-foreground transition hover:text-foreground"
          aria-label="Toggle sidebar width">
          {isCompact ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="px-4 pb-2 pt-3">
          <p
            className={`text-xs uppercase tracking-[0.16em] text-muted-foreground transition-opacity ${
              isCompact ? "opacity-0" : "opacity-100"
            }`}>
            Navigation
          </p>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                <Icon className="h-4 w-4 shrink-0" />
                {!isCompact && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mb-4 rounded-xl border border-border/70 bg-secondary/35 p-3 text-xs text-muted-foreground">
          {!isCompact ? (
            <>
              <p className="font-semibold text-foreground">Stay Prepared</p>
              <p className="mt-1">Run a quick drill weekly and keep evacuation routes visible.</p>
            </>
          ) : (
            <Shield className="mx-auto h-4 w-4 text-primary" />
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
