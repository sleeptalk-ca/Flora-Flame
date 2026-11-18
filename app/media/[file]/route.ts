import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/data/local-store";

/** Serves images uploaded in local-storage mode (Supabase mode returns public Storage URLs instead). */
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|avif)$/.test(file)) {
    return new Response("Not found", { status: 404 });
  }
  const ext = file.split(".").pop()!.toLowerCase();
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, path.basename(file)));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
