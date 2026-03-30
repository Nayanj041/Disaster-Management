import { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, isUpdatingProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    region: user?.region || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    institution: user?.institution || "",
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Not Authenticated
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      region: user?.region || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      institution: user?.institution || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-24"></div>

          {/* Profile Content */}
          <div className="px-6 py-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start justify-between mb-8 -mt-16 relative z-10">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-white flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="pb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.name}
                  </h2>
                  <p className="text-sm text-gray-600 capitalize">
                    {user?.role} • {user?.region}
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Fields */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{user?.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{user?.email}</p>
                    )}
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {user?.region || "N/A"}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <p className="text-gray-900 font-medium capitalize">
                      {user?.role}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {user?.phone || "N/A"}
                      </p>
                    )}
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution/Organization
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="institution"
                        value={formData.institution}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {user?.institution || "N/A"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">
                    {user?.bio || "No bio added yet"}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">XP Points</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {user?.stats?.xp || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Drills Done</p>
                    <p className="text-2xl font-bold text-green-600">
                      {user?.stats?.drillsCompleted || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Badges</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {user?.stats?.badges || 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">Streak</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {user?.stats?.streak || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSave}
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4" />
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
