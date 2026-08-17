import Link from "next/link";
import Image from "next/image";
import { MapPin, DoorOpen } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Tag } from "@/components/shared/Tag";
import { SaveButton } from "@/components/listings/SaveButton";

export function ListingCard({ listing, saved = false }: { listing: Listing; saved?: boolean }) {
  const cover = listing.photos[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-card border border-line bg-surface shadow-card transition-all hover:border-accent/40 active:scale-[0.99]"
    >
      <div className="relative aspect-[5/4] w-full bg-surface2">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="(max-width: 480px) 100vw, 320px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <DoorOpen className="h-7 w-7 text-muted" strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute right-3 top-3">
          <SaveButton listingId={listing.id} initiallySaved={saved} />
        </div>
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-accent">{formatPrice(listing.price)}</p>
        <h3 className="mt-0.5 font-display text-[15px] font-semibold leading-snug text-fg">
          {listing.title}
        </h3>

        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">
            {listing.location ? `${listing.location}, ` : ""}
            {listing.city}
          </span>
          <span className="mx-1 opacity-40">·</span>
          <span className="shrink-0">{listing.rooms}+1</span>
        </div>

        {listing.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
