import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark as BookmarkIcon,
  ExternalLink,
  Globe,
  Lock,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { faviconFor, hostOf, useStore, type Bookmark } from "@/lib/store";
import { ApiError } from "@/lib/api-client";

export const Route = createFileRoute("/app")({
  component: DashboardPage,
});

function DashboardPage() {
  const {
    user,
    bookmarks,
    isLoading,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    togglePin,
    toggleVisibility,
  } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [view, setView] = useState<"all" | "public" | "private" | "pinned">("all");
  const [editing, setEditing] = useState<Bookmark | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/auth" });
  }, [user, isLoading, navigate]);

  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    bookmarks.forEach((b) => b.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [bookmarks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookmarks
      .filter((b) => {
        if (view === "public" && !b.isPublic) return false;
        if (view === "private" && b.isPublic) return false;
        if (view === "pinned" && !b.pinned) return false;
        if (activeTag && !b.tags.includes(activeTag)) return false;
        if (!q) return true;
        return (
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.notes.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if ((b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) !== 0)
          return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      });
  }, [bookmarks, query, activeTag, view]);

  const stats = useMemo(
    () => ({
      total: bookmarks.length,
      pub: bookmarks.filter((b) => b.isPublic).length,
      tags: allTags.length,
    }),
    [bookmarks, allTags],
  );

  const onSave = async (data: Omit<Bookmark, "id" | "createdAt">) => {
    try {
      if (editing) {
        await updateBookmark(editing.id, data);
        toast.success("Bookmark updated");
      } else {
        await addBookmark(data);
        toast.success("Bookmark saved");
      }
      setIsOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    }
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Vault of</div>
            <div className="mt-1 font-display text-xl font-semibold">{user.name}</div>
            <Link
              to="/u/$username"
              params={{ username: user.username }}
              className="mt-1 inline-flex items-center gap-1 text-xs text-brass hover:underline"
            >
              linkvault.app/u/{user.username}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-1">
            {(
              [
                { k: "all", label: "All bookmarks", n: stats.total, icon: BookmarkIcon },
                { k: "pinned", label: "Pinned", n: bookmarks.filter((b) => b.pinned).length, icon: Pin },
                { k: "public", label: "Public", n: stats.pub, icon: Globe },
                { k: "private", label: "Private", n: stats.total - stats.pub, icon: Lock },
              ] as const
            ).map((it) => (
              <button
                key={it.k}
                onClick={() => setView(it.k)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  view === it.k
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </span>
                <span className="text-xs">{it.n}</span>
              </button>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              <span>Tags</span>
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="text-brass hover:underline"
                >
                  clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allTags.length === 0 && (
                <p className="text-xs text-muted-foreground">No tags yet.</p>
              )}
              {allTags.map(([t, n]) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(activeTag === t ? null : t)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    activeTag === t
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  }`}
                >
                  #{t} <span className="opacity-60">{n}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">
                {view === "all"
                  ? "All bookmarks"
                  : view === "public"
                    ? "Public bookmarks"
                    : view === "private"
                      ? "Private bookmarks"
                      : "Pinned"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "link" : "links"}
                {activeTag && (
                  <>
                    {" "}· filtered by{" "}
                    <span className="text-brass">#{activeTag}</span>
                  </>
                )}
              </p>
            </div>
            <Button
              className="bg-brass text-vault-foreground hover:opacity-90"
              onClick={() => {
                setEditing(null);
                setIsOpen(true);
              }}
            >
              <Plus className="mr-1 h-4 w-4" /> Save a link
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, notes, URLs, or #tags…"
              className="h-12 pl-10 text-base"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState onAdd={() => setIsOpen(true)} query={query} />
          ) : (
            <div className="grid gap-3">
              {filtered.map((b) => (
                <BookmarkCard
                  key={b.id}
                  bookmark={b}
                  onEdit={() => {
                    setEditing(b);
                    setIsOpen(true);
                  }}
                  onDelete={async () => {
                    try {
                      await deleteBookmark(b.id);
                      toast.success("Bookmark deleted");
                    } catch (err) {
                      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
                    }
                  }}
                  onPin={() =>
                    togglePin(b.id).catch((err) =>
                      toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
                    )
                  }
                  onToggleVisibility={() =>
                    toggleVisibility(b.id).catch((err) =>
                      toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
                    )
                  }
                  onTagClick={(t) => setActiveTag(t)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <BookmarkDialog
        open={isOpen}
        onOpenChange={(o) => {
          setIsOpen(o);
          if (!o) setEditing(null);
        }}
        editing={editing}
        onSave={onSave}
      />
    </div>
  );
}

function BookmarkCard({
  bookmark: b,
  onEdit,
  onDelete,
  onPin,
  onToggleVisibility,
  onTagClick,
}: {
  bookmark: Bookmark;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
  onToggleVisibility: () => void;
  onTagClick: (t: string) => void;
}) {
  const favicon = b.favicon || faviconFor(b.url);
  return (
    <article className="group rounded-xl border border-border bg-card-gradient p-5 transition-all hover:border-primary/40">
      <div className="flex gap-4">
        <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-background">
          {favicon ? (
            <img src={favicon} alt="" className="h-5 w-5" />
          ) : (
            <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{hostOf(b.url)}</span>
            <span>·</span>
            <span>
              {new Date(b.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            {b.pinned && (
              <span className="inline-flex items-center gap-1 text-brass">
                <Pin className="h-3 w-3" /> pinned
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              {b.isPublic ? (
                <>
                  <Globe className="h-3 w-3" /> public
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" /> private
                </>
              )}
            </span>
          </div>

          <a
            href={b.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-flex items-baseline gap-2 text-lg font-medium text-foreground hover:text-brass"
          >
            <span className="line-clamp-1">{b.title}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-70" />
          </a>

          {b.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
          )}

          {b.notes && (
            <div className="mt-3 rounded-lg border-l-2 border-primary/60 bg-background/40 px-3 py-2 text-sm text-foreground/80">
              <span className="mr-1 text-xs uppercase tracking-wider text-primary">note</span>
              {b.notes}
            </div>
          )}

          {b.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {b.tags.map((t) => (
                <button
                  key={t}
                  onClick={() => onTagClick(t)}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          <Button size="icon" variant="ghost" onClick={onPin} title={b.pinned ? "Unpin" : "Pin"}>
            {b.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleVisibility}
            title={b.isPublic ? "Make private" : "Make public"}
          >
            {b.isPublic ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={onEdit} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete} title="Delete">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ onAdd, query }: { onAdd: () => void; query: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/40 py-20 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brass shadow-glow">
        <Sparkles className="h-6 w-6 text-vault-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        {query ? "No matches" : "Your vault is quiet"}
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {query
          ? "Try a different keyword or clear the filter."
          : "Save your first link — the internet you meant to read, in one place."}
      </p>
      {!query && (
        <Button onClick={onAdd} className="mt-6 bg-brass text-vault-foreground hover:opacity-90">
          <Plus className="mr-1 h-4 w-4" /> Save a link
        </Button>
      )}
    </div>
  );
}

function BookmarkDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Bookmark | null;
  onSave: (b: Omit<Bookmark, "id" | "createdAt">) => void;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (open) {
      setUrl(editing?.url ?? "");
      setTitle(editing?.title ?? "");
      setDescription(editing?.description ?? "");
      setTags(editing?.tags.join(", ") ?? "");
      setNotes(editing?.notes ?? "");
      setIsPublic(editing?.isPublic ?? true);
    }
  }, [open, editing]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onSave({
      url,
      title: title || hostOf(url),
      description,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      notes,
      isPublic,
      pinned: editing?.pinned ?? false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit bookmark" : "Save a new link"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is this?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="A one-liner to help future you."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma, separated, tags"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Personal notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Quotes, follow-ups, why it matters…"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3">
            <div>
              <div className="text-sm font-medium">
                {isPublic ? "Public" : "Private"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isPublic
                  ? "Visible on your public profile"
                  : "Only you can see this bookmark"}
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brass text-vault-foreground hover:opacity-90"
            >
              {editing ? "Save changes" : "Add to vault"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Suppress unused import warnings for icons imported for future use
void Share2;
