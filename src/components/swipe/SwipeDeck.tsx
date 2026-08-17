"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  DoorOpen,
  RotateCcw,
  Loader2,
  Undo2,
  ArrowUpRight,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/shared/Toast";
import type { Listing, SwipeDirection } from "@/lib/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Tag } from "@/components/shared/Tag";
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

  // Na desktopu se swipuje šipkami; Z vrací poslední rozhodnutí.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "ArrowRight") triggerSwipe("like");
      else if (e.key === "ArrowLeft") triggerSwipe("pass");
      else if (e.key.toLowerCase() === "z") undoLast();
 }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
 });

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
    <div className="lg:grid lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:items-start lg:gap-12">
      <div className="flex flex-col items-center">
        <div className="relative aspect-[3/4.3] w-full max-w-sm lg:aspect-[4/5] lg:max-w-none">
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
              title={likedCount > 0 ? "To je zatím všechno" : "Zatím žádné nabídky"}
              description={
                likedCount > 0
                  ? `Uložil/a jsi ${likedCount} ${likedCount === 1 ? "byt" : likedCount <= 4 ? "byty" : "bytů"}. Najdeš je v Uložených.`
                  : "Zatím tu nic není. Zkus to za pár dní, nebo přidej vlastní inzerát."
 }
              action={
                <div className="flex flex-col items-center gap-2">
                  <Link
                    href="/saved"
                   className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-black shadow-sm"
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
               className="inline-flex items-center gap-1.5 rounded-tag border border-line px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-fg lg:hidden"
              >
                Detail inzerátu
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            )}
          </div>

          <p className="mt-4 hidden text-center text-xs text-muted lg:block">
            Klávesy: <kbd className="rounded border border-line px-1.5 py-0.5">←</kbd> přeskočit{" "}
            <kbd className="rounded border border-line px-1.5 py-0.5">→</kbd> uložit{" "}
            <kbd className="rounded border border-line px-1.5 py-0.5">Z</kbd> zpět
          </p>
        </div>
        )}
      </div>

      {/* Detailní panel — na širokém displeji je vedle karty místo, tak ho využijeme. */}
      {current && (
        <div className="mt-8 hidden lg:mt-0 lg:block">
          <div className="rounded-card border border-line bg-surface p-7">
            <p className="text-2xl font-bold text-accent">{formatPrice(current.price)}</p>
            <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-fg">
              {current.title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
                {current.location ? `${current.location}, ` : ""}
                {current.city}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <DoorOpen className="h-4 w-4" strokeWidth={1.75} />
                {current.rooms}+1
              </span>
              {current.available_from && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
                  volné od {formatDate(current.available_from)}
                </span>
              )}
            </div>

            {current.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {current.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}

            {current.description && (
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-fg/80">
                {current.description}
              </p>
            )}

            <Link
              href={`/listings/${current.id}`}
             className="mt-6 inline-flex items-center gap-1.5 rounded-2xl border border-line px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-accent/50"
            >
              Otevřít inzerát
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
