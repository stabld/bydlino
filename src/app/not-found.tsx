import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
        <SearchX className="h-6 w-6 text-accent" strokeWidth={1.75} />
      </div>
      <h1 className="mt-5 font-display text-xl font-bold text-fg">Tahle stránka neexistuje</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Inzerát mohl být smazaný, nebo je odkaz překlepnutý.
      </p>
      <Link
        href="/listings"
        className="mt-6 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-black shadow-sm"
      >
        Zpět na nabídky
      </Link>
    </main>
  );
}
