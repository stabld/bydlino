import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, DoorOpen, CalendarDays, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate, initials } from "@/lib/utils";
import { Tag } from "@/components/shared/Tag";
import { BackLink } from "@/components/shared/BackLink";
import { DeleteListingButton } from "@/components/listings/DeleteListingButton";
import type { Listing, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Listing>();

  if (!listing) notFound();

  const { data: owner } = await supabase
    .from("profiles")
    .select("id, name, photo_url")
    .eq("id", listing.owner_id)
    .maybeSingle<Pick<Profile, "id" | "name" | "photo_url">>();

  const isOwner = user?.id === listing.owner_id;
  const availableFrom = formatDate(listing.available_from);

  return (
    <div className="space-y-5">
      <BackLink href="/listings" label="Zpět na nabídky" />

      <div className="overflow-hidden rounded-card border border-line bg-surface">
        {listing.photos.length > 0 ? (
          <div className="flex snap-x snap-mandatory overflow-x-auto">
            {listing.photos.map((photo) => (
              <div key={photo} className="relative aspect-[4/3] w-full shrink-0 snap-center bg-fg/5">
                <Image src={photo} alt={listing.title} fill sizes="480px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-fg/5">
            <DoorOpen className="h-8 w-8 text-muted" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-xl font-bold leading-snug text-fg">{listing.title}</h1>
          <span className="price-tag shrink-0 rounded-tag bg-accent py-1.5 pl-5 pr-3 font-mono text-sm font-bold text-black shadow-glow-sm">
            {formatPrice(listing.price)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" strokeWidth={1.75} />
            {listing.location ? `${listing.location}, ` : ""}
            {listing.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <DoorOpen className="h-4 w-4" strokeWidth={1.75} />
            {listing.rooms}+1
          </span>
          {availableFrom && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
              volné od {availableFrom}
            </span>
          )}
        </div>

        {listing.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        {listing.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-fg/80">
            {listing.description}
          </p>
        )}

        {owner && (
          <div className="mt-5 flex items-center gap-3 rounded-card border border-line bg-surface p-3.5">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface2 text-xs font-semibold text-fg">
              {owner.photo_url ? (
                <Image src={owner.photo_url} alt={owner.name} fill className="object-cover" />
              ) : (
                initials(owner.name || "?")
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted">Inzerát vystavil/a</p>
              <p className="truncate text-sm font-semibold text-fg">{owner.name || "Student"}</p>
            </div>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="flex gap-2 border-t border-line pt-4">
          <Link
            href={`/listings/${listing.id}/edit`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-line py-3 text-sm font-semibold text-fg"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
            Upravit
          </Link>
          <DeleteListingButton listingId={listing.id} />
        </div>
      )}
    </div>
  );
}
