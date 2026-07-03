import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { ApiError } from "@/lib/api-client";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp } = useStore();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(name, email, password);
      } else {
        await signIn(email, password);
      }
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-hero md:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col justify-between p-8 md:p-12">
        <Logo />

        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-3xl font-semibold">
            {mode === "signin" ? "Welcome back." : "Start your vault."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to open your bookmarks."
              : "Create an account to save your first link."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={mode === "signup" ? 8 : undefined}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-brass text-vault-foreground hover:opacity-90"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              className="font-medium text-brass hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </div>

        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
      </div>

      {/* Right: art */}
      <div className="relative hidden overflow-hidden border-l border-border md:block">
        <div className="absolute inset-0 grid-dots opacity-40" aria-hidden />
        <div className="absolute -right-20 top-10 h-96 w-96 rounded-full bg-brass opacity-30 blur-3xl" aria-hidden />
        <div className="relative flex h-full flex-col justify-end p-12">
          <blockquote className="max-w-md font-display text-3xl leading-snug text-foreground/90">
            "I used to lose the good links. Now I have a place I actually revisit."
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">— A satisfied fictional user</p>
        </div>
      </div>
    </div>
  );
}
