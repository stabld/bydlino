import { createClient } from "@/lib/supabase/server";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";

export const dynamic = "force-dynamic";

export default async function SwipePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="space-y-5 lg:space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-fg lg:text-3xl">Procházet byty</h1>
        <p className="mt-0.5 text-sm text-muted">
          Co se ti líbí, hoď doprava. Zbytek doleva.
        </p>
      </div>

      <SwipeDeck currentUserId={user.id} />
    </div>
  );
}
