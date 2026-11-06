import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createSummaryController, createSummaryFromUrlController
} from "../controllers/summary.controller.js";
import { uploadSingleDocument } from "../middleware/file-upload.middleware.js";
import { createSummaryFromFileController } from "../controllers/file-summary.controller.js";
import {
  getSummaryHistoryController,
  getSummaryByIdController,
  deleteSummaryController,
  getSummaryStatsController
} from "../controllers/summary-history.controller.js";
import {
  textSummaryLimiter,
  websiteSummaryLimiter,
  fileUploadLimiter,
} from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post(
  "/",
  textSummaryLimiter,
  authenticateToken,
  createSummaryController
);

router.post(
  "/from-url",
  websiteSummaryLimiter,
  authenticateToken,
  createSummaryFromUrlController
);

router.post(
  "/from-file",
  fileUploadLimiter,
  authenticateToken,
  uploadSingleDocument,
  createSummaryFromFileController
);

// Summary history
router.get("/", authenticateToken, getSummaryHistoryController);

router.get("/stats", authenticateToken, getSummaryStatsController);

// Individual summary
router.get("/:id", authenticateToken, getSummaryByIdController);

// Delete summary
router.delete("/:id", authenticateToken, deleteSummaryController);

export default router;