import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export const metadata = {
  title: "Bydlino — pokoje a byty pro studenty v Brně",
};

const STEPS = [
  {
    title: "Swipuj byty",
    text: "Projedeš deset bytů rychleji, než na Bazoši otevřeš jeden inzerát.",
 },
  {
    title: "Uložené na jednom místě",
    text: "Nemusíš si nic psát do poznámek. Co jsi uložil, máš pohromadě.",
 },
  {
    title: "Domluvte se napřímo",
    text: "Napíšeš majiteli, dostaneš kontakt. Žádná realitka, žádná provize.",
 },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-md px-6 pb-16 pt-8 lg:max-w-5xl lg:px-10 lg:pb-24 lg:pt-10">
      <header className="flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-accent lg:text-2xl">
          Bydlino
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-fg"
          >
            Přihlásit se
          </Link>
        </div>
      </header>

      <section className="pt-14 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-24">
        <div>
        <span className="inline-flex items-center gap-2 rounded-tag border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Zatím jen Brno
        </span>

        <h1 className="mt-5 font-display text-[2.6rem] font-bold leading-[1.05] text-fg lg:text-[3.5rem]">
          Hledání bytu,
          <br />
          <span className="text-accent">konečně bez scrollování.</span>
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-muted lg:text-base">
          Pokoje a byty pro studenty v Brně. Projedeš nabídku za pět minut, co tě zaujme si
          uložíš a majiteli napíšeš napřímo.
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/register"
           className="flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-black shadow-sm transition-transform active:scale-[0.98]"
          >
            Založit účet
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
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-card bg-surface2 shadow-card">
            <Image
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80"
              alt="Ukázka inzerátu v aplikaci"
              fill
              sizes="340px"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
            <div className="absolute left-4 top-4 rounded-tag bg-black/70 px-3.5 py-2 text-base font-bold text-white backdrop-blur-sm">
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
          <p className="mt-4 text-center text-xs text-muted">Doleva přeskočíš, doprava uložíš.</p>
        </div>
      </section>

      <section className="mt-16 border-t border-line pt-10 lg:mt-28 lg:pt-14">
        <div className="space-y-8 lg:grid lg:grid-cols-3 lg:gap-12 lg:space-y-0">
          {STEPS.map(({ title, text }, i) => (
            <div key={title}>
              <span className="font-display text-3xl font-bold text-accent">{i + 1}</span>
              <h2 className="mt-2 font-display text-lg font-semibold text-fg">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-card border border-line bg-surface p-6 text-center lg:mt-24 lg:p-12">
        <h2 className="font-display text-lg font-semibold text-fg lg:text-2xl">Zatím jsme malí</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
          Začínáme, takže inzerátů zatím není sto. Když pronajímáš pokoj, přidej ho —
          zabere to dvě minuty.
        </p>
        <Link
          href="/register"
         className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-black shadow-sm"
        >
          Založit účet
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="mt-14 border-t border-line pt-6 text-center">
        <p className="text-xs text-muted">
          Na drobné opravy a stěhování chystáme propojení s Remexem.
        </p>
        <p className="mt-4 text-[11px] text-muted/60">© 2026 Bydlino · Brno</p>
      </footer>
    </main>
  );
}
