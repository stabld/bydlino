import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";

export const dynamic = "force-dynamic";

export default async function SwipePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-5 lg:space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-fg lg:text-3xl">Procházet byty</h1>
        <p className="mt-0.5 text-sm text-muted">
          {user ? (
            "Co se ti líbí, hoď doprava. Zbytek doleva."
          ) : (
            <>
              Zkus to bez účtu.{" "}
              <Link href="/register" className="font-medium text-accent underline underline-offset-2">
                Registrací
              </Link>{" "}
              si výběr uložíš natrvalo.
            </>
          )}
        </p>
      </div>

      <SwipeDeck currentUserId={user?.id ?? null} />
    </div>
  );
}
