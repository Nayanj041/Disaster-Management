import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../context/AuthProvider";

const ResourceLocatorPage = () => {
  const { user } = useAuth();
  const [region, setRegion] = useState(user?.region || "Odisha");
  const [type, setType] = useState("");
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");

  const loadResources = async () => {
    try {
      setError("");
      const { data } = await axiosInstance.get("/resilience/resources", {
        params: { region, type: type || undefined },
      });
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch resources");
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-bold text-gray-900">Resource and Shelter Locator</h1>
          <p className="text-gray-600">Find shelters, hospitals, ambulances, and relief points by region.</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="bg-white rounded-xl border p-5 flex flex-col md:flex-row gap-2">
          <input className="border rounded-lg px-3 py-2" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" />
          <select className="border rounded-lg px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Types</option>
            <option value="shelter">Shelter</option>
            <option value="hospital">Hospital</option>
            <option value="ambulance">Ambulance</option>
            <option value="relief">Relief</option>
            <option value="food">Food</option>
            <option value="water">Water</option>
          </select>
          <button className="bg-blue-600 text-white rounded-lg px-4 py-2" onClick={loadResources}>Search</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white border rounded-lg p-4">
              <p className="font-semibold text-gray-900">{resource.name}</p>
              <p className="text-sm text-gray-600 capitalize">{resource.type} • {resource.region}</p>
              <p className="text-sm text-gray-600">Capacity: {resource.currentOccupancy}/{resource.capacity}</p>
              <p className="text-xs text-gray-500">{resource.contact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceLocatorPage;
