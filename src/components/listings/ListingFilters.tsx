import { SlidersHorizontal } from "lucide-react";

export function ListingFilters({
  defaultCity,
  defaultMaxPrice,
  defaultRooms,
}: {
  defaultCity?: string;
  defaultMaxPrice?: string;
  defaultRooms?: string;
}) {
  return (
    <form action="/listings" method="get" className="rounded-card border border-line bg-surface p-3.5">
      <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium text-muted">
        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
        Filtry
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label htmlFor="city" className="sr-only">
            Lokalita
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={defaultCity}
            placeholder="Lokalita"
            className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="maxPrice" className="sr-only">
            Max. cena
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={defaultMaxPrice}
            placeholder="Max. Kč"
            className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none focus:border-accent"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="rooms" className="sr-only">
            Pokoje
          </label>
          <select
            id="rooms"
            name="rooms"
            defaultValue={defaultRooms || ""}
            className="w-full rounded-xl border border-line bg-bg px-2.5 py-2.5 text-sm text-fg outline-none focus:border-accent"
          >
            <option value="">Pokoje</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="mt-2.5 w-full rounded-xl bg-gradient-primary py-2.5 text-sm font-semibold text-black shadow-glow-sm transition-transform active:scale-[0.98]"
      >
        Použít filtry
      </button>
    </form>
  );
}
