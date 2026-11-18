"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { inputClasses, FieldError, Label } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // stays under Vercel's 4.5 MB request-body limit
const MAX_DIMENSION = 2400;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Resize (longest side ≤ 2400px) and re-encode in the browser before uploading.
 * Large phone photos (5–12 MB) shrink to a few hundred KB, which keeps uploads under hosting limits,
 * makes them fast, and strips EXIF metadata such as GPS location.
 */
async function prepareImage(file: File): Promise<Blob> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Use a JPG, PNG, WebP or AVIF image.");
  if (file.size > 25 * 1024 * 1024) throw new Error("That file is too large (max 25 MB before compression).");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Browser can't decode it (e.g. AVIF on an older browser) — send as-is if small enough.
    if (file.size <= MAX_UPLOAD_BYTES) return file;
    throw new Error("This image couldn't be processed. Try a JPG or PNG under 4 MB.");
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  // WebP keeps transparency; fall back to JPEG where WebP encoding isn't supported.
  for (const quality of [0.86, 0.75, 0.6]) {
    let blob = await encode("image/webp", quality);
    if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg", quality);
    if (blob && blob.size <= MAX_UPLOAD_BYTES) return blob;
  }
  throw new Error("Image is still too large after compression. Try a smaller image.");
}

async function uploadFile(file: File): Promise<string> {
  const prepared = await prepareImage(file);
  const ext = prepared.type === "image/webp" ? "webp" : prepared.type === "image/jpeg" ? "jpg" : file.name.split(".").pop();
  const body = new FormData();
  body.append("file", new File([prepared], `upload.${ext}`, { type: prepared.type }));
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
  return data.url;
}

/* eslint-disable @next/next/no-img-element -- admin previews of arbitrary URLs */

/** Single image: upload a file or paste an https URL. Submits as a hidden input named `name`. */
export function ImageInput({
  name,
  label,
  defaultValue = "",
  error,
  aspect = "aspect-[4/5]",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  aspect?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useId();

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setLocalError(null);
    try {
      setUrl(await uploadFile(file));
    } catch (e) {
      setLocalError((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <Label htmlFor={`${id}-url`}>{label}</Label>
      <input type="hidden" name={name} value={url} />
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "group relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-ink/60 transition-colors hover:border-accent",
            aspect,
          )}
          aria-label="Upload image"
        >
          {url ? (
            <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-xs text-muted">
              <ImagePlus className="size-6" /> Click or drop
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/70">
              <Loader2 className="size-6 animate-spin text-accent" />
            </span>
          )}
        </button>
        <div className="space-y-3">
          <div className="relative">
            <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              id={`${id}-url`}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value.trim())}
              placeholder="https://… or upload a file"
              className={cn(inputClasses, "pl-9")}
              aria-invalid={error || localError ? true : undefined}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-xs transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              <Upload className="size-3.5" /> Upload image
            </button>
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-muted transition-colors hover:border-danger hover:text-danger"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            )}
          </div>
          <p className="text-xs text-muted">JPG, PNG, WebP or AVIF. Large photos are resized automatically.</p>
          <FieldError id={`${id}-err`} message={localError ?? error} />
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}

/** Multiple images (gallery). Each value is submitted as `name` (repeated). */
export function GalleryInput({ name, defaultValue = [], error }: { name: string; defaultValue?: string[]; error?: string }) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useId();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setLocalError(null);
    try {
      for (const f of Array.from(files).slice(0, 8 - urls.length)) {
        const u = await uploadFile(f);
        setUrls((prev) => [...prev, u]);
      }
    } catch (e) {
      setLocalError((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addDraft() {
    if (!/^https:\/\/\S+$/.test(draft)) return setLocalError("Enter a valid https:// URL.");
    setUrls((p) => [...p, draft]);
    setDraft("");
    setLocalError(null);
  }

  return (
    <div>
      <Label htmlFor={`${id}-add`} hint={`${urls.length}/8`}>
        Gallery images
      </Label>
      {urls.map((u, i) => (
        <input key={u + i} type="hidden" name={name} value={u} />
      ))}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {urls.map((u, i) => (
          <div key={u + i} className="group relative aspect-square overflow-hidden rounded-xl border border-line">
            <img src={u} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => setUrls((p) => p.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-ink/80 text-cream opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              aria-label="Remove image"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {urls.length < 8 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-line-strong text-muted transition-colors hover:border-accent hover:text-accent"
            aria-label="Upload gallery images"
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          </button>
        )}
      </div>
      {urls.length < 8 && (
        <div className="mt-3 flex gap-2">
          <input
            id={`${id}-add`}
            type="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDraft();
              }
            }}
            placeholder="Or paste an https:// image URL"
            className={inputClasses}
          />
          <button type="button" onClick={addDraft} className="shrink-0 rounded-xl border border-line-strong px-4 text-xs hover:border-accent hover:text-accent">
            Add
          </button>
        </div>
      )}
      <FieldError id={`${id}-err`} message={localError ?? error} />
      <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" tabIndex={-1} onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}
