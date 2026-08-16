"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, RotateCcw, Loader2, Undo2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/shared/Toast";
import type { Profile, ProfileContacts, SwipeDirection } from "@/lib/types";
import { SwipeCard, type SwipeSignal } from "./SwipeCard";
import { ActionButtons } from "./ActionButtons";
import { MatchModal } from "./MatchModal";
import { EmptyState } from "@/components/shared/EmptyState";

export function SwipeDeck({ currentUserId }: { currentUserId: string }) {
  const toast = useToast();

  const [candidates, setCandidates] = useState<Profile[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [signal, setSignal] = useState<SwipeSignal | null>(null);
  const [lastSwiped, setLastSwiped] = useState<Profile | null>(null);
  const [matchData, setMatchData] = useState<{
    profile: Profile;
    contacts: ProfileContacts | null;
  } | null>(null);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: swipedRows } = await supabase
      .from("swipes")
      .select("to_user")
      .eq("from_user", currentUserId);

    const excludeIds = [currentUserId, ...(swipedRows ?? []).map((r) => r.to_user)];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .not("id", "in", `(${excludeIds.join(",")})`)
      .neq("name", "")
      .limit(40);

    const shuffled = [...(profiles ?? [])].sort(() => Math.random() - 0.5);
    setCandidates(shuffled);
    setLastSwiped(null);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  async function commitSwipe(direction: SwipeDirection) {
    const target = candidates?.[0];
    if (!target) return;
    setBusy(true);
    // Signál musí zmizet dřív, než se další karta stane aktivní,
    // jinak by hned dostala starou instrukci k odletu.
    setSignal(null);
    setCandidates((prev) => (prev ? prev.slice(1) : prev));
    setLastSwiped(target);

    const supabase = createClient();
    const { error } = await supabase.from("swipes").insert({
      from_user: currentUserId,
      to_user: target.id,
      direction,
    });

    if (error) {
      toast("Swipe se neuložil, zkus to znovu.", "error");
      setBusy(false);
      return;
    }

    if (direction === "like") {
      const { data: match } = await supabase
        .from("matches")
        .select("*")
        .or(
          `and(user_a.eq.${currentUserId},user_b.eq.${target.id}),and(user_a.eq.${target.id},user_b.eq.${currentUserId})`
        )
        .maybeSingle();

      if (match) {
        const { data: contacts } = await supabase
          .from("profile_contacts")
          .select("*")
          .eq("user_id", target.id)
          .maybeSingle<ProfileContacts>();
        setMatchData({ profile: target, contacts: contacts ?? null });
        setLastSwiped(null);
      }
    }

    setBusy(false);
  }

  /** Vrátí poslední swipe zpět — smaže záznam a vrátí profil na začátek balíčku. */
  async function undoLast() {
    if (!lastSwiped || busy) return;
    setBusy(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("swipes")
      .delete()
      .eq("from_user", currentUserId)
      .eq("to_user", lastSwiped.id);

    if (error) {
      toast("Vrácení se nepovedlo.", "error");
    } else {
      setCandidates((prev) => (prev ? [lastSwiped, ...prev] : [lastSwiped]));
      setLastSwiped(null);
      toast("Vráceno zpět");
    }
    setBusy(false);
  }

  function triggerSwipe(direction: SwipeDirection) {
    if (busy || !candidates || candidates.length === 0) return;
    setBusy(true);
    setSignal({ direction, token: Date.now() });
  }

  const visible = candidates?.slice(0, 3) ?? [];

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-[3/4.3] w-full max-w-sm">
        {loading ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-card border border-line bg-surface">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <p className="text-sm text-muted">Načítám studenty…</p>
          </div>
        ) : visible.length > 0 ? (
          [...visible].reverse().map((profile, i) => {
            const stackIndex = visible.length - 1 - i;
            const isActive = stackIndex === 0;
            return (
              <SwipeCard
                key={profile.id}
                profile={profile}
                active={isActive}
                stackIndex={stackIndex}
                signal={isActive ? signal : null}
                onSwipe={commitSwipe}
              />
            );
          })
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <EmptyState
              icon={Users}
              title="Zatím nikdo další"
              description="Prošel/prošla jsi všechny profily. Noví studenti se přidávají průběžně."
              action={
                <button
                  type="button"
                  onClick={loadCandidates}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-black shadow-glow-sm"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                  Načíst znovu
                </button>
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

          {lastSwiped && (
            <button
              type="button"
              onClick={undoLast}
              disabled={busy}
              className="mx-auto mt-4 flex items-center gap-1.5 rounded-tag border border-line px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-fg disabled:opacity-50"
            >
              <Undo2 className="h-3.5 w-3.5" strokeWidth={2} />
              Vrátit {lastSwiped.name}
            </button>
          )}
        </div>
      )}

      <MatchModal data={matchData} onClose={() => setMatchData(null)} />
    </div>
  );
}
