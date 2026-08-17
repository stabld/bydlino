"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Camera, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { randomFileName, initials } from "@/lib/utils";
import { useToast } from "@/components/shared/Toast";
import type { Profile, ProfileContacts } from "@/lib/types";

export function ProfileForm({
  profile,
  contacts,
}: {
  profile: Profile;
  contacts: ProfileContacts | null;
}) {
  const router = useRouter();
  const toast = useToast();

  const [photoUrl, setPhotoUrl] = useState(profile.photo_url);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [name, setName] = useState(profile.name ?? "");
  const [age, setAge] = useState(profile.age?.toString() ?? "");
  const [university, setUniversity] = useState(profile.university ?? "");
  const [faculty, setFaculty] = useState(profile.faculty ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [preferredLocation, setPreferredLocation] = useState(profile.preferred_location ?? "");
  const [maxBudget, setMaxBudget] = useState(profile.max_budget?.toString() ?? "");
  const [instagram, setInstagram] = useState(contacts?.instagram ?? "");
  const [facebook, setFacebook] = useState(contacts?.facebook ?? "");
  const [phone, setPhone] = useState(contacts?.phone ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handlePhotoSelected(file: File | null) {
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
 }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();

    try {
      let nextPhotoUrl = photoUrl;
      if (photoFile) {
        const path = `${profile.id}/${randomFileName(photoFile.name)}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, photoFile);
        if (uploadError) throw uploadError;
        const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
        nextPhotoUrl = publicUrl.publicUrl;
 }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          age: age ? Number(age) : null,
          university: university.trim() || null,
          faculty: faculty.trim() || null,
          bio: bio.trim() || null,
          preferred_location: preferredLocation.trim() || null,
          max_budget: maxBudget ? Number(maxBudget) : null,
          photo_url: nextPhotoUrl,
 })
        .eq("id", profile.id);
      if (profileError) throw profileError;

      const { error: contactsError } = await supabase
        .from("profile_contacts")
        .update({
          instagram: instagram.trim() || null,
          facebook: facebook.trim() || null,
          phone: phone.trim() || null,
 })
        .eq("user_id", profile.id);
      if (contactsError) throw contactsError;

      setPhotoUrl(nextPhotoUrl);
      setPhotoFile(null);
      setSaved(true);
      toast("Profil uložen");
      router.refresh();
 } catch (err) {
      const msg = err instanceof Error ? err.message : "Uložení se nepovedlo. Zkus to znovu.";
      setError(msg);
      toast("Uložení se nepovedlo.", "error");
 } finally {
      setLoading(false);
 }
 }

  const displayPhoto = photoPreview ?? photoUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-6">
      <div className="flex justify-center">
        <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-line bg-surface2 text-fg">
          {displayPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayPhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-xl font-bold">{initials(name || "?")}</span>
          )}
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/70 py-1.5 text-[10px] font-medium text-white">
            <Camera className="h-3 w-3" strokeWidth={2} />
            Změnit
          </span>
          <input
            type="file"
            accept="image/*"
           className="hidden"
            onChange={(e) => handlePhotoSelected(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-muted">
          Jméno
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
         className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="age" className="mb-1.5 block text-xs font-medium text-muted">
            Věk
          </label>
          <input
            id="age"
            type="number"
            min={16}
            max={99}
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
           className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="maxBudget" className="mb-1.5 block text-xs font-medium text-muted">
            Max. rozpočet (Kč)
          </label>
          <input
            id="maxBudget"
            type="number"
            min={0}
            inputMode="numeric"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="9000"
           className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="university" className="mb-1.5 block text-xs font-medium text-muted">
            Univerzita
          </label>
          <input
            id="university"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="VUT"
           className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="faculty" className="mb-1.5 block text-xs font-medium text-muted">
            Fakulta
          </label>
          <input
            id="faculty"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            placeholder="FIT"
           className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="preferredLocation" className="mb-1.5 block text-xs font-medium text-muted">
          Preferovaná lokalita
        </label>
        <input
          id="preferredLocation"
          value={preferredLocation}
          onChange={(e) => setPreferredLocation(e.target.value)}
          placeholder="Brno-střed"
         className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-xs font-medium text-muted">
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Pár vět o tobě — co studuješ, od kdy hledáš, s kým bys bydlel…"
         className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="instagram" className="mb-1.5 block text-xs font-medium text-muted">
            Instagram
          </label>
          <input
            id="instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@jana.novak"
           className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="facebook" className="mb-1.5 block text-xs font-medium text-muted">
            Facebook
          </label>
          <input
            id="facebook"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="Jana Nováková"
           className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none focus:border-accent"
          />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-muted">
          Telefon
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+420 777 123 456"
         className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none focus:border-accent"
        />
      </div>
      <p className="-mt-2 text-xs text-muted">
        Kontakt uvidí jen lidé, se kterými řešíš konkrétní inzerát.
      </p>

      {error && <p className="text-sm text-accent">{error}</p>}

      <button
        type="submit"
        disabled={loading}
       className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-black transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <>
            <Check className="h-4 w-4" />
            Uloženo
          </>
        ) : (
 "Uložit profil"
        )}
      </button>
    </form>
  );
}
