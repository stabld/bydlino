import Link from "next/link";
import { Plus, DoorOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingFilters } from "@/components/listings/ListingFilters";
import { RemexoBanner } from "@/components/shared/RemexoBanner";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { city?: string; maxPrice?: string; rooms?: string };
}) {
  const supabase = createClient();

  let query = supabase.from("listings").select("*").order("created_at", { ascending: false });

  if (searchParams.city) {
    query = query.ilike("city", `%${searchParams.city}%`);
  }
  if (searchParams.maxPrice) {
    const maxPrice = Number(searchParams.maxPrice);
    if (!Number.isNaN(maxPrice)) query = query.lte("price", maxPrice);
  }
  if (searchParams.rooms) {
    const rooms = Number(searchParams.rooms);
    if (!Number.isNaN(rooms)) query = query.gte("rooms", rooms);
  }

  const { data: listings } = await query.returns<Listing[]>();

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-fg">Hledat pokoj</h1>
          <p className="mt-0.5 text-sm text-muted">
            {listings?.length ?? 0} {listings?.length === 1 ? "nabídka" : "nabídek"} v Brně
          </p>
        </div>
        <Link
          href="/listings/new"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-black shadow-glow-sm transition-transform active:scale-95"
          aria-label="Přidat inzerát"
        >
          <Plus className="h-5 w-5" strokeWidth={2.25} />
        </Link>
      </div>

      <ListingFilters
        defaultCity={searchParams.city}
        defaultMaxPrice={searchParams.maxPrice}
        defaultRooms={searchParams.rooms}
      />

      <RemexoBanner />

      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={DoorOpen}
          title="Zatím žádné nabídky"
          description="Zkus upravit filtry, nebo přidej první inzerát sám."
          action={
            <Link
              href="/listings/new"
              className="rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-black shadow-glow-sm"
            >
              Přidat inzerát
            </Link>
          }
        />
      )}
    </div>
  );
}
