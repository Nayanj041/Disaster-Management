import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    category: { type: String, default: "general" },
    completed: { type: Boolean, default: false },
    lastCompletedAt: { type: Date, default: null },
  },
  { _id: false }
);

const preparednessChecklistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [checklistItemSchema],
  },
  { timestamps: true }
);

const PreparednessChecklist = mongoose.model(
  "PreparednessChecklist",
  preparednessChecklistSchema
);

export default PreparednessChecklist;
