import mongoose from "mongoose";

const alertPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
      voice: { type: Boolean, default: false },
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: "22:00" },
      end: { type: String, default: "06:00" },
    },
    preferredLanguage: { type: String, default: "en" },
    emergencyOverride: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AlertPreference = mongoose.model("AlertPreference", alertPreferenceSchema);

export default AlertPreference;
