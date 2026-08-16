import Link from "next/link";
import { ArrowRight, Search, Users, ShieldCheck, Instagram } from "lucide-react";

export const metadata = {
  title: "Bydlino — najdi pokoj i spolubydlícího v Brně",
};

const STEPS = [
  {
    icon: Search,
    title: "Projdi pokoje",
    text: "Inzeráty od studentů a majitelů z Brna. Filtruj podle čtvrti, ceny a velikosti.",
  },
  {
    icon: Users,
    title: "Najdi spolubydlícího",
    text: "Swipuj profily studentů. Když se líbíte navzájem, odemknou se vám kontakty.",
  },
  {
    icon: ShieldCheck,
    title: "Domluvte se napřímo",
    text: "Žádný prostředník ani provize. Kontakt si předáte a zbytek je na vás.",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-md px-6 pb-16 pt-8">
      <header className="flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-accent">Bydlino</span>
        <Link href="/login" className="text-sm font-medium text-muted transition-colors hover:text-fg">
          Přihlásit se
        </Link>
      </header>

      <section className="pt-14">
        <span className="inline-flex items-center gap-2 rounded-tag border border-line bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Brno · Zima 2026
        </span>

        <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.05] text-fg">
          Pokoj hledáš sám.
          <br />
          <span className="text-accent">Spolubydlícího taky?</span>
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Bydlino spojuje obojí na jednom místě. Projdi si volné pokoje v Brně, nebo si najdi
          někoho, s kým si byt vezmete napůl.
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
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
      </section>

      <section className="mt-16 space-y-3">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="rounded-card border border-line bg-surface p-5">
            <div className="flex items-start gap-3.5">
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

      <section className="mt-14 rounded-card border border-line bg-surface p-6 text-center">
        <h2 className="font-display text-lg font-semibold text-fg">Startujeme v Brně</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
          Bydlino je čerstvý projekt. Čím dřív se přidáš, tím dřív uvidíš nabídky ostatních
          studentů — a oni tvoje.
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
        <a
          href="https://instagram.com"
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-fg"
        >
          <Instagram className="h-3.5 w-3.5" strokeWidth={1.75} />
          Sledovat Bydlino
        </a>
        <p className="mt-4 text-[11px] text-muted/60">© 2026 Bydlino · Brno</p>
      </footer>
    </main>
  );
}
