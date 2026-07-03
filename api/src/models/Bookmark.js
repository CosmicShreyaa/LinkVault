import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    url: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    favicon: { type: String },
    tags: { type: [String], default: [] },
    notes: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bookmarkSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    url: this.url,
    title: this.title,
    description: this.description,
    favicon: this.favicon,
    tags: this.tags,
    notes: this.notes,
    isPublic: this.isPublic,
    pinned: this.pinned,
    createdAt: this.createdAt.toISOString(),
  };
};

export const Bookmark = mongoose.models.Bookmark || mongoose.model("Bookmark", bookmarkSchema);
