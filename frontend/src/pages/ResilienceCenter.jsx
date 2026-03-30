import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const FEATURES = [
  {
    title: "Incident Reporting",
    description: "Submit community incidents and verification workflow.",
    path: "/resilience/incidents",
    roles: ["student", "teacher", "admin"],
  },
  {
    title: "Alert Channels",
    description: "Configure in-app, email, SMS, WhatsApp, and voice preferences.",
    path: "/resilience/alerts",
    roles: ["student", "teacher", "admin"],
  },
  {
    title: "Evacuation Intelligence",
    description: "Generate role-aware safe route recommendations.",
    path: "/resilience/evacuation",
    roles: ["student", "teacher", "admin"],
  },
  {
    title: "Preparedness Checklist",
    description: "Track household readiness and completion score.",
    path: "/resilience/checklist",
    roles: ["student", "teacher", "admin"],
  },
  {
    title: "Drill Replay",
    description: "Review drill timeline and bottlenecks.",
    path: "/resilience/drill-replay",
    roles: ["teacher", "admin"],
  },
  {
    title: "Resource Locator",
    description: "Find shelters, hospitals, and relief points.",
    path: "/resilience/resources",
    roles: ["student", "teacher", "admin"],
  },
  {
    title: "Multi-Language Assistant",
    description: "Translate emergency instructions quickly.",
    path: "/resilience/language",
    roles: ["student", "teacher", "admin"],
  },
  {
    title: "Early Warning Forecast",
    description: "View projected 24h/48h/72h risk with confidence.",
    path: "/resilience/forecast",
    roles: ["teacher", "admin"],
  },
  {
    title: "Volunteer Coordination",
    description: "Manage volunteer tasks by role and skill.",
    path: "/resilience/volunteers",
    roles: ["teacher", "admin"],
  },
  {
    title: "Offline Emergency Pack",
    description: "Access bundled contacts, SOPs, and resources.",
    path: "/resilience/offline-pack",
    roles: ["student", "teacher", "admin"],
  },
];

const ResilienceCenter = () => {
  const { user } = useAuth();
  const role = (user?.role || "student").toLowerCase();
  const visibleFeatures = FEATURES.filter((feature) =>
    Array.isArray(feature.roles) ? feature.roles.includes(role) : true
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h1 className="text-3xl font-bold text-gray-900">Resilience Center</h1>
          <p className="text-gray-600 mt-1">Choose a dedicated module to manage advanced disaster response features.</p>
          <p className="text-sm text-gray-700 mt-3">Current role: <span className="font-semibold capitalize">{role}</span></p>
          <p className="text-xs text-gray-500 mt-1">Teacher/Admin can verify incidents and manage volunteer tasks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleFeatures.map((feature) => (
            <Link key={feature.path} to={feature.path} className="bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow">
              <p className="font-semibold text-gray-900">{feature.title}</p>
              <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              <p className="text-xs text-blue-700 mt-3">Open module</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResilienceCenter;
