"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { DoorOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[5/4] w-full items-center justify-center rounded-card border border-line bg-surface">
        <DoorOpen className="h-8 w-8 text-muted" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-surface">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto"
      >
        {photos.map((photo) => (
          <div key={photo} className="relative aspect-[5/4] w-full shrink-0 snap-center bg-surface2">
            <Image src={photo} alt={title} fill sizes="480px" className="object-cover" />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {photos.map((photo, i) => (
            <span
              key={photo}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-5 bg-accent" : "w-1.5 bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
