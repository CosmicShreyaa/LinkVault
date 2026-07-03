import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, Search, Tag, Share2, StickyNote, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-hero">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-dots opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brass" />
            A calmer home for the internet you love
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] md:text-7xl">
            Save every link.
            <br />
            <span className="text-brass">Find any of them.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            LinkVault is a bookmark manager for people who actually read.
            Tag, annotate, search, and share a curated corner of the web that's
            unmistakably yours.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-brass text-vault-foreground hover:opacity-90">
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Start your vault
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/u/$username" params={{ username: "alex" }}>
                See a public profile
              </Link>
            </Button>
          </div>

          {/* Preview card */}
          <div className="relative mx-auto mt-20 max-w-4xl">
            <div className="absolute -inset-8 bg-brass opacity-20 blur-3xl" aria-hidden />
            <div className="relative rounded-2xl border border-border bg-card-gradient p-2 shadow-vault">
              <div className="rounded-xl border border-border/60 bg-surface">
                <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  </div>
                  <div className="ml-4 flex flex-1 items-center gap-2 rounded-md bg-background/60 px-3 py-1.5 text-xs text-muted-foreground">
                    <Search className="h-3.5 w-3.5" />
                    search your vault…
                  </div>
                </div>
                <div className="grid gap-3 p-6 sm:grid-cols-2">
                  {previewCards.map((c) => (
                    <div
                      key={c.title}
                      className="rounded-lg border border-border/60 bg-background/40 p-4 text-left"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-4 w-4 rounded bg-brass/70" />
                        {c.host}
                      </div>
                      <div className="mt-2 line-clamp-1 text-sm font-medium">{c.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {c.desc}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card-gradient p-6 transition-all hover:border-primary/40"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brass shadow-glow">
                <f.icon className="h-5 w-5 text-vault-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card-gradient px-8 py-16 text-center shadow-vault">
          <div className="absolute inset-0 grid-dots opacity-30" aria-hidden />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-4xl font-semibold md:text-5xl">
              Your reading list, <span className="text-brass">finally organized.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Free while it's in preview. Bring every stray tab home.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-brass text-vault-foreground hover:opacity-90"
            >
              <Link to="/auth" search={{ mode: "signup" } as never}>
                Create your vault
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LinkVault · A mock frontend, built for demonstration.
      </footer>
    </div>
  );
}

const previewCards = [
  {
    host: "tanstack.com",
    title: "TanStack Router — Type-safe routing",
    desc: "Modern, powerful routing for React with first-class TypeScript support.",
    tags: ["react", "routing", "dev"],
  },
  {
    host: "nngroup.com",
    title: "10 Usability Heuristics",
    desc: "Nielsen's foundational heuristics — still the gold standard.",
    tags: ["design", "ux"],
  },
  {
    host: "every.to",
    title: "The Art of Finishing",
    desc: "Why shipping is the hardest part of creative work.",
    tags: ["essays", "productivity"],
  },
  {
    host: "oklch.com",
    title: "OKLCH Color Picker",
    desc: "Perceptually uniform color for modern design systems.",
    tags: ["design", "tools"],
  },
];

const features = [
  {
    icon: Bookmark,
    title: "Save anything, in one keystroke",
    body: "Paste a URL and LinkVault fetches the title, favicon, and a clean summary automatically.",
  },
  {
    icon: Tag,
    title: "Tag it your way",
    body: "Multi-tag every link. Filter, combine, and rediscover the thread of what you were reading.",
  },
  {
    icon: Search,
    title: "Instant, forgiving search",
    body: "Full-text search across titles, notes, and URLs — fast even when your vault crosses ten thousand.",
  },
  {
    icon: StickyNote,
    title: "Notes that stay put",
    body: "Attach the quote, the reason, the follow-up. Your future self will thank you.",
  },
  {
    icon: Share2,
    title: "A shareable public profile",
    body: "Turn any bookmark public and hand out one clean URL — like a personal reading list on tap.",
  },
  {
    icon: Sparkles,
    title: "Designed to feel calm",
    body: "No infinite scroll, no dopamine loops. Just a quiet room for the internet you actually chose.",
  },
];
