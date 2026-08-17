"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DoorOpen, RotateCcw, Loader2, Undo2, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/shared/Toast";
import type { Listing, SwipeDirection } from "@/lib/types";
import { ListingSwipeCard, type SwipeSignal } from "./ListingSwipeCard";
import { ActionButtons } from "./ActionButtons";
import { EmptyState } from "@/components/shared/EmptyState";

export function SwipeDeck({ currentUserId }: { currentUserId: string }) {
  const toast = useToast();

  const [deck, setDeck] = useState<Listing[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [signal, setSignal] = useState<SwipeSignal | null>(null);
  const [lastSwiped, setLastSwiped] = useState<Listing | null>(null);
  const [likedCount, setLikedCount] = useState(0);

  const loadDeck = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Vlastní inzeráty a už odswipované do balíčku nepatří.
    const { data: swipedRows } = await supabase
      .from("listing_swipes")
      .select("listing_id")
      .eq("user_id", currentUserId);

    const swipedIds = (swipedRows ?? []).map((r) => r.listing_id);

    let query = supabase.from("listings").select("*").neq("owner_id", currentUserId);
    if (swipedIds.length) {
      query = query.not("id", "in", `(${swipedIds.join(",")})`);
    }

    const { data: listings } = await query.limit(50).returns<Listing[]>();

    setDeck([...(listings ?? [])].sort(() => Math.random() - 0.5));
    setLastSwiped(null);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  async function commitSwipe(direction: SwipeDirection) {
    const target = deck?.[0];
    if (!target) return;
    setBusy(true);
    // Signál musí zmizet dřív, než se další karta stane aktivní,
    // jinak by hned dostala starou instrukci k odletu.
    setSignal(null);
    setDeck((prev) => (prev ? prev.slice(1) : prev));
    setLastSwiped(target);

    const supabase = createClient();
    const { error } = await supabase
      .from("listing_swipes")
      .upsert(
        { user_id: currentUserId, listing_id: target.id, direction },
        { onConflict: "user_id,listing_id" }
      );

    if (error) {
      toast("Nepodařilo se uložit, zkus to znovu.", "error");
    } else if (direction === "like") {
      setLikedCount((c) => c + 1);
      toast("Uloženo mezi oblíbené");
    }

    setBusy(false);
  }

  /** Vrátí poslední rozhodnutí zpět a vrátí inzerát na začátek balíčku. */
  async function undoLast() {
    if (!lastSwiped || busy) return;
    setBusy(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("listing_swipes")
      .delete()
      .eq("user_id", currentUserId)
      .eq("listing_id", lastSwiped.id);

    if (error) {
      toast("Vrácení se nepovedlo.", "error");
    } else {
      setDeck((prev) => (prev ? [lastSwiped, ...prev] : [lastSwiped]));
      setLastSwiped(null);
      toast("Vráceno zpět");
    }
    setBusy(false);
  }

  function triggerSwipe(direction: SwipeDirection) {
    if (busy || !deck || deck.length === 0) return;
    setBusy(true);
    setSignal({ direction, token: Date.now() });
  }

  const visible = deck?.slice(0, 3) ?? [];
  const current = visible[0];

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-[3/4.3] w-full max-w-sm">
        {loading ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-card border border-line bg-surface">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <p className="text-sm text-muted">Načítám nabídky…</p>
          </div>
        ) : visible.length > 0 ? (
          [...visible].reverse().map((listing, i) => {
            const stackIndex = visible.length - 1 - i;
            return (
              <ListingSwipeCard
                key={listing.id}
                listing={listing}
                active={stackIndex === 0}
                stackIndex={stackIndex}
                signal={stackIndex === 0 ? signal : null}
                onSwipe={commitSwipe}
              />
            );
          })
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <EmptyState
              icon={DoorOpen}
              title={likedCount > 0 ? "Prošel/prošla jsi vše" : "Zatím žádné nabídky"}
              description={
                likedCount > 0
                  ? `Uložil/a jsi ${likedCount} ${likedCount === 1 ? "byt" : likedCount <= 4 ? "byty" : "bytů"}. Mrkni na ně v Uložených.`
                  : "Jakmile přibudou nové inzeráty, objeví se tady."
              }
              action={
                <div className="flex flex-col items-center gap-2">
                  <Link
                    href="/saved"
                    className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-black shadow-glow-sm"
                  >
                    Uložené byty
                  </Link>
                  <button
                    type="button"
                    onClick={loadDeck}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-line px-5 py-2.5 text-sm font-semibold text-fg"
                  >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                    Načíst znovu
                  </button>
                </div>
              }
            />
          </div>
        )}
      </div>

      {visible.length > 0 && (
        <div className="mt-6 w-full">
          <ActionButtons
            onPass={() => triggerSwipe("pass")}
            onLike={() => triggerSwipe("like")}
            disabled={busy}
          />

          <div className="mt-4 flex items-center justify-center gap-2">
            {lastSwiped && (
              <button
                type="button"
                onClick={undoLast}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-tag border border-line px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-fg disabled:opacity-50"
              >
                <Undo2 className="h-3.5 w-3.5" strokeWidth={2} />
                Zpět
              </button>
            )}
            {current && (
              <Link
                href={`/listings/${current.id}`}
                className="inline-flex items-center gap-1.5 rounded-tag border border-line px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-fg"
              >
                Detail inzerátu
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
