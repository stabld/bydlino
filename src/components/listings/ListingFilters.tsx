"use client";

import { useState } from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ListingFilterValues = {
  q?: string;
  city?: string;
  maxPrice?: string;
  rooms?: string;
  sort?: string;
};

const SORTS = [
  { value: "new", label: "Nejnovější" },
  { value: "price_asc", label: "Nejlevnější" },
  { value: "price_desc", label: "Nejdražší" },
];

export function ListingFilters({ values }: { values: ListingFilterValues }) {
  const hasAdvanced = Boolean(values.city || values.maxPrice || values.rooms || values.sort);
  const [open, setOpen] = useState(hasAdvanced);

  const activeCount = [values.city, values.maxPrice, values.rooms].filter(Boolean).length;

  return (
    <form action="/listings" method="get" className="space-y-2">
      <div className="relative">
        <Search
         className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          strokeWidth={1.75}
        />
        <input
          name="q"
          type="search"
          defaultValue={values.q}
          placeholder="Hledat pokoj, čtvrť, tag..."
         className="w-full rounded-2xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-fg outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
         className={cn(
 "inline-flex items-center gap-1.5 rounded-tag border px-3 py-1.5 text-xs font-medium transition-colors",
            open || activeCount > 0
              ? "border-accent/50 bg-accent-soft text-accent"
              : "border-line text-muted"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
          Filtry
          {activeCount > 0 && (
            <span className="ml-0.5 rounded-full bg-accent px-1.5 text-[10px] font-bold text-black">
              {activeCount}
            </span>
          )}
        </button>

        {(activeCount > 0 || values.q) && (
          <a
            href="/listings"
           className="inline-flex items-center gap-1 rounded-tag border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-fg"
          >
            <X className="h-3 w-3" strokeWidth={2} />
            Zrušit
          </a>
        )}
      </div>

      {open && (
        <div className="space-y-2 rounded-card border border-line bg-surface p-3.5">
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
            <input
              name="city"
              type="text"
              defaultValue={values.city}
              placeholder="Čtvrť"
             className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent"
            />
            <input
              name="maxPrice"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={values.maxPrice}
              placeholder="Max. Kč"
             className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent"
            />
            <select
              name="rooms"
              defaultValue={values.rooms || ""}
             className="w-full rounded-xl border border-line bg-bg px-2.5 py-2.5 text-sm text-fg outline-none focus:border-accent"
            >
              <option value="">Pokoje</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {SORTS.map((s) => (
              <label key={s.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  value={s.value}
                  defaultChecked={(values.sort || "new") === s.value}
                 className="peer sr-only"
                />
                <span className="inline-block rounded-tag border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors peer-checked:border-accent/50 peer-checked:bg-accent-soft peer-checked:text-accent">
                  {s.label}
                </span>
              </label>
            ))}
          </div>

          <button
            type="submit"
           className="mt-1 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-black transition-transform active:scale-[0.98] lg:w-auto lg:px-8"
          >
            Použít filtry
          </button>
        </div>
      )}
    </form>
  );
}
