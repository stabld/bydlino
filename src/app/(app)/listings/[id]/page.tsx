import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, DoorOpen, CalendarDays, Pencil, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate, initials } from "@/lib/utils";
import { Tag } from "@/components/shared/Tag";
import { BackLink } from "@/components/shared/BackLink";
import { DeleteListingButton } from "@/components/listings/DeleteListingButton";
import { SaveButton } from "@/components/listings/SaveButton";
import { InterestButton } from "@/components/listings/InterestButton";
import { PhotoGallery } from "@/components/listings/PhotoGallery";
import type { Listing, Profile, ProfileContacts, ListingInterest } from "@/lib/types";

export const dynamic = "force-dynamic";

type InterestRow = {
  interest: ListingInterest;
  profile: Profile;
  contacts: ProfileContacts | null;
};

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Listing>();

  if (!listing) notFound();

  const isOwner = user?.id === listing.owner_id;

  const { data: owner } = user
    ? await supabase
        .from("profiles")
        .select("id, name, photo_url")
        .eq("id", listing.owner_id)
        .maybeSingle<Pick<Profile, "id" | "name" | "photo_url">>()
    : { data: null };

  const { data: savedRow } = user
    ? await supabase
        .from("listing_swipes")
        .select("listing_id")
        .eq("user_id", user.id)
        .eq("listing_id", listing.id)
        .eq("direction", "like")
        .maybeSingle()
    : { data: null };

  const { data: myInterest } =
    user && !isOwner
      ? await supabase
          .from("listing_interests")
          .select("*")
          .eq("listing_id", listing.id)
          .eq("user_id", user.id)
          .maybeSingle<ListingInterest>()
      : { data: null };

  // Kontakt na majitele — RLS ho vrátí jen tehdy, když na něj mám nárok.
  const { data: ownerContacts } = user && !isOwner
    ? await supabase
        .from("profile_contacts")
        .select("*")
        .eq("user_id", listing.owner_id)
        .maybeSingle<ProfileContacts>()
    : { data: null };

  // Seznam zájemců vidí pouze majitel inzerátu.
  let interested: InterestRow[] = [];
  if (isOwner) {
    const { data: rows } = await supabase
      .from("listing_interests")
      .select("*")
      .eq("listing_id", listing.id)
      .order("created_at", { ascending: false })
      .returns<ListingInterest[]>();

    const ids = (rows ?? []).map((r) => r.user_id);
    if (ids.length) {
      const [{ data: profiles }, { data: contactRows }] = await Promise.all([
        supabase.from("profiles").select("*").in("id", ids).returns<Profile[]>(),
        supabase.from("profile_contacts").select("*").in("user_id", ids).returns<ProfileContacts[]>(),
      ]);
      const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
      const contactById = new Map((contactRows ?? []).map((c) => [c.user_id, c]));
      interested = (rows ?? [])
        .map((interest) => {
          const profile = profileById.get(interest.user_id);
          if (!profile) return null;
          return { interest, profile, contacts: contactById.get(interest.user_id) ?? null };
        })
        .filter((x): x is InterestRow => Boolean(x));
    }
  }

  const availableFrom = formatDate(listing.available_from);

  return (
    <div className="space-y-5">
      <BackLink href="/listings" label="Zpět na nabídky" />

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className="lg:sticky lg:top-10">
          <PhotoGallery photos={listing.photos} title={listing.title} />
        </div>

        <div className="mt-5 space-y-5 lg:mt-0">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-xl font-bold leading-snug text-fg lg:text-2xl">
            {listing.title}
          </h1>
          <span className="shrink-0 rounded-tag bg-accent px-3.5 py-1.5 text-sm font-bold text-black">
            {formatPrice(listing.price)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-4 w-4" strokeWidth={1.75} />
            {listing.location ? `${listing.location}, ` : ""}
            {listing.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <DoorOpen className="h-4 w-4" strokeWidth={1.75} />
            {listing.rooms}+1
          </span>
          {availableFrom && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
              volné od {availableFrom}
            </span>
          )}
        </div>

        {listing.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        {listing.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-fg/80">
            {listing.description}
          </p>
        )}

        {owner && (
          <div className="mt-5 flex items-center gap-3 rounded-card border border-line bg-surface p-3.5">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface2 text-xs font-semibold text-fg">
              {owner.photo_url ? (
                <Image src={owner.photo_url} alt={owner.name} fill className="object-cover" />
              ) : (
                initials(owner.name || "?")
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted">Inzerát vystavil/a</p>
              <p className="truncate text-sm font-semibold text-fg">{owner.name || "Student"}</p>
            </div>
          </div>
        )}
      </div>

      {!user && (
        <div className="rounded-card border border-line bg-surface p-5">
          <h2 className="font-display text-base font-semibold text-fg">
            Chceš se ozvat majiteli?
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Kontakt vidí jen přihlášení. Účet je zdarma a zabere minutu — navíc si uložíš
            byty, které se ti líbí.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/register"
              className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-black shadow-sm"
            >
              Založit účet
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-line px-5 py-2.5 text-sm font-semibold text-fg"
            >
              Přihlásit se
            </Link>
          </div>
        </div>
      )}

      {!isOwner && user && (
        <div className="space-y-2.5">
          <InterestButton
            listingId={listing.id}
            ownerName={owner?.name || "inzerenta"}
            initialInterested={Boolean(myInterest)}
            initialContacts={ownerContacts ?? null}
          />
          <SaveButton listingId={listing.id} initiallySaved={Boolean(savedRow)} variant="full" />
        </div>
      )}

      {isOwner && (
        <>
          <div className="rounded-card border border-line bg-surface p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" strokeWidth={2} />
              <h2 className="font-display text-sm font-semibold text-fg">
                Zájemci ({interested.length})
              </h2>
            </div>

            {interested.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Zatím se nikdo neozval. Jakmile někdo projeví zájem, uvidíš ho tady i s kontaktem.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {interested.map(({ interest, profile, contacts }) => (
                  <div key={interest.id} className="rounded-2xl border border-line bg-bg p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface2">
                        {profile.photo_url ? (
                          <Image
                            src={profile.photo_url}
                            alt={profile.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-fg">
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
                          <p className="truncate text-xs text-muted">
                            {[profile.faculty, profile.university].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {interest.message && (
                      <p className="mt-2 whitespace-pre-line text-sm text-fg/80">
                        {interest.message}
                      </p>
                    )}

                    {(contacts?.instagram || contacts?.facebook) && (
                      <p className="mt-2 text-xs font-medium text-accent">
                        {[contacts?.instagram, contacts?.facebook, contacts?.phone].filter(Boolean).join("  ·  ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-line pt-4">
            <Link
              href={`/listings/${listing.id}/edit`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-line py-3 text-sm font-semibold text-fg"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
              Upravit
            </Link>
            <DeleteListingButton listingId={listing.id} />
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
}
