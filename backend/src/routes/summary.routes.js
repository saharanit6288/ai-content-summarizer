import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createSummaryController, createSummaryFromUrlController
} from "../controllers/summary.controller.js";
import { uploadSingleDocument } from "../middleware/file-upload.middleware.js";
import { createSummaryFromFileController } from "../controllers/file-summary.controller.js";

const router = Router();

router.post(
  "/",
  authenticateToken,
  createSummaryController
);

router.post(
  "/from-url",
  authenticateToken,
  createSummaryFromUrlController
);

router.post(
  "/from-file",
  authenticateToken,
  uploadSingleDocument,
  createSummaryFromFileController
);

export default router;