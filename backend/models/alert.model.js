import mongoose from "mongoose";
const AlertSchema = new mongoose.Schema({
  type: String,
  severity: String,
  region: String,
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  message: String,
  source: String,
  timestamp: Date,
  status: { type: String, default: "Active" },
});
AlertSchema.index({ region: 1 });
AlertSchema.index({ severity: 1 });
AlertSchema.index({ latitude: 1, longitude: 1 });
const Alert = mongoose.model("Alert", AlertSchema);
export default Alert;
