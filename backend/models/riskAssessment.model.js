import mongoose from "mongoose";

const riskAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      region: { type: String, required: true },
      city: { type: String, default: "" },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    infrastructure: {
      buildingQuality: { type: Number, min: 1, max: 10, default: 5 },
      hospitalAccess: { type: Number, min: 1, max: 10, default: 5 },
      roadAccess: { type: Number, min: 1, max: 10, default: 5 },
      communicationAccess: { type: Number, min: 1, max: 10, default: 5 },
      shelterAvailability: { type: Number, min: 1, max: 10, default: 5 },
    },
    hazardProfile: {
      earthquake: { type: Number, min: 0, max: 100, default: 0 },
      flood: { type: Number, min: 0, max: 100, default: 0 },
      cyclone: { type: Number, min: 0, max: 100, default: 0 },
      fire: { type: Number, min: 0, max: 100, default: 0 },
    },
    overallRisk: { type: Number, min: 0, max: 100, required: true },
    preparednessScore: { type: Number, min: 0, max: 100, required: true },
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

riskAssessmentSchema.index({ "location.region": 1, createdAt: -1 });

const RiskAssessment = mongoose.model("RiskAssessment", riskAssessmentSchema);

export default RiskAssessment;
