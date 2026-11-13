"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  ImageIcon,
  Lock,
  LockOpen,
  Search,
  Shapes,
  Sparkles,
  Type,
  UploadCloud,
  Wand2,
} from "lucide-react";
import type { Silhouette } from "@prisma/client";
import { Garment } from "@/components/garment";
import { cn } from "@/lib/utils";
import { formatTry } from "@/utils/money";
import { iconDataUrl, iconLibrary, shapePresets, templates, textStyles } from "./assets";
import { fontFamilyFor } from "./fonts";
import { pieceDpi, dpiLevel, pieceLabel, shapeLabels, type Piece } from "./model";

export type Tool = "upload" | "text" | "templates" | "graphics" | "shapes" | "ai" | "layers" | "product";

export const toolMeta: Record<Tool, { label: string; icon: typeof Type }> = {
  upload: { label: "Yükle", icon: UploadCloud },
  text: { label: "Metin", icon: Type },
  templates: { label: "Şablon", icon: Wand2 },
  graphics: { label: "Grafik", icon: Sparkles },
  shapes: { label: "Şekil", icon: Shapes },
  ai: { label: "AI", icon: ImageIcon },
  layers: { label: "Katman", icon: GripVertical },
  product: { label: "Ürün", icon: Check },
};

function PanelHead({ title, text }: { title: string; text?: string }) {
  return (
    <div className="px-4 pt-4 pb-3">
      <h2 className="font-display text-xl">{title}</h2>
      {text ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p> : null}
    </div>
  );
}

export function UploadPanel({
  uploading,
  recent,
  onFiles,
  onAddRecent,
}: {
  uploading: boolean;
  recent: { url: string; pixelWidth: number; pixelHeight: number }[];
  onFiles: (files: FileList | File[]) => void;
  onAddRecent: (item: { url: string; pixelWidth: number; pixelHeight: number }) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div>
      <PanelHead title="Görsel yükle" text="PNG (şeffaf arka plan önerilir), JPG, WebP veya SVG. En fazla 8 MB. Sürükle-bırak ve Ctrl+V ile yapıştırma da çalışır." />
      <div className="px-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setOver(false);
            if (event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-4 py-8 text-center transition-colors",
            over ? "border-primary bg-primary/5" : "border-input hover:border-foreground/40",
            uploading && "skeleton",
          )}
        >
          <UploadCloud size={28} className="text-primary" />
          <span className="text-sm font-semibold">{uploading ? "Yükleniyor…" : "Dosya seç veya sürükle"}</span>
          <span className="text-xs text-muted-foreground">300 DPI için 35 cm genişlikte ~4100 px</span>
        </button>
        <input
          ref={input}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) onFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      {recent.length ? (
        <div className="px-4 pt-5 pb-4">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Son yüklenenler</p>
          <div className="grid grid-cols-3 gap-2">
            {recent.map((item) => (
              <button
                key={item.url}
                type="button"
                onClick={() => onAddRecent(item)}
                className="checker aspect-square overflow-hidden rounded-control border border-border hover:border-foreground/40"
                aria-label="Tasarıma ekle"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="size-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <ul className="space-y-2 px-4 pt-4 pb-6 text-xs text-muted-foreground">
        <li>• Baskı alanı dışına taşan kısım basılmaz, tuvalde soluk görünür.</li>
        <li>• Beyaz arka planlı görselde “Beyaz arka planı kaldır”ı kullan.</li>
        <li>• Yüklediğin görselin kullanım hakkına sahip olmalısın.</li>
      </ul>
    </div>
  );
}

export function TextPanel({ onAdd }: { onAdd: (patch: Partial<Piece>) => void }) {
  return (
    <div>
      <PanelHead title="Metin ekle" text="Bir stil seç; yazıyı, fontu, rengi ve kavisi sağ panelden değiştir." />
      <div className="space-y-2 px-4 pb-6">
        <button
          type="button"
          onClick={() => onAdd({ text: "Metnini yaz", fontFamily: "Inter", fontSize: 36 })}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-control bg-foreground text-sm font-semibold text-background hover:bg-foreground/85"
        >
          <Type size={16} /> Metin kutusu ekle
        </button>
        {textStyles.map((style) => (
          <button
            key={style.name}
            type="button"
            onClick={() => onAdd(style.patch)}
            className="block w-full truncate rounded-control border border-border bg-card px-4 py-3 text-left transition-colors hover:border-foreground/40"
            style={{
              fontFamily: fontFamilyFor(style.patch.fontFamily ?? "Inter"),
              fontSize: Math.min(28, (style.patch.fontSize ?? 30) * 0.5),
              fontWeight: style.patch.fontStyle?.includes("bold") ? 700 : 400,
              color: style.patch.fill === "#FFFFFF" ? undefined : undefined,
              WebkitTextStroke: style.patch.strokeWidth ? "1px currentColor" : undefined,
              textShadow: style.patch.shadow ? `2px 2px 0 ${style.patch.shadowColor}` : undefined,
            }}
          >
            {style.preview}
            <span className="ml-2 font-sans text-[11px] font-normal text-muted-foreground">{style.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TemplatesPanel({ onApply, ink }: { onApply: (pieces: Piece[]) => void; ink: string }) {
  return (
    <div>
      <PanelHead title="Hazır şablonlar" text="Şablon mevcut tasarımının üstüne eklenir. Her parçası ayrı düzenlenir." />
      <div className="grid grid-cols-2 gap-2 px-4 pb-6">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onApply(template.build(ink))}
            className="group flex flex-col overflow-hidden rounded-card border border-border bg-card text-left transition-colors hover:border-foreground/40"
          >
            <TemplateThumb pieces={template.build("#111111")} />
            <span className="px-3 pt-2 text-sm font-semibold">{template.name}</span>
            <span className="px-3 pb-3 text-[11px] text-muted-foreground">{template.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Şablonun küçük HTML önizlemesi (canvas açmadan). */
function TemplateThumb({ pieces }: { pieces: Piece[] }) {
  const ox = 180;
  const oy = 190;
  const k = 0.42;
  return (
    <div className="relative aspect-[240/274] w-full overflow-hidden bg-muted" aria-hidden="true">
      <div className="absolute inset-0 origin-top-left" style={{ transform: `scale(${k})`, width: `${100 / k}%`, height: `${100 / k}%` }}>
        {pieces.map((piece) =>
          piece.kind === "text" ? (
            <span
              key={piece.id}
              className="absolute whitespace-pre"
              style={{
                left: piece.x - ox,
                top: piece.y - oy,
                fontFamily: fontFamilyFor(piece.fontFamily),
                fontSize: piece.fontSize,
                fontWeight: piece.fontStyle.includes("bold") ? 700 : 400,
                fontStyle: piece.fontStyle.includes("italic") ? "italic" : undefined,
                letterSpacing: piece.letterSpacing,
                lineHeight: piece.lineHeight,
                color: piece.fill,
                transform: piece.curve ? `perspective(200px) rotateX(${piece.curve / 6}deg)` : undefined,
              }}
            >
              {piece.text}
            </span>
          ) : piece.kind === "icon" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={piece.id} src={iconDataUrl(piece.icon, piece.fill, piece.strokeWidth || 2, piece.iconFilled)} alt="" className="absolute" style={{ left: piece.x - ox, top: piece.y - oy, width: piece.width, height: piece.height }} />
          ) : (
            <span
              key={piece.id}
              className="absolute"
              style={{
                left: piece.x - ox,
                top: piece.y - oy,
                width: piece.width,
                height: piece.height,
                background: piece.fill,
                borderRadius: piece.shape === "circle" || piece.shape === "badge" ? "9999px" : piece.cornerRadius,
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}

export function GraphicsPanel({
  onAddIcon,
  listings,
  onAddImage,
}: {
  onAddIcon: (name: string) => void;
  listings: { id: string; title: string; imageUrl: string }[];
  onAddImage: (url: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.toLocaleLowerCase("tr").trim();
  const icons = Object.entries(iconLibrary).filter(([name, item]) => !q || name.includes(q) || item.label.toLocaleLowerCase("tr").includes(q));
  return (
    <div>
      <PanelHead title="Grafikler" text="Vektör ikonlar her boyutta keskin basılır. Rengini ve kalınlığını sağ panelden değiştir." />
      <div className="px-4">
        <label className="relative block">
          <span className="sr-only">Grafik ara</span>
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kalp, yıldız, kedi…"
            className="h-10 w-full rounded-control border border-input bg-card pr-3 pl-9 text-sm outline-none focus:border-foreground"
          />
        </label>
      </div>
      <div className="grid grid-cols-4 gap-2 px-4 py-4">
        {icons.map(([name, item]) => (
          <button
            key={name}
            type="button"
            title={item.label}
            onClick={() => onAddIcon(name)}
            className="grid aspect-square place-items-center rounded-control border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted"
          >
            <item.Icon size={26} strokeWidth={1.75} />
            <span className="sr-only">{item.label}</span>
          </button>
        ))}
        {icons.length === 0 ? <p className="col-span-4 text-sm text-muted-foreground">Sonuç yok.</p> : null}
      </div>
      {listings.length ? (
        <div className="px-4 pb-6">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Tasarımcı işleri</p>
          <div className="grid grid-cols-2 gap-2">
            {listings.map((listing) => (
              <button
                key={listing.id}
                type="button"
                onClick={() => onAddImage(listing.imageUrl)}
                className="checker overflow-hidden rounded-control border border-border text-left hover:border-foreground/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={listing.imageUrl} alt="" className="aspect-square w-full object-contain" />
                <span className="block truncate bg-card px-2 py-1.5 text-xs">{listing.title}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ShapesPanel({ onAdd }: { onAdd: (shape: Piece["shape"], w: number, h: number) => void }) {
  return (
    <div>
      <PanelHead title="Şekiller" text="Arka plan blokları, çerçeveler ve ayraçlar için." />
      <div className="grid grid-cols-3 gap-2 px-4 pb-6">
        {shapePresets.map((preset) => (
          <button
            key={preset.shape}
            type="button"
            onClick={() => onAdd(preset.shape, preset.w, preset.h)}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-control border border-border bg-card text-xs hover:border-foreground/40 hover:bg-muted"
          >
            <ShapeGlyph shape={preset.shape} />
            {shapeLabels[preset.shape]}
          </button>
        ))}
      </div>
    </div>
  );
}

function ShapeGlyph({ shape }: { shape: Piece["shape"] }) {
  const common = "fill-foreground";
  return (
    <svg viewBox="0 0 40 40" className="size-9" aria-hidden="true">
      {shape === "rect" ? <rect x="4" y="4" width="32" height="32" rx="3" className={common} /> : null}
      {shape === "circle" ? <circle cx="20" cy="20" r="16" className={common} /> : null}
      {shape === "triangle" ? <path d="M20 4 L36 36 H4 Z" className={common} /> : null}
      {shape === "star" ? <path d="M20 3 L24.7 14.6 L37 15.2 L27.4 23 L30.6 35 L20 28.2 L9.4 35 L12.6 23 L3 15.2 L15.3 14.6 Z" className={common} /> : null}
      {shape === "heart" ? <path d="M20 36 C2 24 4 6 20 13 C36 6 38 24 20 36 Z" className={common} /> : null}
      {shape === "badge" ? <path d="M20 2 L24 7 L30 5 L31 11 L37 13 L34 19 L38 24 L32 27 L32 33 L26 33 L22 38 L18 33 L12 35 L10 29 L4 27 L7 21 L3 16 L9 13 L9 7 L15 7 Z" className={common} /> : null}
      {shape === "line" ? <rect x="2" y="18" width="36" height="4" rx="2" className={common} /> : null}
    </svg>
  );
}

export function AiPanel({
  busy,
  onGenerate,
}: {
  busy: boolean;
  onGenerate: (prompt: string, variant: number) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [variant, setVariant] = useState(0);
  const ideas = ["Retro gün batımı", "Minimal dağ silüeti", "Neon kedi", "Takım 2026", "Kahve aşkı"];
  return (
    <div>
      <PanelHead title="AI ile üret" text="Kısa bir fikir yaz, baskıya hazır bir kompozisyon üretelim. Uzak AI servisi bağlı değilken yerel önizleme üretilir." />
      <div className="space-y-3 px-4 pb-6">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          maxLength={72}
          placeholder="Örn. dağların üstünde doğan güneş"
          className="w-full resize-none rounded-control border border-input bg-card px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <div className="flex flex-wrap gap-1.5">
          {ideas.map((idea) => (
            <button key={idea} type="button" onClick={() => setPrompt(idea)} className="rounded-full border border-border px-3 py-1 text-xs hover:border-foreground/40">
              {idea}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={busy || !prompt.trim()}
          onClick={() => {
            onGenerate(prompt.trim(), variant);
            setVariant((v) => v + 1);
          }}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-control bg-primary text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-50",
            busy && "skeleton text-foreground",
          )}
        >
          <Sparkles size={16} /> {busy ? "Üretiliyor…" : variant ? "Yeni varyasyon üret" : "Üret"}
        </button>
      </div>
    </div>
  );
}

export function LayersPanel({
  pieces,
  selectedId,
  onSelect,
  onPatch,
  onMove,
  onReorder,
}: {
  pieces: Piece[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onPatch: (id: string, patch: Partial<Piece>) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onReorder: (fromId: string, toId: string) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const ordered = [...pieces].reverse();
  return (
    <div>
      <PanelHead title="Katmanlar" text="Üstteki katman tasarımda öndedir. Sürükleyerek sırala, çift tıklayarak yeniden adlandır." />
      {ordered.length === 0 ? (
        <p className="px-4 pb-6 text-sm text-muted-foreground">Bu yüzde henüz öğe yok.</p>
      ) : (
        <ul className="space-y-1 px-2 pb-6">
          {ordered.map((piece, index) => {
            const level = dpiLevel(pieceDpi(piece));
            return (
              <li
                key={piece.id}
                draggable
                onDragStart={() => setDragId(piece.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragId && dragId !== piece.id) onReorder(dragId, piece.id);
                  setDragId(null);
                }}
                className={cn(
                  "group flex items-center gap-1 rounded-control border px-1.5 py-1 text-sm",
                  selectedId === piece.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted",
                  piece.hidden && "opacity-50",
                )}
              >
                <GripVertical size={14} className="shrink-0 cursor-grab text-muted-foreground" aria-hidden="true" />
                <button type="button" onClick={() => onSelect(piece.id)} onDoubleClick={() => setRenaming(piece.id)} className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left">
                  <LayerThumb piece={piece} />
                  {renaming === piece.id ? (
                    <input
                      autoFocus
                      defaultValue={pieceLabel(piece)}
                      onBlur={(event) => {
                        onPatch(piece.id, { name: event.target.value.trim() });
                        setRenaming(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") (event.target as HTMLInputElement).blur();
                        if (event.key === "Escape") setRenaming(null);
                      }}
                      className="h-7 min-w-0 flex-1 rounded border border-input bg-card px-1.5 text-sm outline-none"
                    />
                  ) : (
                    <span className="truncate">{pieceLabel(piece)}</span>
                  )}
                  {level === "bad" ? <span className="size-2 shrink-0 rounded-full bg-destructive" title="Düşük çözünürlük" /> : null}
                  {level === "ok" ? <span className="size-2 shrink-0 rounded-full bg-warning" title="Orta çözünürlük" /> : null}
                </button>
                <div className="flex items-center opacity-70 group-hover:opacity-100">
                  <button type="button" className="grid size-7 place-items-center rounded hover:bg-background" aria-label="Yukarı" disabled={index === 0} onClick={() => onMove(piece.id, "up")}>
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" className="grid size-7 place-items-center rounded hover:bg-background" aria-label="Aşağı" disabled={index === ordered.length - 1} onClick={() => onMove(piece.id, "down")}>
                    <ChevronDown size={14} />
                  </button>
                  <button type="button" className="grid size-7 place-items-center rounded hover:bg-background" aria-label={piece.hidden ? "Göster" : "Gizle"} onClick={() => onPatch(piece.id, { hidden: !piece.hidden })}>
                    {piece.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button type="button" className="grid size-7 place-items-center rounded hover:bg-background" aria-label={piece.locked ? "Kilidi aç" : "Kilitle"} onClick={() => onPatch(piece.id, { locked: !piece.locked })}>
                    {piece.locked ? <Lock size={14} /> : <LockOpen size={14} />}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function LayerThumb({ piece }: { piece: Piece }) {
  if (piece.kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={piece.src} alt="" className="checker size-8 shrink-0 rounded border border-border object-contain" />;
  }
  if (piece.kind === "icon") {
    const Icon = iconLibrary[piece.icon]?.Icon ?? Sparkles;
    return (
      <span className="grid size-8 shrink-0 place-items-center rounded border border-border bg-card" style={{ color: piece.fill }}>
        <Icon size={16} />
      </span>
    );
  }
  if (piece.kind === "shape") {
    return <span className="size-8 shrink-0 rounded border border-border" style={{ background: piece.fill }} />;
  }
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded border border-border bg-card text-sm font-bold" style={{ fontFamily: fontFamilyFor(piece.fontFamily), color: piece.fill }}>
      Aa
    </span>
  );
}

export function ProductPanel({
  product,
  products,
  colorId,
  onColor,
}: {
  product: { slug: string; name: string; colors: { id: string; name: string; hex: string }[] };
  products: { slug: string; name: string; silhouette: Silhouette; basePrice: number; color: string }[];
  colorId: string;
  onColor: (id: string) => void;
}) {
  return (
    <div>
      <PanelHead title="Ürün" text="Rengi değiştirmek tasarımı bozmaz. Ürünü değiştirirsen tasarımın taslak olarak seninle gelir." />
      <div className="px-4">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Kumaş rengi</p>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Kumaş rengi">
          {product.colors.map((color) => (
            <button
              key={color.id}
              type="button"
              role="radio"
              aria-checked={color.id === colorId}
              onClick={() => onColor(color.id)}
              className="flex flex-col items-center gap-1 text-[11px]"
            >
              <span
                className={cn(
                  "size-10 rounded-full border border-foreground/15 transition-shadow",
                  color.id === colorId && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
                style={{ background: color.hex }}
              />
              <span className="truncate">{color.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pt-6 pb-6">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Ürünü değiştir</p>
        <ul className="grid grid-cols-2 gap-2">
          {products.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/tasarla/${item.slug}`}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-control border p-2 text-center text-xs transition-colors",
                  item.slug === product.slug ? "border-primary bg-primary/5" : "border-border hover:border-foreground/40",
                )}
              >
                <Garment kind={item.silhouette} color={item.color} print={false} className="h-16 w-auto" />
                <span className="line-clamp-2 font-medium">{item.name}</span>
                <span className="text-muted-foreground">{formatTry(item.basePrice)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
