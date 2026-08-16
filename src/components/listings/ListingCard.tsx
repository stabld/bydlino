import Link from "next/link";
import Image from "next/image";
import { MapPin, DoorOpen } from "lucide-react";
import type { Listing } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Tag } from "@/components/shared/Tag";

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.photos[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-card border border-line bg-white transition-transform active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] w-full bg-ink/5">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="(max-width: 480px) 100vw, 320px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <DoorOpen className="h-7 w-7 text-muted" strokeWidth={1.5} />
          </div>
        )}

        <div className="price-tag absolute left-3 top-3 rounded-tag bg-ink py-1.5 pl-5 pr-3 font-mono text-xs font-bold text-paper">
          {formatPrice(listing.price)}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-[15px] font-semibold leading-snug text-ink">
          {listing.title}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">
            {listing.location ? `${listing.location}, ` : ""}
            {listing.city}
          </span>
          <span className="mx-1 text-line">·</span>
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
