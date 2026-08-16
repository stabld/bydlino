import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/shared/BackLink";
import { ListingForm } from "@/components/listings/ListingForm";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: { id: string } }) {
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
  if (!user || user.id !== listing.owner_id) redirect(`/listings/${listing.id}`);

  return (
    <div className="space-y-5">
      <BackLink href={`/listings/${listing.id}`} label="Zpět na inzerát" />
      <h1 className="font-display text-2xl font-bold text-fg">Upravit inzerát</h1>
      <ListingForm listing={listing} />
    </div>
  );
}
