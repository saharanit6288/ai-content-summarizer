import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createSummaryController, createSummaryFromUrlController
} from "../controllers/summary.controller.js";

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

export default router;