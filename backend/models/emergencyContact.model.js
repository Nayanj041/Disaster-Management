import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    phone: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "police",
        "ambulance",
        "fire",
        "disaster",
        "helpline",
        "emergency",
        "medical",
        "utility",
        "government",
        "shelter",
        "support",
      ],
      default: "helpline",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    region: { type: String, default: "All" },
  },
  { timestamps: true }
);

const EmergencyContact = mongoose.model("EmergencyContact", emergencyContactSchema);

export default EmergencyContact;