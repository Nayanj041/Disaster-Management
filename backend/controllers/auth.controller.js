import User from "../models/user.model.js";
import Progress from "../models/progress.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      region: user.region,
    },
    process.env.SECRET_PRIVATE_KEY,
    { expiresIn: "7d" }
  );
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, region, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      console.error("Database connection failed - readyState:", mongoose.connection.readyState);
      return res.status(503).json({
        message: "Database unavailable. Check MongoDB/Atlas connection.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const newUser = await User.create({
      name,
      email,
      password,
      region: region || "India",
      role: role || "student",
    });

    // Create progress record for new user
    try {
      await Progress.create({
        userId: newUser._id,
        xp: 0,
        level: 1,
        earnedBadges: [],
        completedModules: 0,
        perfectQuizzes: 0,
        drillsCompleted: 0,
        dailyStreak: 0,
      });
      console.log("Progress record created for user:", newUser._id);
    } catch (progressError) {
      console.error("Error creating progress record:", progressError.message);
      // Don't fail signup if progress creation fails
    }

    const token = generateToken(newUser);
    
    // Set httpOnly cookie for authentication
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    console.log("User registered successfully:", newUser.email);
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({
      message: "Registration failed!",
      error: error.message,
    });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    // Set httpOnly cookie for authentication
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("User logged in successfully:", user.email);
    res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Login Failed",
      error: error.message,
    });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    console.log("User logged out successfully");
    res.status(200).json({
      message: "Logged Out Successfully!",
    });
  } catch (error) {
    console.log("Error in logout Controller", error);
    res.status(500).json({
      message: "Internal Server Error!",
    });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, region, phone, bio, institution } = req.body;
    const userId = req.user._id;

    // Validate email if changed
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (region) updateData.region = region;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (institution !== undefined) updateData.institution = institution;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Profile updated for user:", user.email);
    res.status(200).json({ user, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
