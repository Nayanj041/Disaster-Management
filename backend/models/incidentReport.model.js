import mongoose from "mongoose";

const incidentReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    incidentType: {
      type: String,
      enum: ["flood", "cyclone", "earthquake", "fire", "landslide", "heatwave", "other"],
      default: "other",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    location: {
      region: { type: String, required: true, trim: true },
      city: { type: String, default: "", trim: true },
      address: { type: String, default: "", trim: true },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    mediaUrls: [{ type: String }],
    reporterContact: {
      phone: { type: String, default: "", trim: true },
      alternatePhone: { type: String, default: "", trim: true },
      preferredChannel: {
        type: String,
        enum: ["phone", "sms", "whatsapp", "email", "in-app"],
        default: "in-app",
      },
      isAnonymous: { type: Boolean, default: false },
    },
    impact: {
      peopleAffected: { type: Number, default: 0, min: 0 },
      injuriesReported: { type: Number, default: 0, min: 0 },
      infrastructureDamage: {
        type: String,
        enum: ["none", "minor", "moderate", "severe"],
        default: "none",
      },
      utilityOutage: {
        power: { type: Boolean, default: false },
        water: { type: Boolean, default: false },
        telecom: { type: Boolean, default: false },
      },
    },
    status: {
      type: String,
      enum: ["open", "triaged", "investigating", "resolved", "closed"],
      default: "open",
    },
    operational: {
      sourceReliability: {
        type: String,
        enum: ["unverified", "community", "official"],
        default: "unverified",
      },
      priority: {
        type: String,
        enum: ["p4-low", "p3-medium", "p2-high", "p1-critical"],
        default: "p3-medium",
      },
      assignedResponder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      responseSlaMinutes: { type: Number, default: 60, min: 5 },
      tags: [{ type: String, trim: true }],
      fallbackNotification: {
        smsAttempted: { type: Boolean, default: false },
        smsStatus: {
          type: String,
          enum: ["not_attempted", "queued", "sent", "failed"],
          default: "not_attempted",
        },
        smsReference: { type: String, default: "" },
      },
    },
    timeline: [
      {
        event: { type: String, required: true, trim: true },
        actor: { type: String, default: "system", trim: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    verification: {
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      verifiedAt: { type: Date, default: null },
      notes: { type: String, default: "", trim: true },
    },
  },
  { timestamps: true }
);

incidentReportSchema.index({ "location.region": 1, createdAt: -1 });
incidentReportSchema.index({ incidentType: 1, severity: 1 });
incidentReportSchema.index({ "verification.status": 1, createdAt: -1 });
incidentReportSchema.index({ status: 1, "operational.priority": 1, createdAt: -1 });

const IncidentReport = mongoose.model("IncidentReport", incidentReportSchema);

export default IncidentReport;
