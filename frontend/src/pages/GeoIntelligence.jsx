import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { MapPinned, Radar, Activity, Globe } from "lucide-react";
import GeoRiskMap from "../components/geo/GeoRiskMap";

const GeoIntelligence = () => {
  const [regionMap, setRegionMap] = useState([]);
  const [geoZones, setGeoZones] = useState([]);
  const [drillAnalytics, setDrillAnalytics] = useState([]);
  const [riskBandFilter, setRiskBandFilter] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [mapRes, drillRes, zoneRes] = await Promise.all([
          axiosInstance.get("/risk/region-map"),
          axiosInstance.get("/risk/drill-analytics"),
          axiosInstance.get("/risk/geo-zones"),
        ]);

        setRegionMap(Array.isArray(mapRes.data) ? mapRes.data : []);
        setDrillAnalytics(Array.isArray(drillRes.data?.drillsByType) ? drillRes.data.drillsByType : []);
        setGeoZones(Array.isArray(zoneRes.data) ? zoneRes.data : []);
      } catch (error) {
        console.error("Failed to load geo intelligence data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="min-h-screen p-6">Loading geo-intelligence data...</div>;
  }

  const filteredZones = geoZones.filter((zone) =>
    riskBandFilter === "all" ? true : zone.riskBand === riskBandFilter
  );

  const selectedZone = filteredZones.find((zone) => zone.region === selectedRegion) || null;

  const heatColor = (band) => {
    if (band === "critical") return "bg-red-100 border-red-300";
    if (band === "high") return "bg-orange-100 border-orange-300";
    if (band === "moderate") return "bg-yellow-100 border-yellow-300";
    return "bg-emerald-100 border-emerald-300";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Geo-Intelligence</h1>
          <p className="text-gray-600">Advanced region-specific risk mapping and preparedness intelligence.</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
            <Globe className="w-5 h-5 text-emerald-600" /> Geo Risk Zones (Map-ready)
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All" },
              { id: "critical", label: "Critical" },
              { id: "high", label: "High" },
              { id: "moderate", label: "Moderate" },
              { id: "low", label: "Low" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRiskBandFilter(opt.id)}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  riskBandFilter === opt.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mb-4 rounded-lg border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">District Heat Tiles</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
              {filteredZones.slice(0, 24).map((zone) => (
                <div
                  key={`heat-${zone.region}`}
                  className={`rounded-md border p-2 text-xs ${heatColor(zone.riskBand)}`}
                >
                  <p className="font-semibold text-gray-900 truncate">{zone.region}</p>
                  <p className="text-gray-700">Risk {zone.averageRisk}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <GeoRiskMap
              zones={filteredZones}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          </div>

          {selectedZone && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">Zone Drilldown: {selectedZone.region}</p>
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-blue-900 md:grid-cols-3">
                <p>Risk Band: <span className="font-medium capitalize">{selectedZone.riskBand}</span></p>
                <p>Average Risk: <span className="font-medium">{selectedZone.averageRisk}</span></p>
                <p>Preparedness Score: <span className="font-medium">{selectedZone.preparednessScore}</span></p>
              </div>
              <p className="mt-2 text-xs text-blue-800">
                Recommended action: prioritize evacuation rehearsal and targeted awareness drives in this region.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredZones.slice(0, 12).map((zone) => (
              <div key={zone.region} className="rounded-lg border bg-gray-50 p-4">
                <p className="font-semibold text-gray-900">{zone.region}</p>
                <p className="text-sm text-gray-600 capitalize">Risk Band: {zone.riskBand}</p>
                <p className="text-sm text-gray-600">Avg Risk: {zone.averageRisk}</p>
                <p className="text-sm text-gray-600">Preparedness: {zone.preparednessScore}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Lat: {zone.coordinates?.latitude}, Lng: {zone.coordinates?.longitude}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
            <MapPinned className="w-5 h-5 text-blue-600" /> Regional Risk Mapping
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Region</th>
                  <th className="py-2">Average Risk</th>
                  <th className="py-2">Preparedness</th>
                  <th className="py-2">Assessments</th>
                </tr>
              </thead>
              <tbody>
                {regionMap.map((row) => (
                  <tr key={row.region} className="border-b">
                    <td className="py-2 font-medium">{row.region}</td>
                    <td className="py-2">{row.averageRisk}</td>
                    <td className="py-2">{row.preparednessScore}</td>
                    <td className="py-2">{row.assessments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
            <Radar className="w-5 h-5 text-purple-600" /> Drill Participation Analytics
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drillAnalytics.map((row) => (
              <div key={row.type} className="p-4 rounded-lg border bg-gray-50">
                <p className="font-semibold capitalize">{row.type}</p>
                <p className="text-sm text-gray-600">Total: {row.total}</p>
                <p className="text-sm text-gray-600">Completion Rate: {row.completionRate}%</p>
                <p className="text-sm text-gray-600">Avg Score: {row.avgScore}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoIntelligence;
