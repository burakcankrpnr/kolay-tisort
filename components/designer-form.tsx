"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listingCategories } from "@/lib/listing";
import { cn } from "@/lib/utils";
import { createListing } from "@/server/actions/marketplace";

const selectClass = "h-12 w-full rounded-control border border-input bg-card px-4 text-[15px] outline-none focus:border-foreground";

export function DesignerForm({ products }: { products: { id: string; name: string }[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();

  async function upload(file: File) {
    setUploading(true);
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body });
    const payload = (await response.json()) as { url?: string; error?: string };
    setUploading(false);
    if (!payload.url) {
      setMessage({ tone: "error", text: payload.error ?? "Yükleme tamamlanamadı." });
      return;
    }
    setImageUrl(payload.url);
  }

  return (
    <form
      ref={formRef}
      className="grid gap-5 rounded-card border border-border bg-card p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!imageUrl) {
          setMessage({ tone: "error", text: "Önce tasarım görselini yükle." });
          return;
        }
        const data = new FormData(event.currentTarget);
        data.set("imageUrl", imageUrl);
        start(async () => {
          const result = await createListing(data);
          if (result.error) {
            setMessage({ tone: "error", text: result.error });
            return;
          }
          setMessage({ tone: "ok", text: "İlan incelemeye alındı. Onaylanınca pazarda yayınlanır." });
          setImageUrl("");
          formRef.current?.reset();
          router.refresh();
        });
      }}
    >
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={cn(
          "checker relative grid aspect-[4/3] place-items-center overflow-hidden rounded-card border-2 border-dashed border-input text-center hover:border-foreground/40",
          uploading && "skeleton",
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Yüklenen tasarım" className="absolute inset-0 size-full object-contain p-4" />
        ) : (
          <span className="rounded-card bg-card/90 px-4 py-3">
            <UploadCloud size={26} className="mx-auto text-primary" />
            <span className="mt-1 block text-sm font-semibold">{uploading ? "Yükleniyor…" : "Tasarım görselini yükle"}</span>
            <span className="text-xs text-muted-foreground">Şeffaf PNG, en az 3000 px önerilir</span>
          </span>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      <div>
        <Label htmlFor="title">Başlık</Label>
        <Input id="title" name="title" required minLength={3} placeholder="Örn. Retro gün batımı" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="productId">Ürün</Label>
          <select id="productId" name="productId" className={selectClass}>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          <select id="category" name="category" className={selectClass}>
            {listingCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="tags">Etiketler</Label>
          <Input id="tags" name="tags" placeholder="retro, güneş, yaz" />
        </div>
        <div>
          <Label htmlFor="price">Tasarım ücreti (₺)</Label>
          <Input id="price" name="price" type="number" min={10} step="0.01" required placeholder="49,90" />
        </div>
      </div>
      {message ? (
        <p role="status" className={cn("rounded-control px-4 py-3 text-sm", message.tone === "ok" ? "bg-success/10 text-success" : "shake bg-destructive/10 text-destructive")}>
          {message.text}
        </p>
      ) : null}
      <button type="submit" disabled={pending || uploading} className="h-12 rounded-control bg-foreground text-sm font-semibold text-background disabled:opacity-60">
        {pending ? "Gönderiliyor…" : "İncelemeye gönder"}
      </button>
    </form>
  );
}
