import type { Profile, ProfileContacts } from "@/lib/types";

/**
 * Vyplněný profil je jediné, co rozhoduje o tom, jestli tě ostatní při swipování
 * vezmou vážně — proto to uživateli ukazujeme napřímo.
 */
export function ProfileCompleteness({
  profile,
  contacts,
}: {
  profile: Profile;
  contacts: ProfileContacts | null;
}) {
  const checks: Array<{ label: string; done: boolean }> = [
    { label: "Fotka", done: Boolean(profile.photo_url) },
    { label: "Jméno", done: Boolean(profile.name?.trim()) },
    { label: "Škola", done: Boolean(profile.university || profile.faculty) },
    { label: "Bio", done: Boolean(profile.bio?.trim()) },
    { label: "Tagy", done: (profile.lifestyle_tags?.length ?? 0) > 0 },
    { label: "Rozpočet", done: Boolean(profile.max_budget) },
    { label: "Kontakt", done: Boolean(contacts?.instagram || contacts?.facebook) },
  ];

  const done = checks.filter((c) => c.done).length;
  const pct = Math.round((done / checks.length) * 100);
  const missing = checks.filter((c) => !c.done);

  if (pct === 100) {
    return (
      <div className="rounded-card border border-accent/40 bg-accent-soft px-4 py-3">
        <p className="text-sm font-semibold text-accent">Profil je kompletní</p>
        <p className="mt-0.5 text-xs text-muted">
          Takhle tě uvidí ostatní studenti při swipování.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-fg">Profil vyplněn na {pct} %</p>
        <span className="font-mono text-xs text-muted">
          {done}/{checks.length}
        </span>
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2.5 text-xs text-muted">
        Zbývá doplnit: {missing.map((m) => m.label).join(", ")}.
      </p>
    </div>
  );
}
