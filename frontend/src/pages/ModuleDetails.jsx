import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ModuleViewer from "../components/modules/ModuleViewer";
import axiosInstance from "../lib/axios";

const ModuleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/modules/${id}`);
        setModule(data);
      } catch (error) {
        console.error("Error fetching module:", error);
        setModule(null);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [id]);

  const handleComplete = async (completionData) => {
    try {
      await axiosInstance.put(`/modules/${id}/progress`, { completed: true });
      await axiosInstance.post(`/modules/${id}/quiz`, {
        score: completionData.quizScore,
      });
    } catch (error) {
      console.error("Error completing module:", error);
    } finally {
      navigate("/modules");
    }
  };

  if (loading) {
    return <div className="p-6">Loading module...</div>;
  }

  if (!module) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-2">Module not found</h2>
        <button
          onClick={() => navigate("/modules")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  return (
    <ModuleViewer
      module={module}
      onClose={() => navigate("/modules")}
      onComplete={handleComplete}
    />
  );
};

export default ModuleDetails;
