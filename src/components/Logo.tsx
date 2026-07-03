import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brass shadow-glow">
        <Lock className="h-4 w-4 text-vault-foreground" strokeWidth={2.5} />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">
        Link<span className="text-brass">Vault</span>
      </span>
    </Link>
  );
}
