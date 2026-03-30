import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    region: {
      type: String,
      default: "India",
    },
    phone: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    institution: {
      type: String,
      default: "",
    },
    stats: {
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      badges: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      drillsCompleted: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Hashing the password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;

