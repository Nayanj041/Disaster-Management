import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { Plus, Edit2, Trash2, Play, ChevronDown } from "lucide-react";

const DrillManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "earthquake",
    duration: 5,
    difficulty: "medium",
    region: user?.region || "",
    instructions: "",
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      toast.error("Only admins can manage drills");
      navigate("/");
      return;
    }
    fetchDrills();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchDrills = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/drills");
      setDrills(res.data || []);
    } catch (error) {
      console.error("Error fetching drills:", error);
      toast.error("Failed to load drills");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion({ ...currentQuestion, [name]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addQuestion = () => {
    if (
      !currentQuestion.question ||
      currentQuestion.options.some((opt) => !opt)
    ) {
      toast.error("Please fill in all question fields");
      return;
    }
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQuestion }],
    });
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
    toast.success("Question added");
  };

  const removeQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "earthquake",
      duration: 5,
      difficulty: "medium",
      region: user?.region || "",
      instructions: "",
      questions: [],
    });
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || formData.questions.length === 0) {
      toast.error("Please fill in all fields and add at least one question");
      return;
    }

    try {
      if (editingId) {
        await axiosInstance.put(`/drills/${editingId}`, formData);
        toast.success("Drill updated successfully");
      } else {
        const res = await axiosInstance.post("/drills", formData);
        toast.success("Drill created successfully");
      }
      resetForm();
      setShowForm(false);
      fetchDrills();
    } catch (error) {
      console.error("Error saving drill:", error);
      toast.error(error.response?.data?.message || "Failed to save drill");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this drill?")) return;

    try {
      await axiosInstance.delete(`/drills/${id}`);
      toast.success("Drill deleted successfully");
      fetchDrills();
    } catch (error) {
      console.error("Error deleting drill:", error);
      toast.error("Failed to delete drill");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Drill Management</h1>
            <p className="text-gray-600">Create and manage disaster drills</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Drill
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "Edit Drill" : "Create New Drill"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="e.g., Earthquake Safety Drill"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="earthquake">Earthquake</option>
                    <option value="flood">Flood</option>
                    <option value="cyclone">Cyclone</option>
                    <option value="fire">Fire</option>
                    <option value="tsunami">Tsunami</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Describe this drill..."
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Step-by-step instructions..."
                />
              </div>

              {/* Questions Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Questions</h3>

                {/* Add Question Form */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question *
                    </label>
                    <input
                      type="text"
                      name="question"
                      value={currentQuestion.question}
                      onChange={handleQuestionChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      placeholder="Enter question..."
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Options *
                    </label>
                    {currentQuestion.options.map((option, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder={`Option ${idx + 1}`}
                        />
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="correctAnswer"
                            value={idx}
                            checked={currentQuestion.correctAnswer === idx}
                            onChange={() =>
                              setCurrentQuestion({
                                ...currentQuestion,
                                correctAnswer: idx,
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm">Correct</span>
                        </label>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Add Question
                  </button>
                </div>

                {/* Questions List */}
                {formData.questions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">
                      Added Questions ({formData.questions.length})
                    </h4>
                    {formData.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {idx + 1}. {q.question}
                          </p>
                          <p className="text-sm text-gray-600">
                            Answer: {q.options[q.correctAnswer]}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          className="text-red-600 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {editingId ? "Update Drill" : "Create Drill"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Drills List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading drills...</p>
            </div>
          ) : drills.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No drills created yet</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Create First Drill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drills.map((drill) => (
                <div
                  key={drill._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${
                      drill.type === "earthquake"
                        ? "from-red-500 to-red-600"
                        : drill.type === "flood"
                        ? "from-blue-500 to-blue-600"
                        : drill.type === "cyclone"
                        ? "from-yellow-500 to-yellow-600"
                        : "from-purple-500 to-purple-600"
                    }`}
                  ></div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">
                      {drill.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {drill.description}
                    </p>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                        {drill.type}
                      </span>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full text-white capitalize ${
                        drill.difficulty === "easy"
                          ? "bg-green-600"
                          : drill.difficulty === "medium"
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }`}>
                        {drill.difficulty}
                      </span>
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        {drill.duration} min
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Questions: {drill.questions?.length || 0}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/drill/${drill._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                      <button
                        onClick={() => {
                          setFormData(drill);
                          setEditingId(drill._id);
                          setShowForm(true);
                        }}
                        className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(drill._id)}
                        className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrillManagement;
