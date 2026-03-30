import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import drillRoutes from "./routes/drill.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { config } from "./config/env.js";
import alertRoutes from "./routes/alerts.routes.js";
import { fetchNASAAlerts } from "./cron/fetchNASAAlerts.js";
dotenv.config();
import fetchIMDAlerts from "./cron/fetchIMDAlerts.js";
import fetchNDMAAlerts from "./cron/fetchNDMAAlerts.js";
const PORT = process.env.PORT || 5001;
import gamificationRoutes from "./routes/gamification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import moduleRoutes from "./routes/module.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import riskRoutes from "./routes/risk.routes.js";
import mlRoutes from "./routes/ml.routes.js";
import resilienceRoutes from "./routes/resilience.routes.js";

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5174",
  "https://sih2025-1-pjfk.onrender.com"
];

const isCodespacesOrigin = (origin) => {
  return /https:\/\/.*\.app\.github\.dev$/.test(origin);
};

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || isCodespacesOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/drills", drillRoutes);
app.use("/api/v1/drills", drillRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/resilience", resilienceRoutes);
app.use("/api/v1/reports", reportRoutes);
app.get("/", (req, res) => {
  res.send("Server Already Running.");
});

console.log("⏳ Fetching NASA alerts...");

connectDB()
  .then(() => {
    setInterval(fetchNASAAlerts, 30 * 60 * 1000);
    setInterval(fetchIMDAlerts, 30 * 60 * 1000);
    setInterval(fetchNDMAAlerts, 30 * 60 * 1000);
    app.listen(PORT, () => {
      console.log(`Server is live at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting the DB..", err.message);
    process.exit(1);
  });
