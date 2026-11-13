"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Konva from "konva";
import { Group, Image as KonvaImage, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import { AlertTriangle, Copy, Info, LayoutGrid, Minus, Plus, RotateCw, ShoppingBag, Trash2, UploadCloud } from "lucide-react";
import { autofit, overlaps, type PackPiece } from "@/features/dtf/pack";
import { dtfPrice, dtfSheets, estimateDpi } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { addDtfToCart } from "@/server/actions/dtf";
import { formatTry } from "@/utils/money";

type Placed = PackPiece & { x: number; y: number; pixelWidth: number };

const MARGIN = 1;

function useImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let alive = true;
    const img = new window.Image();
    img.onload = () => alive && setImage(img);
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return image;
}

/** Parça kutusu (x, y, width, height cm) sabittir; görsel kutunun ortasında döndürülerek çizilir. */
function SheetPiece({
  piece,
  scale,
  colliding,
  onSelect,
  onMove,
  onResize,
}: {
  piece: Placed;
  scale: number;
  colliding: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (factor: number) => void;
}) {
  const image = useImage(piece.imageUrl);
  const quarter = Math.abs(piece.rotation % 180) === 90;
  const imgW = (quarter ? piece.height : piece.width) * scale;
  const imgH = (quarter ? piece.width : piece.height) * scale;
  return (
    <Group
      id={piece.id}
      x={(piece.x + piece.width / 2) * scale}
      y={(piece.y + piece.height / 2) * scale}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onSelect}
      onDragEnd={(event) => onMove(event.target.x() / scale - piece.width / 2, event.target.y() / scale - piece.height / 2)}
      onTransformEnd={(event) => {
        const node = event.target;
        const factor = node.scaleX();
        node.scale({ x: 1, y: 1 });
        onResize(factor);
      }}
    >
      <Rect
        x={(-piece.width * scale) / 2}
        y={(-piece.height * scale) / 2}
        width={piece.width * scale}
        height={piece.height * scale}
        fill={colliding ? "rgba(225,29,72,0.12)" : "rgba(0,0,0,0)"}
        stroke={colliding ? "#E11D48" : "rgba(17,17,17,0.18)"}
        strokeWidth={colliding ? 2 : 1}
        dash={colliding ? undefined : [4, 3]}
      />
      {image ? <KonvaImage image={image} width={imgW} height={imgH} offsetX={imgW / 2} offsetY={imgH / 2} rotation={piece.rotation} /> : null}
    </Group>
  );
}

export default function SheetEditor() {
  const router = useRouter();
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [sheetId, setSheetId] = useState<string>("30x40");
  const [pieces, setPieces] = useState<Placed[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [box, setBox] = useState({ w: 600, h: 700 });
  const sheet = dtfSheets.find((item) => item.id === sheetId) ?? dtfSheets[0];
  const scale = Math.max(4, Math.min((box.w - 48) / sheet.widthCm, (box.h - 48) / sheet.heightCm));
  const perSheet = dtfPrice(sheet.id, Math.max(pieces.length, 1));
  const active = pieces.find((piece) => piece.id === selected) ?? null;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => entry && setBox({ w: entry.contentRect.width, h: Math.max(420, Math.min(entry.contentRect.width * 1.3, 820)) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const node = selected ? stageRef.current?.findOne(`#${selected}`) : null;
    trRef.current?.nodes(node ? [node] : []);
    trRef.current?.getLayer()?.batchDraw();
  }, [selected, pieces, scale]);

  const collisions = useMemo(() => {
    const set = new Set<string>();
    pieces.forEach((a, i) =>
      pieces.forEach((b, j) => {
        if (j > i && overlaps(a, b)) {
          set.add(a.id);
          set.add(b.id);
        }
      }),
    );
    return set;
  }, [pieces]);
  const outside = pieces.filter((p) => p.x < 0 || p.y < 0 || p.x + p.width > sheet.widthCm || p.y + p.height > sheet.heightCm);
  const fill = Math.min(100, Math.round((pieces.reduce((sum, p) => sum + p.width * p.height, 0) / (sheet.widthCm * sheet.heightCm)) * 100));

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploading(true);
    setError(null);
    const added: Placed[] = [];
    for (const file of list) {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!payload.url) {
        setError(payload.error ?? "Yükleme tamamlanamadı.");
        continue;
      }
      const img = await new Promise<HTMLImageElement | null>((resolve) => {
        const probe = new window.Image();
        probe.onload = () => resolve(probe);
        probe.onerror = () => resolve(null);
        probe.src = payload.url!;
      });
      const ratio = img ? img.naturalHeight / Math.max(1, img.naturalWidth) : 1;
      const width = Math.min(10, sheet.widthCm - 2);
      added.push({
        id: crypto.randomUUID(),
        label: file.name.replace(/\.[^.]+$/, "").slice(0, 24),
        imageUrl: payload.url,
        x: MARGIN + added.length,
        y: MARGIN + added.length,
        width,
        height: Math.round(width * ratio * 10) / 10,
        rotation: 0,
        pixelWidth: img?.naturalWidth ?? 0,
      });
    }
    setUploading(false);
    if (added.length) {
      setPieces((rows) => [...rows, ...added]);
      setSelected(added[added.length - 1]!.id);
    }
  }

  function runAutofit() {
    if (!pieces.length) return;
    const before = new Map(pieces.map((p) => [p.id, { x: p.x, y: p.y }]));
    const meta = new Map(pieces.map((p) => [p.id, p.pixelWidth]));
    const packed = autofit(
      pieces.map(({ id, label, imageUrl, width, height, rotation }) => ({ id, label, imageUrl, width, height, rotation })),
      sheet.widthCm,
      sheet.heightCm,
      MARGIN,
    ).map((p) => ({ ...p, pixelWidth: meta.get(p.id) ?? 0 }));
    const overflow = packed.filter((p) => p.y + p.height > sheet.heightCm - MARGIN / 2).length;
    setPieces(packed);
    setSelected(null);
    setNotice(overflow ? `${overflow} parça bu tabakaya sığmadı. Daha büyük tabaka seç veya parçaları küçült.` : "Yerleşim optimize edildi.");
    // Parçalar eski konumlarından yaylı geçişle yerine oturur.
    requestAnimationFrame(() => {
      for (const p of packed) {
        const node = stageRef.current?.findOne(`#${p.id}`);
        const from = before.get(p.id);
        if (!node || !from) continue;
        node.position({ x: (from.x + p.width / 2) * scale, y: (from.y + p.height / 2) * scale });
        node.to({ x: (p.x + p.width / 2) * scale, y: (p.y + p.height / 2) * scale, duration: 0.55, easing: Konva.Easings.BackEaseOut });
      }
    });
    setTimeout(() => setNotice(null), 4000);
  }

  function update(id: string, patch: Partial<Placed>) {
    setPieces((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  async function order() {
    if (collisions.size) {
      setError("Üst üste binen tasarımlar var. AUTOFIT ile ayır.");
      return;
    }
    if (outside.length) {
      setError("Tabaka dışına taşan tasarım var.");
      return;
    }
    setPending(true);
    const result = await addDtfToCart({
      widthCm: sheet.widthCm,
      heightCm: sheet.heightCm,
      quantity,
      pieces: pieces.map(({ imageUrl, label, x, y, width, height, rotation }) => ({ imageUrl, label, x, y, width, height, rotation })),
    });
    setPending(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    void import("@/components/effects/confetti").then((m) => m.burst({ count: 70 }));
    router.push("/sepet");
  }

  const W = sheet.widthCm * scale;
  const H = sheet.heightCm * scale;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)_300px]">
      {/* Sol: tabaka ve tasarımlar */}
      <aside className="space-y-5">
        <section className="rounded-card border border-border bg-card p-4">
          <h2 className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Tabaka ölçüsü</h2>
          <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup">
            {dtfSheets.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={item.id === sheetId}
                onClick={() => setSheetId(item.id)}
                className={cn(
                  "rounded-control border p-3 text-left transition-colors",
                  item.id === sheetId ? "border-foreground ring-1 ring-foreground" : "border-border hover:border-foreground/40",
                )}
              >
                <span className="block font-semibold">
                  {item.widthCm}×{item.heightCm} cm
                </span>
                <span className="text-xs text-muted-foreground">{formatTry(item.price)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-border bg-card p-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center gap-2 rounded-control border-2 border-dashed border-input px-3 py-6 text-center hover:border-foreground/40",
              uploading && "skeleton",
            )}
          >
            <UploadCloud size={24} className="text-primary" />
            <span className="text-sm font-semibold">{uploading ? "Yükleniyor…" : "Tasarım yükle"}</span>
            <span className="text-xs text-muted-foreground">Birden fazla dosya seçebilir veya tabakaya sürükleyebilirsin</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="sr-only"
            onChange={(event) => {
              if (event.target.files?.length) void upload(event.target.files);
              event.target.value = "";
            }}
          />
          {pieces.length ? (
            <ul className="mt-4 max-h-80 space-y-1.5 overflow-y-auto">
              {pieces.map((piece) => {
                const dpi = piece.pixelWidth ? estimateDpi(piece.pixelWidth, piece.width) : null;
                return (
                  <li key={piece.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(piece.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-control border p-1.5 text-left text-sm",
                        selected === piece.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={piece.imageUrl} alt="" className="checker size-10 shrink-0 rounded object-contain" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{piece.label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {piece.width.toFixed(1)}×{piece.height.toFixed(1)} cm
                        </span>
                      </span>
                      {dpi !== null ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            dpi >= 300 ? "bg-success/15 text-success" : dpi >= 150 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive",
                          )}
                        >
                          {dpi} DPI
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>

        <section className="flex gap-3 rounded-card border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
          <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <p>
            Şeffaf arka planlı PNG kullan. Saf beyaz alanların basılması isteniyorsa beyaz yerine <strong className="font-mono">#FFFFFE</strong> kullan.
            Kesim payı için parçalar arasında en az 1 cm boşluk bırakılır.
          </p>
        </section>
      </aside>

      {/* Orta: tabaka */}
      <div
        ref={wrapRef}
        className="relative min-w-0"
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) void upload(event.dataTransfer.files);
        }}
      >
        <div className="studio-dots flex justify-center overflow-auto rounded-card border border-border bg-muted/40 p-6">
          <Stage
            ref={stageRef}
            width={W + 1}
            height={H + 1}
            onMouseDown={(event) => {
              if (event.target === event.target.getStage() || event.target.name() === "sheet") setSelected(null);
            }}
            onTouchStart={(event) => {
              if (event.target === event.target.getStage() || event.target.name() === "sheet") setSelected(null);
            }}
          >
            <Layer>
              <Rect name="sheet" width={W} height={H} fill="#FFFFFF" shadowColor="#000" shadowOpacity={0.12} shadowBlur={18} shadowOffset={{ x: 0, y: 6 }} />
              {Array.from({ length: Math.floor(sheet.widthCm / 5) - 0 }, (_, i) => (i + 1) * 5)
                .filter((cm) => cm < sheet.widthCm)
                .map((cm) => (
                  <Line key={`v${cm}`} points={[cm * scale, 0, cm * scale, H]} stroke="rgba(17,17,17,0.08)" strokeWidth={1} listening={false} />
                ))}
              {Array.from({ length: Math.floor(sheet.heightCm / 5) }, (_, i) => (i + 1) * 5)
                .filter((cm) => cm < sheet.heightCm)
                .map((cm) => (
                  <Line key={`h${cm}`} points={[0, cm * scale, W, cm * scale]} stroke="rgba(17,17,17,0.08)" strokeWidth={1} listening={false} />
                ))}
              <Rect width={W} height={H} stroke="#111111" strokeWidth={1} listening={false} />
              {pieces.map((piece) => (
                <SheetPiece
                  key={piece.id}
                  piece={piece}
                  scale={scale}
                  colliding={collisions.has(piece.id)}
                  onSelect={() => setSelected(piece.id)}
                  onMove={(x, y) => update(piece.id, { x, y })}
                  onResize={(factor) => {
                    const current = pieces.find((p) => p.id === piece.id);
                    if (!current) return;
                    update(piece.id, {
                      width: Math.max(1, Math.round(current.width * factor * 10) / 10),
                      height: Math.max(1, Math.round(current.height * factor * 10) / 10),
                    });
                  }}
                />
              ))}
              {pieces.length === 0 ? (
                <Text width={W} y={H / 2 - 20} align="center" text={"Tasarımlarını yükle veya buraya sürükle"} fontSize={15} fill="rgba(17,17,17,0.45)" listening={false} />
              ) : null}
              <Transformer
                ref={trRef}
                rotateEnabled={false}
                keepRatio
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                anchorSize={10}
                anchorCornerRadius={5}
                anchorStroke="#FF3B00"
                borderStroke="#FF3B00"
              />
            </Layer>
          </Stage>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Tabaka {sheet.widthCm} × {sheet.heightCm} cm · ızgara 5 cm
          </span>
          {notice ? <span className="toast-in rounded-full bg-foreground px-3 py-1 font-medium text-background">{notice}</span> : null}
        </div>
        {dragOver ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-card border-2 border-dashed border-primary bg-primary/10 font-semibold">
            Bırak, tabakaya ekleyelim
          </div>
        ) : null}
      </div>

      {/* Sağ: seçili parça ve özet */}
      <aside className="space-y-5">
        {active ? (
          <section className="toast-in rounded-card border border-border bg-card p-4">
            <h2 className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Seçili tasarım</h2>
            <p className="mt-2 truncate font-semibold">{active.label}</p>
            <label className="mt-3 block text-xs text-muted-foreground" htmlFor="dtf-w">
              Genişlik (cm)
            </label>
            <input
              id="dtf-w"
              type="number"
              min={1}
              max={sheet.widthCm}
              step={0.5}
              value={active.width}
              onChange={(event) => {
                const width = Math.max(1, Number(event.target.value) || 1);
                update(active.id, { width, height: Math.round((active.height * width) / active.width * 10) / 10 });
              }}
              className="mt-1 h-10 w-full rounded-control border border-input bg-card px-3 text-sm tabular-nums outline-none focus:border-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">Yükseklik oranla: {active.height.toFixed(1)} cm</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => update(active.id, { rotation: (active.rotation + 90) % 360, width: active.height, height: active.width })}
                className="flex h-10 items-center justify-center gap-1 rounded-control border border-input text-xs font-medium hover:border-foreground/50"
              >
                <RotateCw size={14} /> 90°
              </button>
              <button
                type="button"
                onClick={() => {
                  const copy = { ...active, id: crypto.randomUUID(), x: active.x + 1, y: active.y + 1 };
                  setPieces((rows) => [...rows, copy]);
                  setSelected(copy.id);
                }}
                className="flex h-10 items-center justify-center gap-1 rounded-control border border-input text-xs font-medium hover:border-foreground/50"
              >
                <Copy size={14} /> Kopya
              </button>
              <button
                type="button"
                onClick={() => {
                  setPieces((rows) => rows.filter((p) => p.id !== active.id));
                  setSelected(null);
                }}
                className="flex h-10 items-center justify-center gap-1 rounded-control border border-input text-xs font-medium text-destructive hover:border-destructive/50"
              >
                <Trash2 size={14} /> Sil
              </button>
            </div>
          </section>
        ) : null}

        <section className="rounded-card border border-border bg-card p-4">
          <button
            type="button"
            onClick={runAutofit}
            disabled={!pieces.length}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-control bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            <LayoutGrid size={17} /> AUTOFIT · otomatik yerleştir
          </button>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Doluluk</span>
              <span className="font-semibold tabular-nums">%{fill}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full origin-left rounded-full transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)]", fill > 85 ? "bg-success" : "bg-primary")}
                style={{ transform: `scaleX(${fill / 100})` }}
              />
            </div>
          </div>
          {collisions.size ? (
            <p className="shake mt-3 flex items-start gap-2 text-xs text-destructive">
              <AlertTriangle size={14} className="mt-px shrink-0" /> {collisions.size} tasarım üst üste biniyor.
            </p>
          ) : pieces.length ? (
            <p className="mt-3 text-xs text-success">Yerleşim geçerli, çakışma yok.</p>
          ) : null}
          {outside.length ? (
            <p className="mt-2 flex items-start gap-2 text-xs text-warning">
              <AlertTriangle size={14} className="mt-px shrink-0" /> {outside.length} tasarım tabaka dışına taşıyor.
            </p>
          ) : null}

          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tabaka fiyatı</dt>
              <dd className="tabular-nums">{formatTry(sheet.price)}</dd>
            </div>
            {pieces.length > 1 ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ek tasarım ({pieces.length - 1})</dt>
                <dd className="tabular-nums">+{formatTry(perSheet - sheet.price)}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Tabaka adedi</dt>
              <dd className="flex items-center rounded-control border border-input">
                <button type="button" aria-label="Azalt" className="grid size-8 place-items-center disabled:opacity-30" disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Minus size={13} />
                </button>
                <span className="w-7 text-center font-semibold tabular-nums">{quantity}</span>
                <button type="button" aria-label="Artır" className="grid size-8 place-items-center disabled:opacity-30" disabled={quantity >= 20} onClick={() => setQuantity((q) => Math.min(20, q + 1))}>
                  <Plus size={13} />
                </button>
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <dt className="font-semibold">Toplam</dt>
              <dd key={perSheet * quantity} className="price-tick font-display text-2xl font-bold tabular-nums">
                {formatTry(perSheet * quantity)}
              </dd>
            </div>
          </dl>
          {error ? (
            <p role="alert" className="shake mt-3 rounded-control bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}{" "}
              {error.includes("giriş") ? (
                <Link href="/giris?callbackUrl=/dtf-baski" className="font-semibold underline">
                  Giriş yap
                </Link>
              ) : null}
            </p>
          ) : null}
          <button
            type="button"
            disabled={pending || pieces.length === 0}
            onClick={() => void order()}
            className="btn-fill mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-control bg-foreground text-sm font-semibold text-background hover:text-primary-foreground disabled:opacity-40"
          >
            <ShoppingBag size={17} /> {pending ? "Sepete ekleniyor…" : "Sepete ekle"}
          </button>
        </section>
      </aside>
    </div>
  );
}
