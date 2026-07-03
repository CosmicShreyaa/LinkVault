import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const { user, signOut } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onApp = pathname.startsWith("/app");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link
              to="/"
              className="transition-colors hover:text-foreground [&.active]:text-foreground"
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            {user && (
              <Link
                to="/app"
                className="transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                My vault
              </Link>
            )}
            {user && (
              <Link
                to="/u/$username"
                params={{ username: user.username }}
                className="transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                Public profile
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle className="mr-1" />
          {user ? (
            <>
              {!onApp && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/app">Open vault</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-brass text-vault-foreground hover:opacity-90">
                <Link to="/auth" search={{ mode: "signup" } as never}>
                  Get started
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
