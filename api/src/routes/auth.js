import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

async function uniqueUsernameFrom(name) {
  const base = (name.trim().split(/\s+/)[0] || "user").toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
  let candidate = base;
  let suffix = 1;
  while (await User.exists({ username: candidate })) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }
  return candidate;
}

authRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const username = await uniqueUsernameFrom(name);
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    username,
    passwordHash,
    bio: "",
  });

  const token = signToken(user._id.toString());
  res.status(201).json({ token, user: user.toPublicJSON() });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user._id.toString());
  res.json({ token, user: user.toPublicJSON() });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});
