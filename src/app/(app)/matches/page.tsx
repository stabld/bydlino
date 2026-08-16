import Image from "next/image";
import Link from "next/link";
import { Heart, Instagram, Facebook, GraduationCap, Bookmark, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListingCard } from "@/components/listings/ListingCard";
import { initials } from "@/lib/utils";
import type { Match, Profile, ProfileContacts, Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

type MatchRow = { match: Match; profile: Profile; contacts: ProfileContacts | null };

export default async function MatchesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: matches }, { data: savedRows }, { data: myListings }] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .returns<Match[]>(),
    supabase
      .from("saved_listings")
      .select("listing_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("listings")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .returns<Listing[]>(),
  ]);

  const otherIds = (matches ?? []).map((m) => (m.user_a === user.id ? m.user_b : m.user_a));

  const [{ data: profiles }, { data: contactsRows }] = await Promise.all([
    otherIds.length
      ? supabase.from("profiles").select("*").in("id", otherIds).returns<Profile[]>()
      : Promise.resolve({ data: [] as Profile[] }),
    otherIds.length
      ? supabase
          .from("profile_contacts")
          .select("*")
          .in("user_id", otherIds)
          .returns<ProfileContacts[]>()
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
    .filter((r): r is MatchRow => Boolean(r));

  const savedIds = (savedRows ?? []).map((r) => r.listing_id);
  const { data: savedListings } = savedIds.length
    ? await supabase.from("listings").select("*").in("id", savedIds).returns<Listing[]>()
    : { data: [] as Listing[] };

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Heart className="h-4 w-4 text-accent" strokeWidth={2} fill="currentColor" />
          <h1 className="font-display text-xl font-bold text-fg">Shody</h1>
          <span className="rounded-tag bg-surface2 px-2 py-0.5 font-mono text-[11px] text-muted">
            {rows.length}
          </span>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Zatím žádné shody"
            description="Až se s někým navzájem líbíte, objeví se tady i s kontaktem."
            action={
              <Link
                href="/roommates"
                className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-black shadow-glow-sm"
              >
                Najít spolubydlícího
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {rows.map(({ match, profile, contacts }) => (
              <div key={match.id} className="rounded-card border border-line bg-surface p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface2">
                    {profile.photo_url ? (
                      <Image
                        src={profile.photo_url}
                        alt={profile.name}
                        fill
                        className="object-cover"
                      />
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

                {profile.bio && (
                  <p className="mt-2.5 line-clamp-2 text-sm text-fg/75">{profile.bio}</p>
                )}

                {(contacts?.instagram || contacts?.facebook) && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                    {contacts?.instagram && (
                      <span className="inline-flex items-center gap-1.5 rounded-tag border border-line bg-bg px-3 py-1.5 text-xs font-medium text-fg">
                        <Instagram className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {contacts.instagram}
                      </span>
                    )}
                    {contacts?.facebook && (
                      <span className="inline-flex items-center gap-1.5 rounded-tag border border-line bg-bg px-3 py-1.5 text-xs font-medium text-fg">
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
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-accent" strokeWidth={2} />
          <h2 className="font-display text-lg font-bold text-fg">Uložené pokoje</h2>
          <span className="rounded-tag bg-surface2 px-2 py-0.5 font-mono text-[11px] text-muted">
            {savedListings?.length ?? 0}
          </span>
        </div>

        {savedListings && savedListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {savedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} saved />
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            Nic uloženého. U každého inzerátu ťukni na záložku a uloží se sem.
          </p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" strokeWidth={2} />
          <h2 className="font-display text-lg font-bold text-fg">Moje inzeráty</h2>
          <span className="rounded-tag bg-surface2 px-2 py-0.5 font-mono text-[11px] text-muted">
            {myListings?.length ?? 0}
          </span>
        </div>

        {myListings && myListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {myListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            Nemáš žádný inzerát. Pokud pronajímáš pokoj, přidej ho na stránce Hledat pokoj.
          </p>
        )}
      </section>
    </div>
  );
}
