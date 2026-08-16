import { Wrench } from "lucide-react";

/**
 * Placeholder komponenta pro budoucí propagaci Remexa uvnitř Roomy.
 * Zatím žádné skutečné odkazy ani monetizace — pouze vizuální zástupný blok.
 */
export function RemexoBanner() {
  return (
    <div className="rounded-card border border-line bg-ink px-5 py-4 text-paper">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper/10">
          <Wrench className="h-4 w-4 text-gold" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-[15px] font-medium leading-snug">
            Stěhuješ se nebo potřebuješ něco opravit?
          </p>
          <p className="mt-0.5 text-sm text-paper/60">
            Vyřeš to přes Remexo —{" "}
            <span className="font-mono text-[11px] uppercase tracking-wide text-gold">brzy tady</span>
          </p>
        </div>
      </div>
    </div>
  );
}
