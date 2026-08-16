import { BackLink } from "@/components/shared/BackLink";
import { ListingForm } from "@/components/listings/ListingForm";

export default function NewListingPage() {
  return (
    <div className="space-y-5">
      <BackLink href="/listings" label="Zpět na nabídky" />
      <h1 className="font-display text-2xl font-bold text-fg">Přidat inzerát</h1>
      <ListingForm />
    </div>
  );
}
