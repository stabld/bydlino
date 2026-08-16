"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/listings", label: "Hledat pokoj", icon: Home },
  { href: "/roommates", label: "Spolubydlící", icon: Users },
  { href: "/profile", label: "Profil", icon: CircleUserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Hlavní navigace"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5"
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={cn("h-5 w-5 transition-colors", active ? "text-ink" : "text-muted")}
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span className={cn("text-[11px] font-medium", active ? "text-ink" : "text-muted")}>
                {label}
              </span>
              <span
                className={cn(
                  "h-1 w-1 rounded-full transition-opacity",
                  active ? "bg-accent opacity-100" : "opacity-0"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
