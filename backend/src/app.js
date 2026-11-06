import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { apiLimiter } from "./middleware/rate-limit.middleware.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use(helmet());

const allowedOrigins = (
    process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5000"
  )
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header,
      // such as Postman and server-to-server requests.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    optionsSuccessStatus: 204,
  })
);

app.use(requestLogger);

app.use(express.json({ limit: "1mb" }));

app.use("/api", apiLimiter);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Content Summarizer API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/db-health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "PostgreSQL connection successful"
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(503).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/summaries", summaryRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;