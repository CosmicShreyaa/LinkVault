import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.patch("/me", requireAuth, async (req, res) => {
  const { name, bio, avatar } = req.body ?? {};

  if (name !== undefined) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio;
  if (avatar !== undefined) req.user.avatar = avatar;

  await req.user.save();
  res.json({ user: req.user.toPublicJSON() });
});
