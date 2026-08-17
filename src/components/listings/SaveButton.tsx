"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/shared/Toast";
import { cn } from "@/lib/utils";

export function SaveButton({
  listingId,
  initiallySaved,
  variant = "icon",
}: {
  listingId: string;
  initiallySaved: boolean;
  variant?: "icon" | "full";
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function toggle(e: React.MouseEvent) {
    // Karta inzerátu je odkaz — klik na záložku nesmí otevřít detail.
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    setBusy(true);
    const next = !saved;
    setSaved(next);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaved(!next);
      setBusy(false);
      return;
    }

    const { error } = next
      ? await supabase
          .from("listing_swipes")
          .upsert(
            { user_id: user.id, listing_id: listingId, direction: "like" as const },
            { onConflict: "user_id,listing_id" }
          )
      : await supabase
          .from("listing_swipes")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId);

    if (error) {
      setSaved(!next);
      toast("Uložení se nepovedlo.", "error");
    } else {
      toast(next ? "Uloženo mezi oblíbené" : "Odebráno z oblíbených");
    }
    setBusy(false);
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
          saved ? "border-accent/60 bg-accent-soft text-accent" : "border-line text-fg"
        )}
      >
        <Bookmark className="h-4 w-4" strokeWidth={2} fill={saved ? "currentColor" : "none"} />
        {saved ? "Uloženo" : "Uložit"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Odebrat z oblíbených" : "Uložit mezi oblíbené"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors",
        saved ? "bg-accent text-black" : "bg-black/50 text-white hover:bg-black/70"
      )}
    >
      <Bookmark className="h-4 w-4" strokeWidth={2} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
