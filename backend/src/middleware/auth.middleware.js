import { verifyAccessToken } from "../utils/jwt.js";

export function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required"
    });
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required"
    });
  }

  try {
    const payload = verifyAccessToken(token);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token"
      });
    }

    req.user = {
      id: payload.sub,
      email: payload.email
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token"
    });
  }
}