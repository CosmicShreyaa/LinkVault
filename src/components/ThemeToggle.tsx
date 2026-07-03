import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle color theme"
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border border-border/70 transition-colors",
        "bg-gradient-to-r",
        isDark
          ? "from-[oklch(0.22_0.02_260)] to-[oklch(0.28_0.03_260)]"
          : "from-[oklch(0.92_0.03_80)] to-[oklch(0.86_0.05_60)]",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-all duration-300",
          isDark
            ? "left-[calc(100%-2px)] -translate-x-full bg-[oklch(0.16_0.014_260)] text-brass"
            : "left-[2px] bg-white text-[oklch(0.55_0.15_60)]",
        )}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
      <Sun
        className={cn(
          "absolute left-2 h-3.5 w-3.5 transition-opacity",
          isDark ? "opacity-40 text-muted-foreground" : "opacity-0",
        )}
      />
      <Moon
        className={cn(
          "absolute right-2 h-3.5 w-3.5 transition-opacity",
          isDark ? "opacity-0" : "opacity-40 text-muted-foreground",
        )}
      />
    </button>
  );
}
