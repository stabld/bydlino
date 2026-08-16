import Link from "next/link";
import { UserCog } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";
import { EmptyState } from "@/components/shared/EmptyState";

export const dynamic = "force-dynamic";

export default async function RoommatesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  const profileIncomplete = !profile?.name;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-fg">Spolubydlící</h1>
        <p className="mt-0.5 text-sm text-muted">Swipe doprava = líbí se mi, doleva = další.</p>
      </div>

      {profileIncomplete ? (
        <EmptyState
          icon={UserCog}
          title="Nejdřív si vyplň profil"
          description="Aby tě ostatní studenti mohli najít, doplň si jméno, školu a pár fotek v profilu."
          action={
            <Link href="/profile" className="rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-black shadow-glow-sm">
              Vyplnit profil
            </Link>
          }
        />
      ) : (
        <SwipeDeck currentUserId={user.id} />
      )}
    </div>
  );
}
