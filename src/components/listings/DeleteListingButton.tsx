"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/shared/Toast";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase.from("listings").delete().eq("id", listingId);
    toast("Inzerát smazán");
    router.push("/listings");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center justify-center gap-1.5 rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-accent disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" strokeWidth={1.75} />}
      {confirming ? "Opravdu smazat?" : "Smazat"}
    </button>
  );
}
