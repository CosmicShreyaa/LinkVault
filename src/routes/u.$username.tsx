import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Copy, Globe, Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { faviconFor, hostOf } from "@/lib/store";
import { api, type ApiBookmark, type ApiUser } from "@/lib/api-client";

export const Route = createFileRoute("/u/$username")({
  component: PublicProfile,
});

function PublicProfile() {
  const { username } = Route.useParams();
  const [profile, setProfile] = useState<Pick<
    ApiUser,
    "username" | "name" | "bio" | "avatar"
  > | null>(null);
  const [publicBookmarks, setPublicBookmarks] = useState<ApiBookmark[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "not-found">("loading");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .publicProfile(username)
      .then(({ user, bookmarks }) => {
        if (cancelled) return;
        setProfile(user);
        setPublicBookmarks(bookmarks);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("not-found");
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const tags = useMemo(() => {
    const s = new Set<string>();
    publicBookmarks.forEach((b) => b.tags.forEach((t) => s.add(t)));
    return [...s];
  }, [publicBookmarks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publicBookmarks
      .filter((b) => {
        if (activeTag && !b.tags.includes(activeTag)) return false;
        if (!q) return true;
        return (
          b.title.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [publicBookmarks, query, activeTag]);

  const copyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="py-24 text-center text-muted-foreground">Loading profile…</div>
      </div>
    );
  }

  if (status === "not-found" || !profile) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold">No vault here yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            There's no LinkVault profile at @{username}.
          </p>
          <Link to="/" className="mt-6 inline-block text-sm text-brass hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-dots opacity-30" aria-hidden />
        <div className="absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-brass opacity-20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-brass text-2xl font-semibold text-vault-foreground shadow-glow">
            {profile.name
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <h1 className="mt-6 text-4xl font-semibold">{profile.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">@{profile.username}</p>
          <p className="mx-auto mt-4 max-w-lg text-foreground/80">{profile.bio}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-brass" />
              {publicBookmarks.length} public bookmarks
            </span>
            <span>·</span>
            <span>{tags.length} tags</span>
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy profile link
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${profile.name.split(" ")[0]}'s bookmarks…`}
            className="h-11 pl-10"
          />
        </div>

        {tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                !activeTag
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
              }`}
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(activeTag === t ? null : t)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  activeTag === t
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/40 py-16 text-center text-muted-foreground">
            Nothing to show here yet.
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card-gradient">
            {filtered.map((b) => (
              <li key={b.id}>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-accent/30"
                >
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-background">
                    <img src={faviconFor(b.url)} alt="" className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">{hostOf(b.url)}</div>
                    <div className="mt-0.5 line-clamp-1 font-medium text-foreground group-hover:text-brass">
                      {b.title}
                    </div>
                    {b.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {b.description}
                      </p>
                    )}
                    {b.notes && (
                      <p className="mt-2 border-l-2 border-primary/60 pl-3 text-sm italic text-foreground/70">
                        "{b.notes}"
                      </p>
                    )}
                    {b.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {b.tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs text-muted-foreground"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <Link to="/" className="text-brass hover:underline">
            LinkVault
          </Link>
          {" "}— make your own.
        </div>
      </div>
    </div>
  );
}
