import mongoose from "mongoose";

const moduleSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["video", "reading", "text"],
      default: "reading",
    },
    duration: { type: String, default: "10 min" },
    content: { type: String, required: true },
    keyPoints: [{ type: String }],
    image: { type: String, default: "" },
  },
  { _id: true }
);

const moduleQuizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: true }
);

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    icon: { type: String, default: "📘" },
    image: { type: String, default: "" },
    duration: { type: String, default: "45 min" },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    regions: [{ type: String, default: "All" }],
    rating: { type: Number, default: 4.5 },
    enrolled: { type: Number, default: 0 },
    sections: [moduleSectionSchema],
    quiz: {
      title: { type: String, default: "Module Assessment" },
      timeLimit: { type: Number, default: 300 },
      questions: [moduleQuizQuestionSchema],
    },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Module = mongoose.model("Module", moduleSchema);

export default Module;
