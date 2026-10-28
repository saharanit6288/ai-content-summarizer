const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Content Summarizer API is running",
    timestamp: new Date().toISOString()
  });
});

module.exports = app;