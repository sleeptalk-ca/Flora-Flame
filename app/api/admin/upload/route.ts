import { NextResponse } from "next/server";
import { assertAdminForApi } from "@/lib/auth/guard";
import { getStore, StoreError } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";

// Vercel rejects request bodies over 4.5 MB; the admin UI compresses images in the browser before upload.
const MAX_BYTES = 4 * 1024 * 1024;

/** Detect image type from magic bytes — never trust the client-supplied MIME type. */
function sniff(b: Uint8Array): { contentType: string; extension: string } | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { contentType: "image/jpeg", extension: "jpg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { contentType: "image/png", extension: "png" };
  const ascii = (s: number, e: number) => String.fromCharCode(...b.slice(s, e));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { contentType: "image/webp", extension: "webp" };
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return { contentType: "image/avif", extension: "avif" };
  return null;
}

export async function POST(request: Request) {
  const session = await assertAdminForApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // CSRF defence in depth: require a same-origin request (cookie is also SameSite=Strict).
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  if (!rateLimit(`upload:${session.email}`, 30, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many uploads. Please wait a few minutes." }, { status: 429 });
  }

  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > MAX_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "Image must be 4 MB or smaller." }, { status: 413 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!file || file.size === 0) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be 4 MB or smaller." }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type) return NextResponse.json({ error: "Use a JPG, PNG, WebP or AVIF image." }, { status: 415 });

  try {
    const url = await getStore().saveImage({ bytes, ...type });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload]", err);
    const message = err instanceof StoreError ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
