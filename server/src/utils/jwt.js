import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "30d";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, getSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}
