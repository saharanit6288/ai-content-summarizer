import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createSummaryController
} from "../controllers/summary.controller.js";

const router = Router();

router.post(
  "/",
  authenticateToken,
  createSummaryController
);

export default router;