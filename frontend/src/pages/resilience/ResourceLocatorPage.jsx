import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../context/AuthProvider";

const ResourceLocatorPage = () => {
  const { user } = useAuth();
  const [region, setRegion] = useState(user?.region || "Odisha");
  const [type, setType] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");
  const [sosStatus, setSosStatus] = useState(null);

  const loadResources = async () => {
    try {
      setError("");
      const { data } = await axiosInstance.get("/resilience/resources", {
        params: {
          region,
          type: type || undefined,
          latitude: latitude || undefined,
          longitude: longitude || undefined,
        },
      });
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch resources");
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(String(pos.coords.latitude.toFixed(6)));
      setLongitude(String(pos.coords.longitude.toFixed(6)));
    });
  };

  const triggerSos = async () => {
    try {
      setSosStatus(null);
      const { data } = await axiosInstance.post("/resilience/sos", {
        region,
        city: user?.city || "",
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        incidentType: "other",
        description: "Emergency SOS from resource locator",
      });
      setSosStatus(data);
      if (Array.isArray(data?.nearestResources)) {
        setResources(data.nearestResources);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to trigger SOS");
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
          <input className="border rounded-lg px-3 py-2" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" />
          <input className="border rounded-lg px-3 py-2" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" />
          <button className="bg-gray-700 text-white rounded-lg px-4 py-2" onClick={useMyLocation}>Use Location</button>
          <button className="bg-blue-600 text-white rounded-lg px-4 py-2" onClick={loadResources}>Search</button>
          <button className="bg-red-600 text-white rounded-lg px-4 py-2" onClick={triggerSos}>Trigger SOS</button>
        </div>

        {sosStatus && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <p className="font-semibold text-red-700">SOS Escalated</p>
            <p className="text-sm text-red-700">Incident ID: {sosStatus.incidentId}</p>
            <p className="text-sm text-red-700">SLA: {sosStatus.slaMinutes} minutes</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {resources.map((resource) => (
            <div key={resource._id} className="bg-white border rounded-lg p-4">
              <p className="font-semibold text-gray-900">{resource.name}</p>
              <p className="text-sm text-gray-600 capitalize">{resource.type} • {resource.region}</p>
              <p className="text-sm text-gray-600">Capacity: {resource.currentOccupancy}/{resource.capacity}</p>
              {resource.distanceKm !== undefined && resource.distanceKm !== null && (
                <p className="text-sm text-gray-600">Distance: {resource.distanceKm} km</p>
              )}
              <p className="text-xs text-gray-500">{resource.contact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceLocatorPage;
