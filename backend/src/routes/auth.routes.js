import { Router } from "express";
import {
  register,
  login
} from "../controllers/auth.controller.js";
import {
  authenticateToken
} from "../middleware/auth.middleware.js";
import { prisma } from "../config/prisma.js";
import {
  authLimiter,
  registerLimiter,
} from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post("/register", registerLimiter, register);
router.post("/login", authLimiter, login);

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Profile retrieval failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile"
    });
  }
});

export default router;