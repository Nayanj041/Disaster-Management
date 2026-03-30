import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../context/AuthProvider";

const OfflineEmergencyPackPage = () => {
  const { user } = useAuth();
  const [pack, setPack] = useState(null);
  const [error, setError] = useState("");

  const loadPack = async () => {
    try {
      setError("");
      const { data } = await axiosInstance.get("/resilience/offline-pack", {
        params: { region: user?.region || "India" },
      });
      setPack(data || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load offline pack");
    }
  };

  useEffect(() => {
    loadPack();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-white rounded-xl border p-5">
          <h1 className="text-2xl font-bold text-gray-900">Offline Emergency Pack</h1>
          <p className="text-gray-600">Critical contacts, SOP, checklist, and resources prepared for offline use.</p>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        {pack && (
          <div className="bg-white rounded-xl border p-5 space-y-4">
            <p className="text-sm text-gray-600">Region: <span className="font-semibold text-gray-900">{pack.region}</span></p>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Emergency Contacts</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {(pack.emergencyContacts || []).map((contact, idx) => (
                  <li key={idx}>{contact.name}: {contact.number}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Standard Operating Steps</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {(pack.sop || []).map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-gray-600">Bundled Resources: {(pack.resources || []).length}</p>
            <p className="text-sm text-gray-600">Checklist Items: {(pack.checklistItems || []).length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineEmergencyPackPage;
