"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
 }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
        <AlertTriangle className="h-6 w-6 text-accent" strokeWidth={1.75} />
      </div>
      <h1 className="mt-5 font-display text-xl font-bold text-fg">Něco se pokazilo</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Zkus to načíst znovu. Pokud to bude padat dál, napiš nám a přilož kód níže.
      </p>
      {error.digest && (
        <code className="mt-3 rounded-lg border border-line bg-surface px-3 py-1.5 font-mono text-xs text-muted">
          {error.digest}
        </code>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-black shadow-sm"
      >
        <RotateCcw className="h-4 w-4" strokeWidth={2} />
        Zkusit znovu
      </button>
    </main>
  );
}
