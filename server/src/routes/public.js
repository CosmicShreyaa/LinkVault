import { Router } from "express";
import { User } from "../models/User.js";
import { Bookmark } from "../models/Bookmark.js";

export const publicRouter = Router();

publicRouter.get("/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) return res.status(404).json({ error: "User not found" });

  const bookmarks = await Bookmark.find({ userId: user._id, isPublic: true });
  const json = bookmarks
    .map((b) => b.toPublicJSON())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    user: { username: user.username, name: user.name, bio: user.bio, avatar: user.avatar },
    bookmarks: json,
  });
});
