"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate, type PanInfo } from "framer-motion";
import { MapPin, DoorOpen, CalendarDays } from "lucide-react";
import type { Listing, SwipeDirection } from "@/lib/types";
import { formatPrice, formatDate } from "@/lib/utils";

const SWIPE_THRESHOLD = 110;
const VELOCITY_THRESHOLD = 700;

export type SwipeSignal = { direction: SwipeDirection; token: number };

export function ListingSwipeCard({
  listing,
  active,
  stackIndex,
  onSwipe,
  signal,
}: {
  listing: Listing;
  active: boolean;
  stackIndex: number;
  onSwipe: (direction: SwipeDirection) => void;
  signal: SwipeSignal | null;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -20], [1, 0]);

  function fly(direction: SwipeDirection) {
    animate(x, direction === "like" ? 640 : -640, {
      duration: 0.32,
      ease: "easeIn",
      onComplete: () => onSwipe(direction),
    });
  }

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) {
      fly("like");
    } else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) {
      fly("pass");
    } else {
      animate(x, 0, { type: "spring", stiffness: 420, damping: 32 });
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (active && signal) fly(signal.direction);
  }, [signal]);

  const stackStyle =
    stackIndex === 1
      ? { scale: 0.96, y: 14, rotate: -2 }
      : stackIndex === 2
        ? { scale: 0.92, y: 26, rotate: 2 }
        : { scale: 1, y: 0, rotate: 0 };

  const cover = listing.photos[0];
  const availableFrom = formatDate(listing.available_from);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden rounded-card bg-surface shadow-card"
      style={active ? { x, rotate } : undefined}
      initial={false}
      animate={active ? { scale: 1, y: 0 } : stackStyle}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      drag={active ? "x" : false}
      dragElastic={0.7}
      onDragEnd={active ? handleDragEnd : undefined}
      whileTap={active ? { cursor: "grabbing" } : undefined}
    >
      <div className="relative h-full w-full">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="480px"
            className="pointer-events-none select-none object-cover"
            priority={stackIndex === 0}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface2">
            <DoorOpen className="h-10 w-10 text-muted" strokeWidth={1.25} />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-black/10 lg:from-black/45 lg:via-transparent lg:to-transparent" />

        {/* Cena je to první, co u bytu člověk řeší — proto nahoře a velká. */}
        <div className="pointer-events-none absolute left-4 top-4">
          <span className="rounded-tag bg-accent px-3.5 py-2 text-base font-bold text-black lg:bg-black/70 lg:text-white lg:backdrop-blur-sm">
            {formatPrice(listing.price)}
          </span>
        </div>

        {active && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="pointer-events-none absolute right-5 top-16 rotate-[-12deg] rounded-lg border-[3px] border-accent px-3 py-1 text-sm font-bold uppercase text-accent"
            >
              Uložit
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="pointer-events-none absolute left-5 top-16 rotate-[12deg] rounded-lg border-[3px] border-white/70 px-3 py-1 text-sm font-bold uppercase text-white/90"
            >
              Přeskočit
            </motion.div>
          </>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white lg:hidden">
          <h3 className="font-display text-xl font-bold leading-tight">{listing.title}</h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
              {listing.location ? `${listing.location}, ` : ""}
              {listing.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <DoorOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
              {listing.rooms}+1
            </span>
            {availableFrom && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
                od {availableFrom}
              </span>
            )}
          </div>

          {listing.description && (
            <p className="mt-2.5 line-clamp-2 text-sm text-white/85">{listing.description}</p>
          )}

          {listing.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {listing.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-tag bg-white/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
