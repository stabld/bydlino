"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, X, ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { parseTags, randomFileName } from "@/lib/utils";
import type { Listing } from "@/lib/types";

const MAX_PHOTOS = 5;

export function ListingForm({ listing }: { listing?: Listing }) {
  const router = useRouter();
  const isEdit = Boolean(listing);

  const [title, setTitle] = useState(listing?.title ?? "");
  const [price, setPrice] = useState(listing?.price?.toString() ?? "");
  const [city, setCity] = useState(listing?.city ?? "Brno");
  const [location, setLocation] = useState(listing?.location ?? "");
  const [rooms, setRooms] = useState(listing?.rooms?.toString() ?? "1");
  const [availableFrom, setAvailableFrom] = useState(listing?.available_from ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [tagsInput, setTagsInput] = useState(listing?.tags?.join(", ") ?? "");

  const [existingPhotos, setExistingPhotos] = useState<string[]>(listing?.photos ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPhotoCount = existingPhotos.length + newFiles.length;

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, MAX_PHOTOS - totalPhotoCount);
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  }

  function removeExistingPhoto(url: string) {
    setExistingPhotos((prev) => prev.filter((p) => p !== url));
  }

  function removeNewPhoto(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Musíš být přihlášený/á.");
      setLoading(false);
      return;
    }

    try {
      const uploadedUrls: string[] = [];
      for (const file of newFiles) {
        const path = `${user.id}/${randomFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage.from("listings").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: publicUrl } = supabase.storage.from("listings").getPublicUrl(path);
        uploadedUrls.push(publicUrl.publicUrl);
      }

      const payload = {
        title: title.trim(),
        price: Number(price),
        city: city.trim(),
        location: location.trim() || null,
        rooms: Number(rooms),
        available_from: availableFrom || null,
        description: description.trim() || null,
        tags: parseTags(tagsInput),
        photos: [...existingPhotos, ...uploadedUrls],
      };

      if (isEdit && listing) {
        const { error: updateError } = await supabase
          .from("listings")
          .update(payload)
          .eq("id", listing.id);
        if (updateError) throw updateError;
        router.push(`/listings/${listing.id}`);
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("listings")
          .insert({ ...payload, owner_id: user.id })
          .select("id")
          .single();
        if (insertError) throw insertError;
        router.push(`/listings/${inserted.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Něco se nepovedlo. Zkus to znovu.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-6">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Fotky (max {MAX_PHOTOS})</label>
        <div className="flex flex-wrap gap-2">
          {existingPhotos.map((url) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeExistingPhoto(url)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-paper"
                aria-label="Odebrat fotku"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {newPreviews.map((url, i) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewPhoto(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-paper"
                aria-label="Odebrat fotku"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {totalPhotoCount < MAX_PHOTOS && (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line text-muted transition-colors hover:border-ink hover:text-ink">
              <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Přidat</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="mb-1.5 block text-xs font-medium text-muted">
          Název
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Slunný pokoj u VUT"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-ink"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="price" className="mb-1.5 block text-xs font-medium text-muted">
            Cena / měsíc (Kč)
          </label>
          <input
            id="price"
            type="number"
            required
            min={0}
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="8000"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="rooms" className="mb-1.5 block text-xs font-medium text-muted">
            Počet pokojů
          </label>
          <input
            id="rooms"
            type="number"
            required
            min={1}
            inputMode="numeric"
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="city" className="mb-1.5 block text-xs font-medium text-muted">
            Město
          </label>
          <input
            id="city"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="location" className="mb-1.5 block text-xs font-medium text-muted">
            Čtvrť / ulice
          </label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Královo Pole"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-ink"
          />
        </div>
      </div>

      <div>
        <label htmlFor="availableFrom" className="mb-1.5 block text-xs font-medium text-muted">
          Volné od
        </label>
        <input
          id="availableFrom"
          type="date"
          value={availableFrom ?? ""}
          onChange={(e) => setAvailableFrom(e.target.value)}
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-ink"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-xs font-medium text-muted">
          Popis
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Krátce popiš pokoj, byt a spolubydlící..."
          className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-ink"
        />
      </div>

      <div>
        <label htmlFor="tags" className="mb-1.5 block text-xs font-medium text-muted">
          Tagy (odděl čárkou)
        </label>
        <input
          id="tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="balkón, po rekonstrukci, MHD 5 min"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-ink"
        />
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-paper transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isEdit ? "Uložit změny" : "Zveřejnit inzerát"}
      </button>
    </form>
  );
}
