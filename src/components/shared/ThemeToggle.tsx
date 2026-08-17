"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

/**
 * Přepínač světlého a tmavého režimu. Volbu si pamatuje v localStorage;
 * o nastavení při prvním vykreslení se stará skript v layoutu (kvůli probliknutí).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme) || "dark";
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Soukromý režim může localStorage blokovat — volba pak platí jen do zavření.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Přepnout na světlý režim" : "Přepnout na tmavý režim"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg",
        className
      )}
    >
      {/* Než se komponenta připojí, neznáme režim — ikonu držíme neutrální. */}
      {mounted && theme === "light" ? (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.9} />
      ) : (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.9} />
      )}
    </button>
  );
}
