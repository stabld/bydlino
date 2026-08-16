"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Instagram, Facebook } from "lucide-react";
import type { Profile, ProfileContacts } from "@/lib/types";
import { initials } from "@/lib/utils";

export function MatchModal({
  data,
  onClose,
}: {
  data: { profile: Profile; contacts: ProfileContacts | null } | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xs rounded-card border border-line bg-surface p-6 text-center shadow-glow"
            initial={{ scale: 0.85, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-accent">
              Je to match!
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-fg">
              Ty a {data.profile.name}
            </h2>

            <div className="relative mx-auto mt-5 h-24 w-24 overflow-hidden rounded-full bg-gradient-primary p-[3px] shadow-glow">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                {data.profile.photo_url ? (
                  <Image src={data.profile.photo_url} alt={data.profile.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface2 text-lg font-bold text-fg">
                    {initials(data.profile.name)}
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm text-muted">
              Kontakty jsou teď odemčené. Napiš si a domluvte se na bydlení.
            </p>

            {(data.contacts?.instagram || data.contacts?.facebook) && (
              <div className="mt-4 space-y-2">
                {data.contacts?.instagram && (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface2 py-2.5 text-sm font-medium text-fg">
                    <Instagram className="h-4 w-4" strokeWidth={1.75} />
                    {data.contacts.instagram}
                  </div>
                )}
                {data.contacts?.facebook && (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface2 py-2.5 text-sm font-medium text-fg">
                    <Facebook className="h-4 w-4" strokeWidth={1.75} />
                    {data.contacts.facebook}
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-line py-3 text-sm font-semibold text-fg"
              >
                Pokračovat
              </button>
              <Link
                href="/matches"
                className="flex-1 rounded-2xl bg-gradient-primary py-3 text-sm font-semibold text-black shadow-glow-sm"
              >
                Moje shody
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
