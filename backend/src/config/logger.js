import winston from "winston";
import path from "path";
import fs from "fs";

const logDirectory = path.resolve("logs");

// Create logs folder if it doesn't exist
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  transports: [
    // Console logging
    new winston.transports.Console(),

    // All logs
    new winston.transports.File({
      filename: path.join(logDirectory, "combined.log"),
    }),

    // Error logs only
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
    }),
  ],
});

export default logger;