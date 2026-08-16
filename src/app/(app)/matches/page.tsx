import Image from "next/image";
import { Heart, Instagram, Facebook, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/EmptyState";
import { initials } from "@/lib/utils";
import type { Match, Profile, ProfileContacts } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .returns<Match[]>();

  const otherIds = (matches ?? []).map((m) => (m.user_a === user.id ? m.user_b : m.user_a));

  const [{ data: profiles }, { data: contactsRows }] = await Promise.all([
    otherIds.length
      ? supabase.from("profiles").select("*").in("id", otherIds).returns<Profile[]>()
      : Promise.resolve({ data: [] as Profile[] }),
    otherIds.length
      ? supabase.from("profile_contacts").select("*").in("user_id", otherIds).returns<ProfileContacts[]>()
      : Promise.resolve({ data: [] as ProfileContacts[] }),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const contactsById = new Map((contactsRows ?? []).map((c) => [c.user_id, c]));

  const rows = (matches ?? [])
    .map((m) => {
      const otherId = m.user_a === user.id ? m.user_b : m.user_a;
      const profile = profileById.get(otherId);
      if (!profile) return null;
      return { match: m, profile, contacts: contactsById.get(otherId) ?? null };
    })
    .filter((r): r is { match: Match; profile: Profile; contacts: ProfileContacts | null } => Boolean(r));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-fg">Moje shody</h1>
        <p className="mt-0.5 text-sm text-muted">
          {rows.length} {rows.length === 1 ? "shoda" : rows.length >= 2 && rows.length <= 4 ? "shody" : "shod"}
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Zatím žádné shody"
          description="Až se s někým navzájem líbíte, objeví se tady i s kontaktem."
        />
      ) : (
        <div className="space-y-3">
          {rows.map(({ match, profile, contacts }) => (
            <div key={match.id} className="rounded-card border border-line bg-surface p-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface2">
                  {profile.photo_url ? (
                    <Image src={profile.photo_url} alt={profile.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-fg">
                      {initials(profile.name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fg">
                    {profile.name}
                    {profile.age ? `, ${profile.age}` : ""}
                  </p>
                  {(profile.university || profile.faculty) && (
                    <p className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-muted">
                      <GraduationCap className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                      {[profile.faculty, profile.university].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>

              {(contacts?.instagram || contacts?.facebook) && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                  {contacts?.instagram && (
                    <span className="inline-flex items-center gap-1.5 rounded-tag bg-fg/8 border border-line px-3 py-1.5 text-xs font-medium text-fg">
                      <Instagram className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {contacts.instagram}
                    </span>
                  )}
                  {contacts?.facebook && (
                    <span className="inline-flex items-center gap-1.5 rounded-tag bg-fg/8 border border-line px-3 py-1.5 text-xs font-medium text-fg">
                      <Facebook className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {contacts.facebook}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
