// src/config/env.js
import dotenv from "dotenv";
dotenv.config();

if (!process.env.SECRET_PRIVATE_KEY) {
  throw new Error("❌ SECRET_PRIVATE_KEY must be defined in .env");
}

export const config = {
  port: process.env.PORT || 5001,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  secretKey: process.env.SECRET_PRIVATE_KEY,
  smsProvider: process.env.SMS_PROVIDER || "console",
  smsSenderId: process.env.SMS_SENDER_ID || "SURAKSHA",
};
