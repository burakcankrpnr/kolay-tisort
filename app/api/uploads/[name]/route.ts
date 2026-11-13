import { readFile } from "node:fs/promises";
import path from "node:path";

const types: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
};

/**
 * Yüklenen dosyaları sunar. `public/` yalnızca build anındaki dosyaları servis ettiği için
 * çalışma zamanında yüklenen görseller bu route üzerinden okunur.
 * Ad yalnızca bizim ürettiğimiz biçimde olabilir (UUID + uzantı): dizin gezinmesi imkânsız.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const match = /^([a-f0-9-]{36})\.(png|jpg|webp|svg)$/i.exec(name);
  if (!match) return new Response("Bulunamadı", { status: 404 });
  const ext = match[2]!.toLowerCase();
  try {
    const file = await readFile(path.join(process.cwd(), "public", "uploads", name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": types[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // Yüklenen SVG'lerin içindeki betikler çalışamaz.
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:; sandbox",
      },
    });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}
