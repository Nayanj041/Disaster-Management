import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { MapPinned, Radar, Activity } from "lucide-react";

const GeoIntelligence = () => {
  const [regionMap, setRegionMap] = useState([]);
  const [drillAnalytics, setDrillAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [mapRes, drillRes] = await Promise.all([
          axiosInstance.get("/risk/region-map"),
          axiosInstance.get("/risk/drill-analytics"),
        ]);

        setRegionMap(Array.isArray(mapRes.data) ? mapRes.data : []);
        setDrillAnalytics(Array.isArray(drillRes.data?.drillsByType) ? drillRes.data.drillsByType : []);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Geo-Intelligence</h1>
          <p className="text-gray-600">Advanced region-specific risk mapping and preparedness intelligence.</p>
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
