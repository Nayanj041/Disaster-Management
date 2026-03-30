import Drill from "../models/drill.model.js";
import User from "../models/user.model.js";

// Get all drills (for admin dashboard)
export const getAllDrills = async (req, res) => {
  try {
    const drills = await Drill.find().sort({ createdAt: -1 });
    res.json(drills);
  } catch (error) {
    console.error("Error in getAllDrills:", error);
    res.status(500).json({ message: "Failed to fetch drills: " + error.message });
  }
};

export const createDrill = async (req, res) => {
  try {
    const { title, description, type, difficulty, duration, region, instructions, questions } = req.body;
    
    // Validate required fields
    if (!title || !description || !type || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const drill = new Drill({
      title,
      description,
      type,
      difficulty: difficulty || "medium",
      duration: duration || 5,
      region: region || "all",
      instructions,
      questions,
      createdBy: req.user?._id,
    });
    
    await drill.save();
    res.status(201).json({ message: "Drill created successfully", drill });
  } catch (error) {
    console.error("Error in createDrill:", error);
    res.status(500).json({
      message: "Error creating drill: " + error.message,
    });
  }
};

// Update a drill
export const updateDrill = async (req, res) => {
  try {
    const { drillId } = req.params;
    const updateData = req.body;

    const updatedDrill = await Drill.findByIdAndUpdate(
      drillId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDrill) {
      return res.status(404).json({ message: "Drill not found" });
    }

    res.status(200).json({
      message: "Drill updated successfully",
      drill: updatedDrill,
    });
  } catch (error) {
    console.error("Error in updateDrill:", error);
    res.status(500).json({
      message: "Error updating drill: " + error.message,
    });
  }
};

// Delete a drill
export const deleteDrill = async (req, res) => {
  try {
    const { drillId } = req.params;

    const deletedDrill = await Drill.findByIdAndDelete(drillId);

    if (!deletedDrill) {
      return res.status(404).json({ message: "Drill not found" });
    }

    res.status(200).json({
      message: "Drill deleted successfully",
      drill: deletedDrill,
    });
  } catch (error) {
    console.error("Error in deleteDrill:", error);
    res.status(500).json({
      message: "Error deleting drill: " + error.message,
    });
  }
};

export const updateDrillStatus = async (req, res) => {
  try {
    const { drillId } = req.params;
    const { status, score } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const updatedDrill = await Drill.findByIdAndUpdate(
      drillId,
      { status, score },
      { new: true } // This option returns the updated document
    );

    if (!updatedDrill) {
      return res.status(404).json({ message: "Drill not found." });
    }

    res.status(200).json({
      message: "Drill status updated successfully.",
      drill: updatedDrill,
    });
  } catch (err) {
    console.error("Error in updateDrillStatus:", err);
    res.status(500).json({
      message:
        "Some error is occured at upDrillStatus in drill controller!" +
        err.message,
    });
  }
};

export const getUserDrills = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("region");
    const drills = await Drill.find({
      $or: [
        { userId },
        { region: "all" },
        ...(user?.region ? [{ region: user.region }] : []),
      ],
    }).sort({ createdAt: -1 });
    res.json(drills);
  } catch (err) {
    console.error("Error in getUserDrills:", err);
    res.status(500).json([]);
  }
};

// Add a new controller function to handle the completion logic
export const completeDrill = async (req, res) => {
  try {
    const { drillId, score } = req.body;

    const updatedDrill = await Drill.findByIdAndUpdate(
      drillId,
      { status: "completed", score: score },
      { new: true }
    );

    if (!updatedDrill) {
      return res.status(404).json({ message: "Drill not found." });
    }

    res
      .status(200)
      .json({ message: "Drill completed successfully.", drill: updatedDrill });
  } catch (err) {
    console.error("Error in completeDrill:", err);
    res.status(500).json({
      message: "Some error occurred while completing the drill: " + err.message,
    });
  }
};

