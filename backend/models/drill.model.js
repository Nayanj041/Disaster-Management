import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
});

const drillSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["earthquake", "flood", "cyclone", "fire", "tsunami"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    duration: { type: Number, default: 5 }, // in minutes
    region: { type: String, default: "all" },
    instructions: { type: String, default: "" },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Legacy fields for backward compatibility
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "completed", "in-progress"],
      default: "pending",
    },
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Drill = mongoose.model("Drill", drillSchema);
export default Drill;

