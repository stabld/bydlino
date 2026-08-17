import Link from "next/link";
import Image from "next/image";
import { Bookmark, FileText, Send, Instagram, Facebook, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListingCard } from "@/components/listings/ListingCard";
import { initials } from "@/lib/utils";
import type { Listing, ListingInterest, Profile, ProfileContacts } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const supabase = createClient();

  const {
    data: { user },
 } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: likedRows }, { data: myListings }, { data: myInterests }] = await Promise.all([
    supabase
      .from("listing_swipes")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("direction", "like")
      .order("created_at", { ascending: false }),
    supabase
      .from("listings")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .returns<Listing[]>(),
    supabase
      .from("listing_interests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<ListingInterest[]>(),
  ]);

  const likedIds = (likedRows ?? []).map((r) => r.listing_id);
  const { data: savedListings } = likedIds.length
    ? await supabase.from("listings").select("*").in("id", likedIds).returns<Listing[]>()
    : { data: [] as Listing[] };

  // Inzeráty, o které jsem projevil zájem, i s kontaktem na majitele.
  const interestListingIds = (myInterests ?? []).map((i) => i.listing_id);
  const { data: interestListings } = interestListingIds.length
    ? await supabase.from("listings").select("*").in("id", interestListingIds).returns<Listing[]>()
    : { data: [] as Listing[] };

  const ownerIds = Array.from(new Set((interestListings ?? []).map((l) => l.owner_id)));
  const [{ data: owners }, { data: ownerContacts }] = await Promise.all([
    ownerIds.length
      ? supabase.from("profiles").select("*").in("id", ownerIds).returns<Profile[]>()
      : Promise.resolve({ data: [] as Profile[] }),
    ownerIds.length
      ? supabase
          .from("profile_contacts")
          .select("*")
          .in("user_id", ownerIds)
          .returns<ProfileContacts[]>()
      : Promise.resolve({ data: [] as ProfileContacts[] }),
  ]);

  const listingById = new Map((interestListings ?? []).map((l) => [l.id, l]));
  const ownerById = new Map((owners ?? []).map((o) => [o.id, o]));
  const contactByOwner = new Map((ownerContacts ?? []).map((c) => [c.user_id, c]));

  const contacted = (myInterests ?? [])
    .map((interest) => {
      const listing = listingById.get(interest.listing_id);
      if (!listing) return null;
      return {
        interest,
        listing,
        owner: ownerById.get(listing.owner_id) ?? null,
        contacts: contactByOwner.get(listing.owner_id) ?? null,
 };
 })
    .filter(
      (
        x
      ): x is {
        interest: ListingInterest;
        listing: Listing;
        owner: Profile | null;
        contacts: ProfileContacts | null;
 } => Boolean(x)
    );

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-accent" strokeWidth={2} fill="currentColor" />
          <h1 className="font-display text-xl font-bold text-fg lg:text-2xl">Uložené byty</h1>
          <span className="text-sm font-normal text-muted">
            {savedListings?.length ?? 0}
          </span>
        </div>

        {savedListings && savedListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {savedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} saved />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Zatím nic uloženého"
            description="Projeď nabídku a hoď doprava, co tě zaujme."
            action={
              <Link
                href="/swipe"
                className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-black shadow-sm"
              >
                Procházet byty
              </Link>
 }
          />
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Send className="h-4 w-4 text-accent" strokeWidth={2} />
          <h2 className="font-display text-lg font-bold text-fg">Kde jsem se ozval/a</h2>
          <span className="text-sm font-normal text-muted">
            {contacted.length}
          </span>
        </div>

        {contacted.length > 0 ? (
          <div className="space-y-3">
            {contacted.map(({ interest, listing, owner, contacts }) => (
              <Link
                key={interest.id}
                href={`/listings/${listing.id}`}
                className="block rounded-card border border-line bg-surface p-4 transition-colors hover:border-accent/40"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface2">
                    {owner?.photo_url ? (
                      <Image src={owner.photo_url} alt={owner.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-fg">
                        {initials(owner?.name || "?")}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-fg">{listing.title}</p>
                    <p className="truncate text-xs text-muted">{owner?.name || "Inzerent"}</p>
                  </div>
                </div>

                {(contacts?.instagram || contacts?.facebook || contacts?.phone) && (
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
                    {contacts?.phone && (
                      <span className="inline-flex items-center gap-1.5 rounded-tag border border-line bg-bg px-3 py-1.5 text-xs font-medium text-fg">
                        <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {contacts.phone}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            Zatím jsi nikomu nenapsal. U inzerátu klikni na „Mám zájem“ a dostaneš kontakt.
          </p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" strokeWidth={2} />
          <h2 className="font-display text-lg font-bold text-fg">Moje inzeráty</h2>
          <span className="text-sm font-normal text-muted">
            {myListings?.length ?? 0}
          </span>
        </div>

        {myListings && myListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {myListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            Pronajímáš pokoj? Přidej inzerát, zabere to dvě minuty.
          </p>
        )}
      </section>
    </div>
  );
}
