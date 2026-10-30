import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET must be configured with a strong secret"
  );
}

const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    jwtSecret,
    {
      expiresIn,
      algorithm: "HS256"
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, jwtSecret, {
    algorithms: ["HS256"]
  });
}