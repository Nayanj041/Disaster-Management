import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../context/AuthProvider";

const VolunteerCoordinationPage = () => {
  const { user } = useAuth();
  const role = (user?.role || "student").toLowerCase();
  const canManage = role === "teacher" || role === "admin";

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    region: user?.region || "Odisha",
    skillRequired: "general",
    priority: "p3-medium",
    requiredVolunteers: 1,
    estimatedHours: 2,
  });

  const loadTasks = async (page = 1) => {
    try {
      setError("");
      const { data } = await axiosInstance.get("/resilience/volunteer-tasks", {
        params: {
          region: user?.region || "Odisha",
          page,
          limit: 10,
          status: filters.status || undefined,
          priority: filters.priority || undefined,
        },
      });
      setTasks(Array.isArray(data?.data) ? data.data : []);
      setPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tasks");
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters.status, filters.priority]);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/resilience/volunteer-tasks", form);
      setForm({
        title: "",
        region: user?.region || "Odisha",
        skillRequired: "general",
        priority: "p3-medium",
        requiredVolunteers: 1,
        estimatedHours: 2,
      });
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create task");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.patch(`/resilience/volunteer-tasks/${id}`, { status });
      loadTasks();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Coordination</h1>
          <p className="text-gray-600">Assign and track volunteer tasks by region and required skill.</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        {canManage ? (
          <form onSubmit={createTask} className="bg-white rounded-xl border p-5 grid grid-cols-1 md:grid-cols-3 gap-2">
            <input className="border rounded-lg px-3 py-2" placeholder="Task title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            <input className="border rounded-lg px-3 py-2" placeholder="Region" value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} required />
            <select className="border rounded-lg px-3 py-2" value={form.skillRequired} onChange={(e) => setForm((p) => ({ ...p, skillRequired: e.target.value }))}>
              <option value="general">General</option>
              <option value="medical">Medical</option>
              <option value="logistics">Logistics</option>
              <option value="rescue">Rescue</option>
              <option value="communications">Communications</option>
            </select>
            <select className="border rounded-lg px-3 py-2" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
              <option value="p4-low">P4 Low</option>
              <option value="p3-medium">P3 Medium</option>
              <option value="p2-high">P2 High</option>
              <option value="p1-critical">P1 Critical</option>
            </select>
            <input className="border rounded-lg px-3 py-2" type="number" min="1" placeholder="Required volunteers" value={form.requiredVolunteers} onChange={(e) => setForm((p) => ({ ...p, requiredVolunteers: e.target.value }))} />
            <input className="border rounded-lg px-3 py-2" type="number" min="1" placeholder="Estimated hours" value={form.estimatedHours} onChange={(e) => setForm((p) => ({ ...p, estimatedHours: e.target.value }))} />
            <button className="bg-cyan-700 text-white rounded-lg px-4 py-2 md:w-max" type="submit">Create Task</button>
          </form>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            Task creation and status updates are restricted to teacher/admin roles.
          </div>
        )}

        <div className="bg-white rounded-xl border p-5 flex flex-col md:flex-row gap-2">
          <select className="border rounded-lg px-3 py-2" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className="border rounded-lg px-3 py-2" value={filters.priority} onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}>
            <option value="">All Priorities</option>
            <option value="p4-low">P4 Low</option>
            <option value="p3-medium">P3 Medium</option>
            <option value="p2-high">P2 High</option>
            <option value="p1-critical">P1 Critical</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border p-5 space-y-3">
          {tasks.map((task) => (
            <div key={task._id} className="border rounded-lg p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <p className="font-semibold text-gray-900">{task.title}</p>
                <p className="text-sm text-gray-600">{task.region} • {task.skillRequired} • {task.priority} • {task.status}</p>
                <p className="text-xs text-gray-500">Volunteers: {task.requiredVolunteers || 1} • ETA: {task.estimatedHours || 1}h</p>
              </div>
              {canManage ? (
                <select className="border rounded px-2 py-1 text-sm" value={task.status} onChange={(e) => updateStatus(task._id, e.target.value)}>
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              ) : (
                <span className="text-xs text-gray-500">View only</span>
              )}
            </div>
          ))}
          {!tasks.length && <p className="text-gray-500">No tasks available.</p>}
          <div className="flex items-center justify-between pt-2 text-sm text-gray-600">
            <span>Total: {pagination.total || 0}</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={(pagination.page || 1) <= 1} onClick={() => loadTasks((pagination.page || 1) - 1)}>Prev</button>
              <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={(pagination.page || 1) >= (pagination.totalPages || 1)} onClick={() => loadTasks((pagination.page || 1) + 1)}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerCoordinationPage;
