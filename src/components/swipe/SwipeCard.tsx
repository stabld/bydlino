"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate, type PanInfo } from "framer-motion";
import { GraduationCap } from "lucide-react";
import type { Profile, SwipeDirection } from "@/lib/types";
import { initials } from "@/lib/utils";

const SWIPE_THRESHOLD = 110;
const VELOCITY_THRESHOLD = 700;

export type SwipeSignal = { direction: SwipeDirection; token: number };

export function SwipeCard({
  profile,
  active,
  stackIndex,
  onSwipe,
  signal,
}: {
  profile: Profile;
  active: boolean;
  stackIndex: number;
  onSwipe: (direction: SwipeDirection) => void;
  signal: SwipeSignal | null;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-16, 0, 16]);
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
      ? { scale: 0.96, y: 14, rotate: -3 }
      : stackIndex === 2
        ? { scale: 0.92, y: 26, rotate: 3 }
        : { scale: 1, y: 0, rotate: 0 };

  return (
    <motion.div
      className="badge-hole absolute inset-0 overflow-hidden rounded-card border border-line bg-white shadow-[0_8px_30px_-8px_rgba(17,17,19,0.25)]"
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
        {profile.photo_url ? (
          <Image
            src={profile.photo_url}
            alt={profile.name}
            fill
            sizes="480px"
            className="pointer-events-none select-none object-cover"
            priority={stackIndex === 0}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink/5">
            <span className="font-display text-5xl font-bold text-ink/15">{initials(profile.name)}</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />

        {active && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="pointer-events-none absolute right-5 top-8 rotate-[-12deg] rounded-lg border-[3px] border-gold px-3 py-1 font-mono text-sm font-bold uppercase tracking-wide text-gold"
            >
              Líbí se mi
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="pointer-events-none absolute left-5 top-8 rotate-[12deg] rounded-lg border-[3px] border-paper px-3 py-1 font-mono text-sm font-bold uppercase tracking-wide text-paper"
            >
              Další
            </motion.div>
          </>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-paper">
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-2xl font-bold leading-none">{profile.name}</h3>
            {profile.age && <span className="text-lg font-medium text-paper/80">{profile.age}</span>}
          </div>

          {(profile.university || profile.faculty) && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-tag bg-paper/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide backdrop-blur-sm">
              <GraduationCap className="h-3 w-3" strokeWidth={2} />
              {[profile.faculty, profile.university].filter(Boolean).join(" · ")}
            </div>
          )}

          {profile.bio && <p className="mt-2.5 line-clamp-2 text-sm text-paper/90">{profile.bio}</p>}

          {profile.lifestyle_tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {profile.lifestyle_tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-tag bg-paper/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {(profile.preferred_location || profile.max_budget) && (
            <p className="mt-2 text-xs text-paper/70">
              {profile.preferred_location}
              {profile.preferred_location && profile.max_budget ? " · " : ""}
              {profile.max_budget ? `do ${profile.max_budget.toLocaleString("cs-CZ")} Kč` : ""}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
