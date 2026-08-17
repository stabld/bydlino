import { Wrench } from "lucide-react";

/**
 * Placeholder komponenta pro budoucí propagaci Remexa uvnitř Roomy.
 * Zatím žádné skutečné odkazy ani monetizace — pouze vizuální zástupný blok.
 */
export function RemexoBanner() {
  return (
    <div className="rounded-card bg-gradient-primary p-[1px]">
      <div className="flex items-start gap-3 rounded-card bg-surface px-5 py-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary-soft">
          <Wrench className="h-4 w-4 text-accent" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-[15px] font-medium leading-snug text-fg">
            Stěhuješ se nebo potřebuješ něco opravit?
          </p>
          <p className="mt-0.5 text-sm text-muted">
            Vyřeš to přes Remexo —{" "}
            <span className="text-xs font-medium text-accent">připravujeme</span>
          </p>
        </div>
      </div>
    </div>
  );
}
