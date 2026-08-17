import Link from "next/link";
import { LogOut } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-md supports-[backdrop-filter]:bg-bg/60">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3.5">
        <Link href="/listings" className="flex items-center gap-1.5">
          <span className="bg-gradient-primary bg-clip-text font-display text-lg font-bold tracking-tight text-transparent">
            Bydlino
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg"
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
