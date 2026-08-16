import Link from "next/link";
import { Heart, LogOut } from "lucide-react";

export function Header({ matchCount = 0 }: { matchCount?: number }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3.5">
        <Link href="/listings" className="flex items-center gap-1.5">
          <span className="font-display text-lg font-bold tracking-tight text-ink">Roomy</span>
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/matches"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
            aria-label="Moje shody"
          >
            <Heart className="h-[18px] w-[18px]" strokeWidth={2} />
            {matchCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-paper">
                {matchCount}
              </span>
            )}
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Odhlásit se"
            >
              <LogOut className="h-[17px] w-[17px]" strokeWidth={1.9} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
