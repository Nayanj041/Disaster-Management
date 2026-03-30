import mongoose from "mongoose";

const resourceCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["shelter", "hospital", "ambulance", "relief", "food", "water"],
      required: true,
    },
    region: { type: String, required: true, trim: true },
    city: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    capacity: { type: Number, default: 0 },
    currentOccupancy: { type: Number, default: 0 },
    contact: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

resourceCenterSchema.index({ region: 1, type: 1, isActive: 1 });

const ResourceCenter = mongoose.model("ResourceCenter", resourceCenterSchema);

export default ResourceCenter;
