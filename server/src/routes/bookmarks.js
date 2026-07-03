import { Router } from "express";
import { Bookmark } from "../models/Bookmark.js";
import { requireAuth } from "../middleware/auth.js";

export const bookmarksRouter = Router();

bookmarksRouter.use(requireAuth);

function sortBookmarks(a, b) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return new Date(b.createdAt) - new Date(a.createdAt);
}

bookmarksRouter.get("/", async (req, res) => {
  const bookmarks = await Bookmark.find({ userId: req.user._id });
  const json = bookmarks.map((b) => b.toPublicJSON()).sort(sortBookmarks);
  res.json({ bookmarks: json });
});

bookmarksRouter.post("/", async (req, res) => {
  const { url, title, description, tags, notes, isPublic, pinned, favicon } = req.body ?? {};
  if (!url) return res.status(400).json({ error: "url is required" });

  const bookmark = await Bookmark.create({
    userId: req.user._id,
    url,
    title: title || url,
    description: description ?? "",
    tags: Array.isArray(tags) ? tags : [],
    notes: notes ?? "",
    isPublic: isPublic ?? true,
    pinned: pinned ?? false,
    favicon,
  });

  res.status(201).json({ bookmark: bookmark.toPublicJSON() });
});

bookmarksRouter.patch("/:id", async (req, res) => {
  const bookmark = await Bookmark.findOne({ _id: req.params.id, userId: req.user._id });
  if (!bookmark) return res.status(404).json({ error: "Bookmark not found" });

  const { url, title, description, tags, notes, isPublic, pinned, favicon } = req.body ?? {};
  if (url !== undefined) bookmark.url = url;
  if (title !== undefined) bookmark.title = title;
  if (description !== undefined) bookmark.description = description;
  if (tags !== undefined) bookmark.tags = tags;
  if (notes !== undefined) bookmark.notes = notes;
  if (isPublic !== undefined) bookmark.isPublic = isPublic;
  if (pinned !== undefined) bookmark.pinned = pinned;
  if (favicon !== undefined) bookmark.favicon = favicon;

  await bookmark.save();
  res.json({ bookmark: bookmark.toPublicJSON() });
});

bookmarksRouter.delete("/:id", async (req, res) => {
  const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!bookmark) return res.status(404).json({ error: "Bookmark not found" });
  res.status(204).send();
});
