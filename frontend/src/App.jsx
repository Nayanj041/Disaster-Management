import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Modules from "./pages/Modules";
import ModuleDetails from "./pages/ModuleDetails";
import Drills from "./pages/Drills";
import Alerts from "./pages/Alerts";
import AdminPanel from "./pages/AdminPanel";
import ChatbotPage from "./pages/ChatbotPage";
import Gamification from "./pages/Gamification";
import UserProfile from "./pages/UserProfile";
import DrillManagement from "./pages/DrillManagement";
import RiskAssessment from "./pages/RiskAssessment";
import GeoIntelligence from "./pages/GeoIntelligence";
import PreparednessScore from "./pages/PreparednessScore";
import ResilienceCenter from "./pages/ResilienceCenter";
import IncidentReportingPage from "./pages/resilience/IncidentReportingPage";
import AlertChannelsPage from "./pages/resilience/AlertChannelsPage";
import EvacuationRoutesPage from "./pages/resilience/EvacuationRoutesPage";
import PreparednessChecklistPage from "./pages/resilience/PreparednessChecklistPage";
import DrillReplayPage from "./pages/resilience/DrillReplayPage";
import ResourceLocatorPage from "./pages/resilience/ResourceLocatorPage";
import MultiLanguageAssistantPage from "./pages/resilience/MultiLanguageAssistantPage";
import EarlyWarningForecastPage from "./pages/resilience/EarlyWarningForecastPage";
import VolunteerCoordinationPage from "./pages/resilience/VolunteerCoordinationPage";
import OfflineEmergencyPackPage from "./pages/resilience/OfflineEmergencyPackPage";

// Components
import Leaderboard from "./components/Leaderboard";
import FloatingAiIcon from "./components/FloatingAiIcon";
import ReportCasePage from "./pages/ReportCasePage";

const ProtectedRoute = ({ children, adminOnly = false, allowedRoles = [] }) => {
  const { authUser } = useAuthStore();
  const isAuthenticated = !!authUser;
  const normalizedRole = String(authUser?.role || "").toLowerCase();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && normalizedRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    !allowedRoles.map((r) => String(r).toLowerCase()).includes(normalizedRole)
  ) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const Layout = ({ children }) => (
  <div className="min-h-screen bg-transparent">
    <Navbar />
    <div className="flex">
      <Sidebar />
      <main className="w-full px-4 pb-6 pt-5 md:px-6 lg:pl-[18.5rem] lg:pr-8 lg:pt-8">
        <div className="surface-panel min-h-[calc(100vh-11rem)] p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
    <Footer />
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-transparent">
    {children}
  </div>
);

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const isAuthenticated = !!authUser;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="surface-panel flex items-center gap-3 px-6 py-4 text-sm font-semibold text-muted-foreground">
          <span className="h-2.5 w-2.5 animate-ping rounded-full bg-primary" />
          Preparing your disaster dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Toaster position="top-right" />
      <AnimatedBackground />
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chatbot" element={<ChatbotPage />} />

          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthLayout>
                  <Login />
                </AuthLayout>
              )
            }
          />

          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthLayout>
                  <Signup />
                </AuthLayout>
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/modules"
            element={
              <ProtectedRoute>
                <Layout>
                  <Modules />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/modules/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ModuleDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/drills"
            element={
              <ProtectedRoute>
                <Layout>
                  <Drills />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assess"
            element={
              <ProtectedRoute>
                <Layout>
                  <RiskAssessment />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/geo-intelligence"
            element={
              <ProtectedRoute>
                <Layout>
                  <GeoIntelligence />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/preparedness-score"
            element={
              <ProtectedRoute>
                <Layout>
                  <PreparednessScore />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience-center"
            element={
              <ProtectedRoute>
                <Layout>
                  <ResilienceCenter />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience/incidents"
            element={
              <ProtectedRoute>
                <Layout>
                  <IncidentReportingPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience/alerts"
            element={
              <ProtectedRoute>
                <Layout>
                  <AlertChannelsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience/evacuation"
            element={
              <ProtectedRoute>
                <Layout>
                  <EvacuationRoutesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience/checklist"
            element={
              <ProtectedRoute>
                <Layout>
                  <PreparednessChecklistPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience/drill-replay"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                <Layout>
                  <DrillReplayPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience/resources"
            element={
              <ProtectedRoute>
                <Layout>
                  <ResourceLocatorPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience/language"
            element={
              <ProtectedRoute>
                <Layout>
                  <MultiLanguageAssistantPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience/forecast"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                <Layout>
                  <EarlyWarningForecastPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience/volunteers"
            element={
              <ProtectedRoute allowedRoles={["teacher", "admin"]}>
                <Layout>
                  <VolunteerCoordinationPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resilience/offline-pack"
            element={
              <ProtectedRoute>
                <Layout>
                  <OfflineEmergencyPackPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Layout>
                  <Alerts />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Leaderboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/gamification"
            element={
              <ProtectedRoute>
                <Layout>
                  <Gamification />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <AdminPanel />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/drill-management"
            element={
              <ProtectedRoute adminOnly={true}>
                <Layout>
                  <DrillManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/report-case"
            element={
              <ProtectedRoute allowedRoles={["student", "teacher"]}>
                <Layout>
                  <ReportCasePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
      {isAuthenticated && <FloatingAiIcon />}
    </div>
  );
}

export default App;
