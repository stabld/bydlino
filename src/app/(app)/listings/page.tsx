import Link from "next/link";
import { Plus, DoorOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingFilters } from "@/components/listings/ListingFilters";
import { RemexoBanner } from "@/components/shared/RemexoBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  city?: string;
  maxPrice?: string;
  rooms?: string;
  sort?: string;
};

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("listings").select("*");

  if (searchParams.q) {
    const term = `%${searchParams.q}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term},location.ilike.${term}`);
  }
  if (searchParams.city) {
    query = query.or(
      `city.ilike.%${searchParams.city}%,location.ilike.%${searchParams.city}%`
    );
  }
  if (searchParams.maxPrice) {
    const maxPrice = Number(searchParams.maxPrice);
    if (!Number.isNaN(maxPrice)) query = query.lte("price", maxPrice);
  }
  if (searchParams.rooms) {
    const rooms = Number(searchParams.rooms);
    if (!Number.isNaN(rooms)) query = query.gte("rooms", rooms);
  }

  if (searchParams.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (searchParams.sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: listings } = await query.returns<Listing[]>();

  // Které z nich mám uložené, ať se záložka rovnou vykreslí správně.
  const { data: savedRows } = user
    ? await supabase
        .from("listing_swipes")
        .select("listing_id")
        .eq("user_id", user.id)
        .eq("direction", "like")
    : { data: null };
  const savedIds = new Set((savedRows ?? []).map((r) => r.listing_id));

  const count = listings?.length ?? 0;
  const isFiltered = Boolean(
    searchParams.q || searchParams.city || searchParams.maxPrice || searchParams.rooms
  );

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-fg">Hledat pokoj</h1>
          <p className="mt-0.5 text-sm text-muted">
            {count} {count === 1 ? "nabídka" : count >= 2 && count <= 4 ? "nabídky" : "nabídek"}
            {isFiltered ? " odpovídá filtrům" : " v Brně"}
          </p>
        </div>
        <Link
          href="/listings/new"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-black shadow-glow-sm transition-transform active:scale-95"
          aria-label="Přidat inzerát"
        >
          <Plus className="h-5 w-5" strokeWidth={2.25} />
        </Link>
      </div>

      <ListingFilters values={searchParams} />

      {listings && listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {listings.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} saved={savedIds.has(listing.id)} />
            ))}
          </div>

          <RemexoBanner />

          {listings.length > 4 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {listings.slice(4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} saved={savedIds.has(listing.id)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <EmptyState
            icon={DoorOpen}
            title={isFiltered ? "Nic neodpovídá filtrům" : "Zatím žádné nabídky"}
            description={
              isFiltered
                ? "Zkus hledat volněji, nebo filtry zruš."
                : "Buď první — přidej inzerát a ostatní studenti ho uvidí."
            }
            action={
              isFiltered ? (
                <Link
                  href="/listings"
                  className="rounded-2xl border border-line px-5 py-2.5 text-sm font-semibold text-fg"
                >
                  Zrušit filtry
                </Link>
              ) : (
                <Link
                  href="/listings/new"
                  className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-black shadow-glow-sm"
                >
                  Přidat inzerát
                </Link>
              )
            }
          />
          <RemexoBanner />
        </>
      )}
    </div>
  );
}
