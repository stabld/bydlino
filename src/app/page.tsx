import Link from "next/link";
import { ArrowRight, Flame, Bookmark, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Bydlino — najdi pokoj i spolubydlícího v Brně",
};

const STEPS = [
  {
    icon: Flame,
    title: "Swipuj byty",
    text: "Doprava uložíš, doleva přeskočíš. Rychlejší než scrollovat inzertní weby.",
  },
  {
    icon: Bookmark,
    title: "Uložené na jednom místě",
    text: "Všechny byty, co se ti líbily, najdeš pohromadě i s cenou a termínem.",
  },
  {
    icon: ShieldCheck,
    title: "Domluvte se napřímo",
    text: "Klikneš Mám zájem, odemkne se kontakt na inzerenta. Žádná provize.",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-md px-6 pb-16 pt-8 lg:max-w-5xl lg:px-10 lg:pb-24 lg:pt-10">
      <header className="flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-accent lg:text-2xl">
          Bydlino
        </span>
        <Link href="/login" className="text-sm font-medium text-muted transition-colors hover:text-fg">
          Přihlásit se
        </Link>
      </header>

      <section className="pt-14 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-24">
        <div>
        <span className="inline-flex items-center gap-2 rounded-tag border border-line bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Brno · Zima 2026
        </span>

        <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.05] text-fg lg:text-[3.5rem]">
          Hledání bytu,
          <br />
          <span className="text-accent">konečně bez scrollování.</span>
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-muted lg:text-base">
          Studentské pokoje a byty v Brně. Swipuješ jako na Tinderu — co se ti líbí, uložíš,
          a s inzerentem se domluvíš napřímo.
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-black shadow-glow-sm transition-transform active:scale-[0.98]"
          >
            Založit účet zdarma
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center rounded-2xl border border-line py-3.5 text-sm font-semibold text-fg transition-colors hover:border-accent/50"
          >
            Už mám účet
          </Link>
        </div>
        </div>

        {/* Ukázka karty — na desktopu je vpravo místo, které jinak zeje prázdnotou. */}
        <div className="mt-14 hidden lg:mt-0 lg:block">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-card border border-line bg-surface shadow-card">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute left-4 top-4 rounded-tag bg-accent px-3.5 py-2 font-mono text-base font-bold text-black">
              7 500 Kč/měs
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="font-display text-xl font-bold leading-tight">
                Světlý pokoj v 3+1 u FI MUNI
              </p>
              <p className="mt-1.5 text-sm text-white/70">Královo Pole · 3+1 · od září</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["balkón", "po rekonstrukci", "MHD 3 min"].map((t) => (
                  <span
                    key={t}
                    className="rounded-tag bg-white/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-wide text-muted">
            ← přeskočit &nbsp;·&nbsp; → uložit
          </p>
        </div>
      </section>

      <section className="mt-16 space-y-3 lg:mt-28 lg:grid lg:grid-cols-3 lg:gap-5 lg:space-y-0">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="rounded-card border border-line bg-surface p-5 lg:p-6">
            <div className="flex items-start gap-3.5 lg:flex-col lg:gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                <Icon className="h-4 w-4 text-accent" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
                  <h2 className="font-display text-base font-semibold text-fg">{title}</h2>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14 rounded-card border border-line bg-surface p-6 text-center lg:mt-20 lg:p-12">
        <h2 className="font-display text-lg font-semibold text-fg lg:text-2xl">Startujeme v Brně</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
          Bydlino je čerstvý projekt. Přidáváme nové inzeráty průběžně — a pokud sám
          pronajímáš, můžeš svůj přidat hned.
        </p>
        <Link
          href="/register"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-black shadow-glow-sm"
        >
          Chci se přidat
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="mt-14 border-t border-line pt-6 text-center">
        <p className="text-xs text-muted">
          Stěhuješ se nebo potřebuješ něco opravit? Vyřeš to přes Remexo.
        </p>
        <p className="mt-4 text-[11px] text-muted/60">© 2026 Bydlino · Brno</p>
      </footer>
    </main>
  );
}
