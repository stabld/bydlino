"use client";

import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActionButtons({
  onPass,
  onLike,
  disabled,
}: {
  onPass: () => void;
  onLike: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-5">
      <button
        type="button"
        onClick={onPass}
        disabled={disabled}
        aria-label="Přeskočit"
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border border-line bg-white text-ink/70 shadow-sm transition-transform active:scale-90",
          disabled && "opacity-50"
        )}
      >
        <X className="h-6 w-6" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={onLike}
        disabled={disabled}
        aria-label="Líbí se mi"
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full bg-accent text-paper shadow-lg shadow-accent/30 transition-transform active:scale-90",
          disabled && "opacity-50"
        )}
      >
        <Heart className="h-7 w-7" strokeWidth={2.25} fill="currentColor" />
      </button>
    </div>
  );
}
