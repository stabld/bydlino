"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Check, Instagram, Facebook, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/shared/Toast";
import type { ProfileContacts } from "@/lib/types";

export function InterestButton({
  listingId,
  ownerName,
  initialInterested,
  initialContacts,
}: {
  listingId: string;
  ownerName: string;
  initialInterested: boolean;
  initialContacts: ProfileContacts | null;
}) {
  const router = useRouter();
  const toast = useToast();

  const [interested, setInterested] = useState(initialInterested);
  const [contacts, setContacts] = useState<ProfileContacts | null>(initialContacts);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast("Musíš být přihlášený/á.", "error");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("listing_interests").insert({
      listing_id: listingId,
      user_id: user.id,
      message: message.trim() || null,
    });

    if (error) {
      toast("Nepovedlo se odeslat zájem.", "error");
      setLoading(false);
      return;
    }

    // Kontakt se odemyká až po zápisu zájmu (řídí to RLS politika na serveru).
    const { data: listing } = await supabase
      .from("listings")
      .select("owner_id")
      .eq("id", listingId)
      .maybeSingle();

    if (listing) {
      const { data: unlocked } = await supabase
        .from("profile_contacts")
        .select("*")
        .eq("user_id", listing.owner_id)
        .maybeSingle<ProfileContacts>();
      setContacts(unlocked ?? null);
    }

    setInterested(true);
    setOpen(false);
    setLoading(false);
    toast("Zájem odeslán — kontakt je odemčený");
    router.refresh();
  }

  if (interested) {
    return (
      <div className="rounded-card border border-accent/40 bg-accent-soft p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent">
          <Check className="h-4 w-4" strokeWidth={2.5} />
          Projevil/a jsi zájem
        </div>

        {contacts?.instagram || contacts?.facebook || contacts?.phone ? (
          <>
            <p className="mt-2 text-sm text-muted">
              Ozvi se {ownerName} napřímo:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {contacts?.instagram && (
                <span className="inline-flex items-center gap-1.5 rounded-tag border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg">
                  <Instagram className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {contacts.instagram}
                </span>
              )}
              {contacts?.facebook && (
                <span className="inline-flex items-center gap-1.5 rounded-tag border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg">
                  <Facebook className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {contacts.facebook}
                </span>
              )}
              {contacts?.phone && (
                <a
                  href={`tel:${contacts.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-1.5 rounded-tag border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {contacts.phone}
                </a>
              )}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">
            {ownerName} zatím nemá vyplněný kontakt. Uvidí tě mezi zájemci a může se ozvat.
          </p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-black shadow-glow-sm transition-transform active:scale-[0.98]"
      >
        <Send className="h-4 w-4" strokeWidth={2} />
        Mám zájem
      </button>
    );
  }

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <label htmlFor="interest-message" className="mb-1.5 block text-xs font-medium text-muted">
        Zpráva pro {ownerName} (nepovinné)
      </label>
      <textarea
        id="interest-message"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ahoj, studuju na FI MUNI a hledám pokoj od září..."
        className="w-full resize-none rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-fg outline-none focus:border-accent"
      />
      <p className="mt-2 text-xs text-muted">
        Po odeslání se ti odemkne kontakt na inzerenta a on uvidí tvůj profil.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-2xl border border-line py-3 text-sm font-semibold text-fg"
        >
          Zrušit
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-semibold text-black disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Odeslat"}
        </button>
      </div>
    </div>
  );
}
