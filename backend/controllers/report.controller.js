import Report from "../models/report.model.js";

// Create a new report
export const createReport = async (req, res) => {
  try {
    const payload = req.body || {};
    const report = new Report({
      disasterType: payload.disasterType,
      location: payload.location,
      severity: payload.severity,
      notes: payload.notes || "",
      reporterId: req.user?._id,
    });
    await report.save();
    res.status(201).json({ message: "Report submitted successfully." });
  } catch (err) {
    console.error("Report submission error:", err);
    res.status(500).json({ message: "Failed to submit report." });
  }
};

// Get all reports (admin only)
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate(
      "reporterId",
      "name email role"
    );
    res.status(200).json(reports);
  } catch (err) {
    console.error("Report fetch error:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};
