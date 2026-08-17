"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Bookmark, CircleUserRound, LogOut, LogIn, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const PUBLIC_ITEMS = [
  { href: "/swipe", label: "Procházet", icon: Flame },
  { href: "/listings", label: "Nabídky", icon: Home },
];

const PRIVATE_ITEMS = [
  { href: "/saved", label: "Uložené", icon: Bookmark },
  { href: "/profile", label: "Profil", icon: CircleUserRound },
];

/** Boční navigace pro desktop. Na mobilu se místo ní zobrazuje BottomNav. */
export function Sidebar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface/40 px-4 py-6 lg:flex">
      <div className="flex items-center justify-between px-3">
        <Link href="/swipe">
          <span className="font-display text-2xl font-bold tracking-tight text-accent">Bydlino</span>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {[...PUBLIC_ITEMS, ...(isLoggedIn ? PRIVATE_ITEMS : [])].map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
 "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-fg/5 hover:text-fg"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 1.9} />
              {label}
            </Link>
          );
 })}
      </nav>

      <Link
        href="/listings/new"
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-semibold text-black transition-transform active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" strokeWidth={2.25} />
        Přidat inzerát
      </Link>

      <div className="mt-auto space-y-3 pt-6">
        <div className="rounded-card border border-line bg-surface p-3.5">
          <p className="text-xs font-medium text-fg">Stěhuješ se?</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Řemeslníka na drobné opravy vyřešíš přes Remexo.
          </p>
          <span className="mt-2 inline-block text-xs font-medium text-accent">připravujeme</span>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-fg/5 hover:text-fg"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.9} />
            Odhlásit se
          </button>
        </form>
      </div>
    </aside>
  );
}
