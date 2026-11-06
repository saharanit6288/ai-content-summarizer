import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/index.js";
import { AppError } from "../utils/app-error.js";
import logger from "../config/logger.js";

export function errorMiddleware(err, req, res, next) {
  console.error("Application Error:", err);

  logger.error("Application Error", {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode || 500,
        method: req.method,
        url: req.originalUrl,
    });

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Prisma unique constraint errors
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
  }

  // Prisma record not found
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2025"
  ) {
    return res.status(404).json({
      success: false,
      message: "Requested record was not found",
    });
  }

  // Custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File size exceeds the allowed limit"
        : "File upload failed";

    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Unexpected errors
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}