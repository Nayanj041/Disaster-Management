import mongoose from "mongoose";

const volunteerTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    region: { type: String, required: true, trim: true },
    zone: { type: String, default: "", trim: true },
    skillRequired: {
      type: String,
      enum: ["medical", "logistics", "rescue", "communications", "general"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["p4-low", "p3-medium", "p2-high", "p1-critical"],
      default: "p3-medium",
    },
    status: {
      type: String,
      enum: ["open", "assigned", "in-progress", "completed"],
      default: "open",
    },
    requiredVolunteers: { type: Number, default: 1, min: 1 },
    estimatedHours: { type: Number, default: 1, min: 1 },
    geofence: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      radiusMeters: { type: Number, default: 500, min: 100 },
    },
    completionReport: {
      summary: { type: String, default: "", trim: true },
      verified: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

volunteerTaskSchema.index({ region: 1, status: 1, priority: 1, createdAt: -1 });

const VolunteerTask = mongoose.model("VolunteerTask", volunteerTaskSchema);

export default VolunteerTask;
