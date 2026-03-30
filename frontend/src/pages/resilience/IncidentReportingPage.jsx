import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../context/AuthProvider";

const IncidentReportingPage = () => {
  const { user } = useAuth();
  const role = (user?.role || "student").toLowerCase();
  const canVerify = role === "teacher" || role === "admin";

  const [incidents, setIncidents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ severity: "", verificationStatus: "" });
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    incidentType: "flood",
    severity: "medium",
    region: user?.region || "Odisha",
    city: "",
    peopleAffected: 0,
    injuriesReported: 0,
    infrastructureDamage: "none",
    sourceReliability: "community",
    priority: "p3-medium",
    responseSlaMinutes: 60,
    reporterPhone: "",
  });

  const loadIncidents = async (page = 1) => {
    try {
      setError("");
      const { data } = await axiosInstance.get("/resilience/incidents", {
        params: {
          page,
          limit: 10,
          severity: filters.severity || undefined,
          verificationStatus: filters.verificationStatus || undefined,
        },
      });
      setIncidents(Array.isArray(data?.data) ? data.data : []);
      setPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load incidents");
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [filters.severity, filters.verificationStatus]);

  const submitIncident = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/resilience/incidents", {
        title: form.title,
        description: form.description,
        incidentType: form.incidentType,
        severity: form.severity,
        location: { region: form.region, city: form.city },
        reporterContact: {
          phone: form.reporterPhone,
          preferredChannel: "phone",
        },
        impact: {
          peopleAffected: Number(form.peopleAffected),
          injuriesReported: Number(form.injuriesReported),
          infrastructureDamage: form.infrastructureDamage,
        },
        operational: {
          sourceReliability: form.sourceReliability,
          priority: form.priority,
          responseSlaMinutes: Number(form.responseSlaMinutes),
        },
      });
      setForm({
        title: "",
        description: "",
        incidentType: "flood",
        severity: "medium",
        region: user?.region || "Odisha",
        city: "",
        peopleAffected: 0,
        injuriesReported: 0,
        infrastructureDamage: "none",
        sourceReliability: "community",
        priority: "p3-medium",
        responseSlaMinutes: 60,
        reporterPhone: "",
      });
      loadIncidents();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit incident");
    }
  };

  const verifyIncident = async (id, status) => {
    try {
      await axiosInstance.patch(`/resilience/incidents/${id}/verification`, { status });
      loadIncidents();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update verification");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-bold text-gray-900">Community Incident Reporting</h1>
          <p className="text-gray-600">Submit incidents and verify community reports.</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <form onSubmit={submitIncident} className="bg-white rounded-xl border p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded-lg px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <input className="border rounded-lg px-3 py-2" placeholder="Region" value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} required />
          <input className="border rounded-lg px-3 py-2" placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
          <select className="border rounded-lg px-3 py-2" value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <input className="border rounded-lg px-3 py-2" placeholder="People affected" type="number" min="0" value={form.peopleAffected} onChange={(e) => setForm((p) => ({ ...p, peopleAffected: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2" placeholder="Injuries reported" type="number" min="0" value={form.injuriesReported} onChange={(e) => setForm((p) => ({ ...p, injuriesReported: e.target.value }))} />
          <input className="border rounded-lg px-3 py-2" placeholder="Reporter phone" value={form.reporterPhone} onChange={(e) => setForm((p) => ({ ...p, reporterPhone: e.target.value }))} />
          <select className="border rounded-lg px-3 py-2" value={form.infrastructureDamage} onChange={(e) => setForm((p) => ({ ...p, infrastructureDamage: e.target.value }))}>
            <option value="none">No Damage</option>
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
          <select className="border rounded-lg px-3 py-2" value={form.sourceReliability} onChange={(e) => setForm((p) => ({ ...p, sourceReliability: e.target.value }))}>
            <option value="unverified">Unverified</option>
            <option value="community">Community</option>
            <option value="official">Official</option>
          </select>
          <select className="border rounded-lg px-3 py-2" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
            <option value="p4-low">P4 Low</option>
            <option value="p3-medium">P3 Medium</option>
            <option value="p2-high">P2 High</option>
            <option value="p1-critical">P1 Critical</option>
          </select>
          <input className="border rounded-lg px-3 py-2" placeholder="Response SLA (mins)" type="number" min="5" value={form.responseSlaMinutes} onChange={(e) => setForm((p) => ({ ...p, responseSlaMinutes: e.target.value }))} />
          <textarea className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
          <button className="bg-blue-600 text-white rounded-lg px-4 py-2 md:w-max" type="submit">Submit Report</button>
        </form>

        <div className="bg-white rounded-xl border p-5 flex flex-col md:flex-row gap-2">
          <select className="border rounded-lg px-3 py-2" value={filters.severity} onChange={(e) => setFilters((p) => ({ ...p, severity: e.target.value }))}>
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select className="border rounded-lg px-3 py-2" value={filters.verificationStatus} onChange={(e) => setFilters((p) => ({ ...p, verificationStatus: e.target.value }))}>
            <option value="">All Verification</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border p-5 space-y-3">
          {incidents.map((incident) => (
            <div key={incident._id} className="border rounded-lg p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <p className="font-semibold text-gray-900">{incident.title}</p>
                <p className="text-sm text-gray-600">{incident.location?.region} • {incident.severity} • {incident.verification?.status} • {incident.operational?.priority}</p>
                <p className="text-xs text-gray-500">Affected: {incident.impact?.peopleAffected || 0}, Injuries: {incident.impact?.injuriesReported || 0}, Damage: {incident.impact?.infrastructureDamage || "none"}</p>
              </div>
              {canVerify && (
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white text-sm px-3 py-1 rounded" onClick={() => verifyIncident(incident._id, "verified")}>Verify</button>
                  <button className="bg-red-600 text-white text-sm px-3 py-1 rounded" onClick={() => verifyIncident(incident._id, "rejected")}>Reject</button>
                </div>
              )}
            </div>
          ))}
          {!incidents.length && <p className="text-gray-500">No incidents found.</p>}
          <div className="flex items-center justify-between pt-2 text-sm text-gray-600">
            <span>Total: {pagination.total || 0}</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={(pagination.page || 1) <= 1} onClick={() => loadIncidents((pagination.page || 1) - 1)}>Prev</button>
              <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={(pagination.page || 1) >= (pagination.totalPages || 1)} onClick={() => loadIncidents((pagination.page || 1) + 1)}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReportingPage;
