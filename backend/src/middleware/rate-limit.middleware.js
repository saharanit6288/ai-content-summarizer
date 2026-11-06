import rateLimit from "express-rate-limit";

const createRateLimiter = ({
  windowMs,
  max,
  message,
}) => {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
      success: false,
      message,
    },

    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
  });
};

// General API limiter
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later.",
});

// Authentication limiter
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again after 15 minutes.",
});

// Registration limiter
export const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts. Please try again later.",
});

// Text summarization limiter
export const textSummaryLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many summarization requests. Please try again later.",
});

// Website summarization limiter
export const websiteSummaryLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many website summarization requests. Please try again later.",
});

// File upload limiter
export const fileUploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many file upload requests. Please try again later.",
});