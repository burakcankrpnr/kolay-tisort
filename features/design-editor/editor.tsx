"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Silhouette } from "@prisma/client";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Grid3x3,
  Keyboard,
  Maximize,
  Minus,
  Pencil,
  Plus,
  Redo2,
  Save,
  ShoppingBag,
  Sparkles,
  SunMedium,
  Trash2,
  Undo2,
  X,
  Copy,
  ArrowUpToLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { printFees, printSideLabel, quantityTierPercent, type PrintSide } from "@/lib/pricing";
import { formatTry } from "@/utils/money";
import { addDesignToCart, saveDesign } from "@/server/actions/design";
import { generateLocalArt, knockOutToFile } from "@/lib/ai/client";
import { DesignCanvas, type CanvasHandle } from "./canvas";
import { dataUrlToBlob, renderPrintFile, uploadBlob } from "./export";
import { ensureFont } from "./fonts";
import {
  dpiLevel,
  makePiece,
  normalizePieces,
  pieceDpi,
  PRINT,
  PRINT_HEIGHT_CM,
  PRINT_WIDTH_CM,
  sideLabel,
  STAGE,
  type Doc,
  type Piece,
  type Side,
} from "./model";
import { AiPanel, GraphicsPanel, LayersPanel, ProductPanel, ShapesPanel, TemplatesPanel, TextPanel, toolMeta, UploadPanel, type Tool } from "./panels";
import { Properties, type Align } from "./properties";
import { IconButton } from "./ui";

type Product = {
  id: string;
  slug: string;
  name: string;
  silhouette: Silhouette;
  basePrice: number;
  productionDays: number;
  colors: { id: string; name: string; hex: string }[];
  sizes: { id: string; name: string }[];
  variants: { id: string; colorId: string; sizeId: string; stock: number; priceDelta: number }[];
};

type Props = {
  product: Product;
  products: { slug: string; name: string; silhouette: Silhouette; basePrice: number; color: string }[];
  listings: { id: string; title: string; imageUrl: string }[];
  initialDesign: { id: string; name: string; front: unknown; back: unknown } | null;
  signedIn: boolean;
};

type Toast = { id: number; text: string; tone: "info" | "success" | "error"; href?: string; hrefLabel?: string };
type Recent = { url: string; pixelWidth: number; pixelHeight: number };

const DRAFT_KEY = "studio-draft-v2";
const UPLOADS_KEY = "studio-uploads";
const TOUR_KEY = "studio-tour-done";
const tools: Tool[] = ["upload", "text", "templates", "graphics", "shapes", "ai", "layers", "product"];

function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // kota dolu / gizli pencere: sessizce geç
  }
}

export default function Editor({ product, products, listings, initialDesign, signedIn }: Props) {
  const router = useRouter();
  const canvasRef = useRef<CanvasHandle>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // ── Başlangıç durumu: kayıtlı tasarım > yerel taslak > boş (editör yalnızca istemcide çalışır) ──
  const [boot] = useState(() => {
    const recent = readStorage<Recent[]>(UPLOADS_KEY) ?? [];
    const tour = !readStorage<boolean>(TOUR_KEY);
    if (initialDesign) {
      return { doc: { front: normalizePieces(initialDesign.front), back: normalizePieces(initialDesign.back) }, name: initialDesign.name, colorName: undefined as string | undefined, restored: "design" as const, recent, tour };
    }
    const draft = readStorage<{ doc: Doc; colorName?: string; name?: string }>(DRAFT_KEY);
    if (draft && (draft.doc?.front?.length || draft.doc?.back?.length)) {
      return { doc: { front: normalizePieces(draft.doc.front), back: normalizePieces(draft.doc.back) }, name: draft.name, colorName: draft.colorName, restored: "draft" as const, recent, tour };
    }
    return { doc: { front: [], back: [] } as Doc, name: undefined, colorName: undefined, restored: null, recent, tour };
  });

  // ── Belge ve geçmiş ─────────────────────────────────────────
  const [doc, setDoc] = useState<Doc>(boot.doc);
  const [past, setPast] = useState<Doc[]>([]);
  const [future, setFuture] = useState<Doc[]>([]);
  const lastCommit = useRef<{ key: string; at: number } | null>(null);
  const docRef = useRef(doc);
  docRef.current = doc;

  const [side, setSide] = useState<Side>("front");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState(boot.name ?? `${product.name} tasarımım`);
  const [colorId, setColorId] = useState(product.colors.find((c) => c.name === boot.colorName)?.id ?? product.colors[0]?.id ?? "");
  const [sizeId, setSizeId] = useState(product.sizes.find((s) => s.name === "M")?.id ?? product.sizes[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  // ── Arayüz durumu ──────────────────────────────────────────
  const [tool, setTool] = useState<Tool | null>("templates");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [propsSheet, setPropsSheet] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(0.8);
  const [showGrid, setShowGrid] = useState(false);
  const [realistic, setRealistic] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>(() =>
    boot.restored === "design"
      ? [{ id: 0, text: "Kayıtlı tasarımın açıldı.", tone: "success" }]
      : boot.restored === "draft"
        ? [{ id: 0, text: "Kaldığın yerden devam ediyorsun.", tone: "info" }]
        : [],
  );
  const [uploading, setUploading] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [bgBusy, setBgBusy] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [recent, setRecent] = useState<Recent[]>(boot.recent);
  const [tourStep, setTourStep] = useState<number | null>(boot.tour ? 0 : null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [fontTick, setFontTick] = useState(0);
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [busyText, setBusyText] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [box, setBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const clipboard = useRef<Piece | null>(null);

  const pieces = doc[side];
  const selected = pieces.find((piece) => piece.id === selectedId) ?? null;
  const color = product.colors.find((item) => item.id === colorId) ?? product.colors[0];
  const garmentHex = color?.hex ?? "#161616";
  const ink = luminance(garmentHex) > 0.55 ? "#111111" : "#FFFFFF";
  const scale = fit * zoom;

  const toast = useCallback((text: string, tone: Toast["tone"] = "info", link?: { href: string; label: string }) => {
    const id = Date.now() + Math.random();
    setToasts((rows) => [...rows.slice(-2), { id, text, tone, href: link?.href, hrefLabel: link?.label }]);
    setTimeout(() => setToasts((rows) => rows.filter((row) => row.id !== id)), link ? 7000 : 4200);
  }, []);

  /** Değişikliği geçmişe yazar; aynı anahtarla 700 ms içindeki değişiklikler birleşir (slider sürükleme). */
  const commit = useCallback((next: Doc, key?: string) => {
    const now = Date.now();
    const merge = key && lastCommit.current?.key === key && now - lastCommit.current.at < 700;
    if (!merge) {
      setPast((rows) => [...rows.slice(-59), docRef.current]);
      setFuture([]);
    }
    lastCommit.current = key ? { key, at: now } : null;
    setDoc(next);
  }, []);

  const setSidePieces = useCallback(
    (recipe: (rows: Piece[]) => Piece[], key?: string, targetSide: Side = side) => {
      const current = docRef.current;
      commit({ ...current, [targetSide]: recipe(current[targetSide]) }, key);
    },
    [commit, side],
  );

  const patchPiece = useCallback(
    (id: string, patch: Partial<Piece>, key?: string) => setSidePieces((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)), key),
    [setSidePieces],
  );

  const addPieces = useCallback(
    (items: Piece[]) => {
      if (!items.length) return;
      setSidePieces((rows) => [...rows, ...items]);
      setSelectedId(items[items.length - 1]!.id);
      setSheetOpen(false);
    },
    [setSidePieces],
  );

  function undo() {
    const prev = past.at(-1);
    if (!prev) return;
    setFuture((rows) => [doc, ...rows]);
    setPast((rows) => rows.slice(0, -1));
    lastCommit.current = null;
    setDoc(prev);
  }
  function redo() {
    const next = future[0];
    if (!next) return;
    setPast((rows) => [...rows, doc]);
    setFuture((rows) => rows.slice(1));
    lastCommit.current = null;
    setDoc(next);
  }

  // ── İlk yükleme bildirimi ──
  useEffect(() => {
    const timer = setTimeout(() => setToasts((rows) => rows.filter((row) => row.id !== 0)), 4200);
    return () => clearTimeout(timer);
  }, []);

  // ── Otomatik taslak kaydı ───────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      writeStorage(DRAFT_KEY, { doc, colorName: color?.name, name, at: new Date().toISOString() });
      setSavedAt(new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
    }, 600);
    return () => clearTimeout(timer);
  }, [doc, color?.name, name]);

  // ── Fontlar: kullanılan fontları yükle, sonra yeniden ölç ──
  const loadedFonts = useRef(new Set<string>());
  useEffect(() => {
    const wanted = [...doc.front, ...doc.back]
      .filter((p) => p.kind === "text")
      .map((p) => `${p.fontFamily}|${p.fontStyle}`)
      .filter((key) => !loadedFonts.current.has(key));
    if (!wanted.length) return;
    let alive = true;
    Promise.all(
      wanted.map((key) => {
        loadedFonts.current.add(key);
        const [family, style] = key.split("|");
        return ensureFont(family!, style);
      }),
    ).then(() => alive && setFontTick((t) => t + 1));
    return () => {
      alive = false;
    };
  }, [doc]);

  // ── Tuvali alana sığdır ─────────────────────────────────────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setFit(Math.max(0.3, Math.min((rect.width - 32) / STAGE.w, (rect.height - 32) / STAGE.h)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Seçili öğenin kutusu (cm alanları için)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setBox(selectedId ? (canvasRef.current?.boxOf(selectedId) ?? null) : null));
    return () => cancelAnimationFrame(frame);
  }, [selectedId, doc, side, fontTick]);

  // ── Yükleme ─────────────────────────────────────────────────
  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
      if (!list.length) {
        toast("Yalnızca görsel dosyası yükleyebilirsin.", "error");
        return;
      }
      setUploading(true);
      const added: Piece[] = [];
      for (const file of list) {
        try {
          const body = new FormData();
          body.set("file", file);
          const response = await fetch("/api/uploads", { method: "POST", body });
          const payload = (await response.json()) as { url?: string; error?: string };
          if (!response.ok || !payload.url) {
            toast(payload.error ?? "Yükleme tamamlanamadı.", "error");
            continue;
          }
          const probe = await loadImage(payload.url);
          const item = { url: payload.url, pixelWidth: probe.naturalWidth || 1000, pixelHeight: probe.naturalHeight || 1000 };
          setRecent((rows) => {
            const next = [item, ...rows.filter((row) => row.url !== item.url)].slice(0, 12);
            writeStorage(UPLOADS_KEY, next);
            return next;
          });
          added.push(imagePiece(item, added.length));
          if (hasOpaqueWhiteCorners(probe)) toast("Görselin beyaz arka planı var gibi görünüyor. Sağ panelden “Beyaz arka planı kaldır”ı dene.", "info");
        } catch {
          toast("Görsel okunamadı.", "error");
        }
      }
      setUploading(false);
      if (added.length) {
        addPieces(added);
        const low = added.find((piece) => dpiLevel(pieceDpi(piece)) === "bad");
        if (low) toast("Bu görsel bu boyutta düşük çözünürlüklü. Küçültmen önerilir.", "error");
      }
    },
    [addPieces, toast],
  );

  // Panodan yapıştırma (görsel) ve tuvale sürükle-bırak
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
      if (files.length) {
        event.preventDefault();
        void uploadFiles(files);
      }
    };
    addEventListener("paste", onPaste);
    return () => removeEventListener("paste", onPaste);
  }, [uploadFiles]);

  // ── İşlemler ────────────────────────────────────────────────
  function addText(patch: Partial<Piece>) {
    const piece = makePiece({ fill: ink, ...patch });
    piece.x = PRINT.x + PRINT.w / 2 - Math.min(PRINT.w / 2 - 10, (piece.text.length * piece.fontSize * 0.55) / 2);
    piece.y = PRINT.y + PRINT.h * 0.3;
    addPieces([piece]);
  }

  function addIcon(icon: string) {
    addPieces([makePiece({ kind: "icon", icon, width: 110, height: 110, fill: ink, strokeWidth: 2, x: PRINT.x + PRINT.w / 2 - 55, y: PRINT.y + PRINT.h / 2 - 55 })]);
  }

  function addShape(shape: Piece["shape"], w: number, h: number) {
    addPieces([makePiece({ kind: "shape", shape, width: w, height: h, fill: shape === "line" ? ink : "#FF3B00", strokeWidth: 0, x: PRINT.x + (PRINT.w - w) / 2, y: PRINT.y + (PRINT.h - h) / 2 })]);
  }

  async function addImageUrl(url: string) {
    try {
      const probe = await loadImage(url);
      addPieces([imagePiece({ url, pixelWidth: probe.naturalWidth || 1000, pixelHeight: probe.naturalHeight || 1000 }, 0)]);
    } catch {
      toast("Görsel eklenemedi.", "error");
    }
  }

  async function generate(prompt: string, variant: number) {
    setAiBusy(true);
    try {
      const art = await generateLocalArt(prompt, variant);
      addPieces([makePiece({ kind: "image", src: art.url, width: 180, height: 180, pixelWidth: 800, x: PRINT.x + 30, y: PRINT.y + 40, name: `AI · ${prompt.slice(0, 16)}` })]);
      toast(art.note, "info");
    } catch {
      toast("Üretim tamamlanamadı. Tekrar dene.", "error");
    } finally {
      setAiBusy(false);
    }
  }

  async function removeBackground() {
    if (!selected || selected.kind !== "image") return;
    setBgBusy(true);
    try {
      const url = await knockOutToFile(selected.src);
      patchPiece(selected.id, { src: url });
      toast("Beyaz arka plan temizlendi.", "success");
    } catch {
      toast("Arka plan temizlenemedi.", "error");
    } finally {
      setBgBusy(false);
    }
  }

  function duplicate(piece = selected) {
    if (!piece) return;
    const copy = { ...piece, id: crypto.randomUUID(), x: piece.x + 14, y: piece.y + 14, locked: false };
    addPieces([copy]);
  }

  function remove(id = selectedId) {
    if (!id) return;
    setSidePieces((rows) => rows.filter((row) => row.id !== id));
    setSelectedId(null);
    setPropsSheet(false);
  }

  function order(id: string, direction: "up" | "down" | "top" | "bottom") {
    setSidePieces((rows) => {
      const index = rows.findIndex((row) => row.id === id);
      if (index < 0) return rows;
      const next = [...rows];
      const [item] = next.splice(index, 1);
      const target = direction === "top" ? next.length : direction === "bottom" ? 0 : direction === "up" ? Math.min(next.length, index + 1) : Math.max(0, index - 1);
      next.splice(target, 0, item!);
      return next;
    });
  }

  function reorder(fromId: string, toId: string) {
    setSidePieces((rows) => {
      const from = rows.findIndex((row) => row.id === fromId);
      const to = rows.findIndex((row) => row.id === toId);
      if (from < 0 || to < 0) return rows;
      const next = [...rows];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
  }

  function align(where: Align) {
    if (!selected) return;
    const b = canvasRef.current?.boxOf(selected.id);
    if (!b) return;
    let dx = 0;
    let dy = 0;
    if (where === "left") dx = PRINT.x - b.x;
    if (where === "hcenter") dx = PRINT.x + PRINT.w / 2 - (b.x + b.width / 2);
    if (where === "right") dx = PRINT.x + PRINT.w - (b.x + b.width);
    if (where === "top") dy = PRINT.y - b.y;
    if (where === "vcenter") dy = PRINT.y + PRINT.h / 2 - (b.y + b.height / 2);
    if (where === "bottom") dy = PRINT.y + PRINT.h - (b.y + b.height);
    patchPiece(selected.id, { x: selected.x + dx, y: selected.y + dy });
  }

  function clearSide() {
    if (!pieces.length) return;
    setSidePieces(() => []);
    setSelectedId(null);
    toast(`${sideLabel[side]} yüz temizlendi. Geri almak için Ctrl+Z.`, "info");
  }

  // ── Klavye kısayolları ─────────────────────────────────────
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.closest("input, textarea, select, [contenteditable]") || target.isContentEditable)) return;
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (mod && key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (mod && (key === "y" || (key === "z" && event.shiftKey))) {
        event.preventDefault();
        redo();
      } else if (mod && key === "d") {
        event.preventDefault();
        duplicate();
      } else if (mod && key === "c" && selected) {
        clipboard.current = selected;
      } else if (mod && key === "v" && clipboard.current) {
        duplicate(clipboard.current);
      } else if (mod && key === "s") {
        event.preventDefault();
        void saveToAccount();
      } else if ((key === "delete" || key === "backspace") && selected) {
        event.preventDefault();
        remove();
      } else if (key === "escape") {
        setSelectedId(null);
        setShortcutsOpen(false);
        setExportOpen(false);
      } else if (key.startsWith("arrow") && selected && !selected.locked) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const dx = key === "arrowleft" ? -step : key === "arrowright" ? step : 0;
        const dy = key === "arrowup" ? -step : key === "arrowdown" ? step : 0;
        patchPiece(selected.id, { x: selected.x + dx, y: selected.y + dy }, `${selected.id}:nudge`);
      } else if (key === "]" && selected) {
        order(selected.id, "up");
      } else if (key === "[" && selected) {
        order(selected.id, "down");
      } else if ((key === "+" || key === "=") && !mod) {
        setZoom((z) => Math.min(3, z + 0.15));
      } else if (key === "-" && !mod) {
        setZoom((z) => Math.max(0.5, z - 0.15));
      } else if (key === "0" && !mod) {
        setZoom(1);
      } else if (key === "?") {
        setShortcutsOpen((v) => !v);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  // ── Fiyat ──────────────────────────────────────────────────
  const printSide: PrintSide = doc.front.length && doc.back.length ? "BOTH" : doc.back.length ? "BACK" : doc.front.length ? "FRONT" : "NONE";
  const variant = product.variants.find((item) => item.colorId === colorId && item.sizeId === sizeId);
  const unit = product.basePrice + (variant?.priceDelta ?? 0) + printFees[printSide];
  const subtotal = unit * quantity;
  const discountPct = quantityTierPercent(quantity);
  const discount = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discount;
  const nextTier = [10, 20, 50].find((tier) => tier > quantity);
  const nextTierPct = nextTier ? quantityTierPercent(nextTier) : 0;
  const stock = variant?.stock ?? 0;

  const warnings = useMemo(() => {
    const list: { tone: "warning" | "error"; text: string }[] = [];
    const outside = pieces.some((piece) => {
      if (piece.hidden) return false;
      const b = canvasRef.current?.boxOf(piece.id);
      if (!b) return false;
      return b.x < PRINT.x - 1 || b.y < PRINT.y - 1 || b.x + b.width > PRINT.x + PRINT.w + 1 || b.y + b.height > PRINT.y + PRINT.h + 1;
    });
    if (outside) list.push({ tone: "warning", text: "Baskı alanı dışına taşan kısım basılmayacak." });
    if (pieces.some((piece) => dpiLevel(pieceDpi(piece)) === "bad")) list.push({ tone: "error", text: "Düşük çözünürlüklü görsel var (150 DPI altı)." });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pieces, fontTick, box]);

  async function addToCart() {
    if (printSide === "NONE") {
      toast("Önce ön veya arka yüze bir öğe ekle.", "error");
      return;
    }
    if (!variant) {
      toast("Bu renk ve beden kombinasyonu yok.", "error");
      return;
    }
    if (stock < quantity) {
      toast(stock ? `Bu bedende en fazla ${stock} adet var.` : "Bu beden stokta yok.", "error");
      return;
    }
    if (!signedIn) {
      toast("Tasarımını sepete eklemek için giriş yap. Taslağın kaybolmaz.", "error", { href: `/giris?callbackUrl=/tasarla/${product.slug}`, label: "Giriş yap" });
      return;
    }
    setCartBusy(true);
    const assets = await prepareAssets(true);
    if (!assets) {
      setCartBusy(false);
      return;
    }
    const result = await addDesignToCart({
      productId: product.id,
      name,
      variantId: variant.id,
      quantity,
      printSide,
      printWidthCm: PRINT_WIDTH_CM,
      printHeightCm: PRINT_HEIGHT_CM,
      frontJson: doc.front,
      backJson: doc.back,
      previewUrl: assets.previewUrl ?? undefined,
      printFiles: assets.printFiles,
    });
    if ("error" in result && result.error) {
      setCartBusy(false);
      toast(result.error, "error");
      return;
    }
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // önemsiz
    }
    void import("@/components/effects/confetti").then((m) => m.burst({ y: 0.4 }));
    toast("Sepete eklendi!", "success");
    setTimeout(() => router.push("/sepet"), 700);
  }

  async function saveToAccount() {
    if (!signedIn) {
      toast("Tasarımı hesabına kaydetmek için giriş yap.", "error", { href: `/giris?callbackUrl=/tasarla/${product.slug}`, label: "Giriş yap" });
      return;
    }
    if (printSide === "NONE") {
      toast("Kaydedilecek bir öğe yok.", "error");
      return;
    }
    setSaveBusy(true);
    const assets = await prepareAssets(false);
    if (!assets) {
      setSaveBusy(false);
      return;
    }
    const result = await saveDesign({
      productId: product.id,
      name,
      printWidthCm: PRINT_WIDTH_CM,
      printHeightCm: PRINT_HEIGHT_CM,
      frontJson: doc.front,
      backJson: doc.back,
      previewUrl: assets.previewUrl ?? undefined,
    });
    setSaveBusy(false);
    if ("error" in result) toast(result.error ?? "Kaydedilemedi.", "error");
    else toast("Tasarım hesabına kaydedildi.", "success", { href: "/hesap#tasarimlar", label: "Tasarımlarım" });
  }

  /** Önizleme görselini ve (istenirse) her yüz için 300 DPI baskı dosyasını üretip yükler. */
  async function prepareAssets(withPrint: boolean) {
    setSelectedId(null);
    setBusyText("Önizleme hazırlanıyor…");
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
    try {
      const mock = canvasRef.current?.exportMockup();
      const previewUrl = mock ? await uploadBlob(await dataUrlToBlob(mock), "onizleme.png") : null;
      const printFiles: { side: Side; url: string; dpi: number }[] = [];
      if (withPrint) {
        for (const s of ["front", "back"] as const) {
          if (!doc[s].length) continue;
          setBusyText(`${sideLabel[s]} baskı dosyası hazırlanıyor (300 DPI)…`);
          const blob = await renderPrintFile(doc[s], 300);
          const url = blob ? await uploadBlob(blob, `baski-${s}.png`) : null;
          if (!url) throw new Error("print");
          printFiles.push({ side: s, url, dpi: 300 });
        }
      }
      return { previewUrl, printFiles };
    } catch {
      toast("Baskı dosyası hazırlanamadı. Tekrar dene.", "error");
      return null;
    } finally {
      setBusyText(null);
    }
  }

  async function download(kind: "mockup" | "print") {
    setSelectedId(null);
    setExportOpen(false);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
    let href: string | null = null;
    if (kind === "mockup") {
      href = canvasRef.current?.exportMockup() ?? null;
    } else {
      setBusyText("Baskı dosyası hazırlanıyor (300 DPI)…");
      const blob = await renderPrintFile(pieces, 300);
      setBusyText(null);
      href = blob ? URL.createObjectURL(blob) : null;
    }
    if (!href) {
      toast("Bu yüzde dışa aktarılacak öğe yok.", "error");
      return;
    }
    const a = document.createElement("a");
    a.href = href;
    a.download = `${slugify(name)}-${side === "front" ? "on" : "arka"}${kind === "print" ? "-baski-300dpi" : "-onizleme"}.png`;
    a.click();
    if (kind === "print") setTimeout(() => URL.revokeObjectURL(href!), 4000);
    toast(kind === "print" ? "Baskı dosyası indirildi (35×40 cm, 300 DPI, şeffaf PNG)." : "Önizleme indirildi.", "success");
  }

  function finishTour() {
    setTourStep(null);
    writeStorage(TOUR_KEY, true);
  }

  // Kaydırmayı kilitle (stüdyo tam ekran)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const panel = (current: Tool) => {
    switch (current) {
      case "upload":
        return <UploadPanel uploading={uploading} recent={recent} onFiles={(files) => void uploadFiles(files)} onAddRecent={(item) => addPieces([imagePiece(item, 0)])} />;
      case "text":
        return <TextPanel onAdd={addText} />;
      case "templates":
        return <TemplatesPanel ink={ink} onApply={(items) => addPieces(items)} />;
      case "graphics":
        return <GraphicsPanel onAddIcon={addIcon} listings={listings} onAddImage={(url) => void addImageUrl(url)} />;
      case "shapes":
        return <ShapesPanel onAdd={addShape} />;
      case "ai":
        return <AiPanel busy={aiBusy} onGenerate={(prompt, v) => void generate(prompt, v)} />;
      case "layers":
        return (
          <LayersPanel
            pieces={pieces}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setSheetOpen(false);
            }}
            onPatch={(id, patch) => patchPiece(id, patch)}
            onMove={(id, direction) => order(id, direction)}
            onReorder={reorder}
          />
        );
      case "product":
        return <ProductPanel product={product} products={products} colorId={colorId} onColor={setColorId} />;
    }
  };

  const properties = selected ? (
    <Properties
      piece={selected}
      box={box}
      busy={bgBusy}
      onPatch={(patch, key) => patchPiece(selected.id, patch, key)}
      onAlign={align}
      onOrder={(direction) => order(selected.id, direction)}
      onDuplicate={() => duplicate()}
      onDelete={() => remove()}
      onRemoveBackground={() => void removeBackground()}
    />
  ) : null;

  const orderSummary = (
    <div className="space-y-4 p-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Renk · {color?.name}</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Kumaş rengi">
          {product.colors.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={item.id === colorId}
              aria-label={item.name}
              title={item.name}
              onClick={() => setColorId(item.id)}
              className={cn("size-8 rounded-full border border-foreground/15 transition-shadow", item.id === colorId && "ring-2 ring-primary ring-offset-2 ring-offset-card")}
              style={{ background: item.hex }}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Beden</p>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Beden">
          {product.sizes.map((item) => {
            const v = product.variants.find((row) => row.colorId === colorId && row.sizeId === item.id);
            const out = !v || v.stock <= 0;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={item.id === sizeId}
                disabled={out}
                onClick={() => setSizeId(item.id)}
                className={cn(
                  "h-9 min-w-11 rounded-control border px-2 text-sm font-medium transition-colors disabled:line-through disabled:opacity-40",
                  item.id === sizeId ? "border-foreground bg-foreground text-background" : "border-input bg-card hover:border-foreground/50",
                )}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Adet</p>
        <div className="flex items-center rounded-control border border-input bg-card">
          <IconButton label="Azalt" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
            <Minus size={14} />
          </IconButton>
          <input
            aria-label="Adet"
            type="number"
            min={1}
            max={500}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Math.min(500, Number(event.target.value) || 1)))}
            className="w-12 bg-transparent text-center text-sm font-semibold tabular-nums outline-none"
          />
          <IconButton label="Artır" onClick={() => setQuantity((q) => Math.min(500, q + 1))}>
            <Plus size={14} />
          </IconButton>
        </div>
      </div>
      {nextTier ? (
        <p className="rounded-control bg-primary/10 px-3 py-2 text-xs text-foreground">
          <strong>{nextTier - quantity} adet</strong> daha ekle, <strong>%{nextTierPct} toplu indirim</strong> kazan.
        </p>
      ) : null}
      <dl className="space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Ürün</dt>
          <dd className="tabular-nums">{formatTry(product.basePrice + (variant?.priceDelta ?? 0))}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{printSideLabel[printSide]}</dt>
          <dd className="tabular-nums">{printSide === "NONE" ? "—" : `+${formatTry(printFees[printSide])}`}</dd>
        </div>
        {discount ? (
          <div className="flex justify-between text-success">
            <dt>Toplu indirim %{discountPct}</dt>
            <dd className="tabular-nums">−{formatTry(discount)}</dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between border-t border-border pt-2">
          <dt className="font-semibold">Toplam · {quantity} adet</dt>
          <dd key={total} className="price-tick font-display text-2xl font-bold tabular-nums">
            {formatTry(total)}
          </dd>
        </div>
        <p className="text-xs text-muted-foreground">Üretim {product.productionDays} iş günü · kargo ödemede seçilir</p>
      </dl>
      <button
        type="button"
        onClick={() => void addToCart()}
        disabled={cartBusy}
        data-tour="cart"
        className="btn-fill flex h-12 w-full items-center justify-center gap-2 rounded-control bg-foreground text-sm font-semibold text-background hover:text-primary-foreground disabled:opacity-60"
      >
        <ShoppingBag size={18} /> {cartBusy ? "Sepete ekleniyor…" : "Sepete ekle"}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-background text-foreground">
      {/* ── Üst çubuk ── */}
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border bg-card px-2 sm:gap-2 sm:px-3">
        <Link href={`/urun/${product.slug}`} className="grid size-9 place-items-center rounded-control hover:bg-muted" aria-label="Ürüne dön">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex min-w-0 items-center gap-1">
          <Pencil size={13} className="hidden shrink-0 text-muted-foreground sm:block" aria-hidden="true" />
          <input
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, 80))}
            aria-label="Tasarım adı"
            className="h-9 w-32 min-w-0 truncate rounded-control bg-transparent px-1 text-sm font-semibold outline-none hover:bg-muted focus:bg-muted sm:w-56"
          />
        </div>
        <span className="hidden text-xs text-muted-foreground md:inline" aria-live="polite">
          {savedAt ? `Taslak kaydedildi · ${savedAt}` : "Taslak otomatik kaydedilir"}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <IconButton label="Geri al (Ctrl+Z)" onClick={undo} disabled={!past.length}>
            <Undo2 size={18} />
          </IconButton>
          <IconButton label="Yinele (Ctrl+Y)" onClick={redo} disabled={!future.length}>
            <Redo2 size={18} />
          </IconButton>
          <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
          <IconButton label="Izgara" onClick={() => setShowGrid((v) => !v)} active={showGrid} className="hidden sm:grid">
            <Grid3x3 size={18} />
          </IconButton>
          <IconButton label="Gerçekçi önizleme" onClick={() => setRealistic((v) => !v)} active={realistic}>
            <SunMedium size={18} />
          </IconButton>
          <IconButton label="Kısayollar (?)" onClick={() => setShortcutsOpen(true)} className="hidden lg:grid">
            <Keyboard size={18} />
          </IconButton>
          <div className="relative">
            <IconButton label="İndir" onClick={() => setExportOpen((v) => !v)}>
              <Download size={18} />
            </IconButton>
            {exportOpen ? (
              <div className="absolute top-11 right-0 z-10 w-64 rounded-card border border-border bg-card p-1.5 shadow-xl">
                <button type="button" onClick={() => void download("print")} className="block w-full rounded-control px-3 py-2 text-left text-sm hover:bg-muted">
                  <span className="font-semibold">Baskı dosyası (PNG)</span>
                  <span className="block text-xs text-muted-foreground">35×40 cm · 300 DPI · şeffaf · {sideLabel[side]}</span>
                </button>
                <button type="button" onClick={() => void download("mockup")} className="block w-full rounded-control px-3 py-2 text-left text-sm hover:bg-muted">
                  <span className="font-semibold">Ürün önizlemesi (PNG)</span>
                  <span className="block text-xs text-muted-foreground">Paylaşmak için mockup görseli</span>
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void saveToAccount()}
            disabled={saveBusy}
            className="hidden h-9 items-center gap-1.5 rounded-control border border-input px-3 text-sm font-medium hover:border-foreground/50 disabled:opacity-60 sm:flex"
          >
            <Save size={16} /> {saveBusy ? "Kaydediliyor" : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTool("product");
              setSheetOpen(true);
            }}
            className="flex h-9 items-center gap-1.5 rounded-control bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 lg:hidden"
          >
            <ShoppingBag size={16} /> <span className="tabular-nums">{formatTry(total)}</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── Sol araç rayı (masaüstü) ── */}
        <nav aria-label="Araçlar" data-tour="tools" className="hidden w-[76px] shrink-0 flex-col gap-1 border-r border-border bg-card p-2 lg:flex">
          {tools.map((id) => {
            const { label, icon: Icon } = toolMeta[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTool((t) => (t === id ? null : id))}
                aria-pressed={tool === id}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-control px-1 py-2.5 text-[11px] font-medium transition-colors",
                  tool === id ? "bg-foreground text-background" : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon size={20} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* ── Sol panel (masaüstü) ── */}
        {tool ? (
          <aside className="studio-panel hidden w-[300px] shrink-0 overflow-y-auto border-r border-border bg-card lg:block" aria-label={toolMeta[tool].label}>
            {panel(tool)}
          </aside>
        ) : null}

        {/* ── Tuval ── */}
        <main
          className="relative flex min-w-0 flex-1 flex-col bg-muted/50"
          onDragOver={(event) => {
            if (event.dataTransfer.types.includes("Files")) {
              event.preventDefault();
              setDragOver(true);
            }
          }}
          onDragLeave={(event) => {
            if (event.currentTarget === event.target) setDragOver(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            if (event.dataTransfer.files.length) void uploadFiles(event.dataTransfer.files);
          }}
        >
          {/* Ön / Arka */}
          <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
            <div className="pointer-events-auto flex rounded-full border border-border bg-card p-1 shadow-sm" role="tablist" aria-label="Baskı yüzü">
              {(["front", "back"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={side === value}
                  onClick={() => {
                    setSide(value);
                    setSelectedId(null);
                  }}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
                    side === value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {sideLabel[value]}
                  {doc[value].length ? <span className={cn("size-1.5 rounded-full", side === value ? "bg-primary" : "bg-foreground/40")} /> : null}
                </button>
              ))}
            </div>
          </div>

          <div ref={viewportRef} className="studio-dots relative min-h-0 flex-1 overflow-auto">
            <div className="grid min-h-full min-w-full place-items-center p-4" style={{ width: STAGE.w * scale + 32, height: STAGE.h * scale + 32, minWidth: "100%", minHeight: "100%" }}>
              <div className={cn("relative transition-opacity", cartBusy && "opacity-70")}>
                <DesignCanvas
                  ref={canvasRef}
                  key={fontTick}
                  pieces={pieces}
                  silhouette={product.silhouette}
                  garmentColor={garmentHex}
                  selectedId={selectedId}
                  scale={scale}
                  showGrid={showGrid}
                  realistic={realistic}
                  onSelect={(id) => setSelectedId(id)}
                  onChange={(id, patch) => patchPiece(id, patch)}
                  onPinch={(factor) => setZoom((z) => Math.max(0.5, Math.min(3, z * factor)))}
                />
                {pieces.length === 0 ? (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <p className="max-w-[14rem] rounded-card bg-card/90 px-4 py-3 text-center text-sm shadow-sm backdrop-blur">
                      <Sparkles size={16} className="mx-auto mb-1 text-primary" />
                      {sideLabel[side]} yüz boş. Soldan şablon, metin veya görsel ekle.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
            {dragOver ? (
              <div className="pointer-events-none absolute inset-3 grid place-items-center rounded-card border-2 border-dashed border-primary bg-primary/10 text-lg font-semibold">
                Görseli bırak, tasarıma ekleyelim
              </div>
            ) : null}
          </div>

          {/* Uyarılar */}
          {warnings.length ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex flex-col items-center gap-1.5 px-3 lg:bottom-16">
              {warnings.map((warning) => (
                <p
                  key={warning.text}
                  role="status"
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm",
                    warning.tone === "error" ? "bg-destructive text-white" : "bg-warning text-white",
                  )}
                >
                  <AlertTriangle size={14} /> {warning.text}
                </p>
              ))}
            </div>
          ) : null}

          {/* Yakınlaştırma */}
          <div className="absolute bottom-20 left-3 z-10 flex items-center gap-0.5 rounded-control border border-border bg-card p-0.5 shadow-sm lg:bottom-3">
            <IconButton label="Uzaklaştır (-)" onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}>
              <Minus size={16} />
            </IconButton>
            <button type="button" onClick={() => setZoom(1)} className="w-12 text-center text-xs font-semibold tabular-nums" aria-label="Sığdır">
              {Math.round(zoom * 100)}%
            </button>
            <IconButton label="Yakınlaştır (+)" onClick={() => setZoom((z) => Math.min(3, z + 0.15))}>
              <Plus size={16} />
            </IconButton>
            <IconButton label="Sığdır (0)" onClick={() => setZoom(1)}>
              <Maximize size={15} />
            </IconButton>
          </div>
          <div className="absolute right-3 bottom-20 z-10 hidden items-center gap-2 text-xs text-muted-foreground sm:flex lg:bottom-3">
            <span>
              Baskı alanı {PRINT_WIDTH_CM}×{PRINT_HEIGHT_CM} cm
            </span>
            {pieces.length ? (
              <button type="button" onClick={clearSide} className="flex items-center gap-1 rounded-control px-2 py-1 hover:bg-card hover:text-foreground">
                <Trash2 size={13} /> Yüzü temizle
              </button>
            ) : null}
          </div>

          {/* Mobil: seçili öğe bağlamsal çubuğu */}
          {selected ? (
            <div className="absolute inset-x-3 bottom-[4.5rem] z-20 flex items-center justify-around rounded-card border border-border bg-card p-1 shadow-lg lg:hidden">
              <button type="button" onClick={() => setPropsSheet(true)} className="flex h-11 flex-1 items-center justify-center gap-1.5 text-sm font-semibold">
                <Pencil size={16} /> Düzenle
              </button>
              <IconButton label="Kopyala" onClick={() => duplicate()}>
                <Copy size={17} />
              </IconButton>
              <IconButton label="Öne getir" onClick={() => order(selected.id, "top")}>
                <ArrowUpToLine size={17} />
              </IconButton>
              <IconButton label="Sil" onClick={() => remove()}>
                <Trash2 size={17} className="text-destructive" />
              </IconButton>
            </div>
          ) : null}

          {/* Mobil alt araç çubuğu */}
          <nav aria-label="Araçlar" className="z-20 flex shrink-0 overflow-x-auto border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
            {tools.map((id) => {
              const { label, icon: Icon } = toolMeta[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTool(id);
                    setSheetOpen(true);
                  }}
                  className="flex h-16 min-w-[4.25rem] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-foreground/75"
                >
                  <Icon size={20} />
                  {label}
                </button>
              );
            })}
          </nav>
        </main>

        {/* ── Sağ panel (masaüstü) ── */}
        <aside className="studio-panel hidden w-[316px] shrink-0 flex-col border-l border-border bg-card lg:flex" aria-label="Özellikler ve sipariş">
          <div className="min-h-0 flex-1 overflow-y-auto">
            {properties ?? (
              <div className="p-4 text-sm text-muted-foreground">
                <p className="font-display text-xl text-foreground">Özellikler</p>
                <p className="mt-1">Düzenlemek için tuvalde bir öğe seç.</p>
                <ul className="mt-4 space-y-1.5 text-xs">
                  <li>• Sürükle: taşı · köşeler: boyutlandır · üst tutamaç: döndür</li>
                  <li>• Pembe çizgiler hizalandığını gösterir</li>
                  <li>• Ok tuşları 1 px, Shift ile 10 px taşır</li>
                </ul>
              </div>
            )}
          </div>
          <div className="shrink-0 border-t border-border bg-card">
            {selected && !orderExpanded ? (
              <div className="space-y-3 p-4">
                <button type="button" onClick={() => setOrderExpanded(true)} className="flex w-full items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {color?.name} · {product.sizes.find((s) => s.id === sizeId)?.name} · {quantity} adet
                  </span>
                  <span className="text-xs font-semibold underline">Değiştir</span>
                </button>
                <div className="flex items-center gap-3">
                  <p key={total} className="price-tick font-display text-2xl font-bold tabular-nums">
                    {formatTry(total)}
                  </p>
                  <button
                    type="button"
                    onClick={() => void addToCart()}
                    disabled={cartBusy}
                    className="btn-fill ml-auto flex h-11 flex-1 items-center justify-center gap-2 rounded-control bg-foreground text-sm font-semibold text-background hover:text-primary-foreground disabled:opacity-60"
                  >
                    <ShoppingBag size={17} /> {cartBusy ? "Ekleniyor…" : "Sepete ekle"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {selected ? (
                  <button type="button" onClick={() => setOrderExpanded(false)} className="w-full px-4 pt-3 text-right text-xs font-semibold underline">
                    Küçült
                  </button>
                ) : null}
                {orderSummary}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ── Mobil alt sayfalar ── */}
      <BottomSheet open={sheetOpen && Boolean(tool)} onClose={() => setSheetOpen(false)} title={tool ? toolMeta[tool].label : ""}>
        {tool ? panel(tool) : null}
        {tool === "product" ? <div className="border-t border-border">{orderSummary}</div> : null}
      </BottomSheet>
      <BottomSheet open={propsSheet && Boolean(selected)} onClose={() => setPropsSheet(false)} title="Düzenle">
        {properties}
      </BottomSheet>

      {/* ── Tur ── */}
      {tourStep !== null ? <Tour step={tourStep} onNext={() => (tourStep >= 2 ? finishTour() : setTourStep(tourStep + 1))} onSkip={finishTour} /> : null}

      {/* ── Kısayollar ── */}
      {shortcutsOpen ? <Shortcuts onClose={() => setShortcutsOpen(false)} /> : null}

      {busyText ? (
        <div className="fixed inset-0 z-[66] grid place-items-center bg-background/60 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="toast-in flex items-center gap-3 rounded-card border border-border bg-card px-5 py-4 text-sm font-medium shadow-xl">
            <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
            {busyText}
          </div>
        </div>
      ) : null}

      {/* ── Bildirimler ── */}
      <div className="pointer-events-none fixed inset-x-0 top-16 z-[70] flex flex-col items-center gap-2 px-3" aria-live="polite">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "toast-in pointer-events-auto flex max-w-md items-center gap-3 rounded-card px-4 py-3 text-sm shadow-xl",
              item.tone === "error" && "bg-destructive text-white",
              item.tone === "success" && "bg-foreground text-background",
              item.tone === "info" && "border border-border bg-card text-foreground",
            )}
          >
            <span>{item.text}</span>
            {item.href ? (
              <Link href={item.href} className="shrink-0 font-semibold underline">
                {item.hrefLabel}
              </Link>
            ) : null}
          </div>
        ))}
      </div>

    </div>
  );
}

function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  return (
    <div className={cn("fixed inset-0 z-[60] lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open} inert={!open}>
      <div className={cn("absolute inset-0 bg-foreground/25 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <section
        role="dialog"
        aria-label={title}
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[78vh] flex-col rounded-t-[20px] bg-card shadow-2xl transition-transform duration-300 [transition-timing-function:var(--ease-out-expo)]",
          open ? "translate-y-0" : "translate-y-full",
        )}
        style={drag ? { transform: `translateY(${drag}px)`, transition: "none" } : undefined}
      >
        <div
          className="flex shrink-0 touch-none items-center justify-between px-4 pt-2 pb-1"
          onPointerDown={(event) => {
            start.current = event.clientY;
            (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (start.current !== null) setDrag(Math.max(0, event.clientY - start.current));
          }}
          onPointerUp={() => {
            if (drag > 90) onClose();
            setDrag(0);
            start.current = null;
          }}
        >
          <span className="mx-auto h-1.5 w-10 rounded-full bg-input" aria-hidden="true" />
          <button type="button" onClick={onClose} className="absolute right-3 grid size-9 place-items-center rounded-control hover:bg-muted" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">{children}</div>
      </section>
    </div>
  );
}

function Tour({ step, onNext, onSkip }: { step: number; onNext: () => void; onSkip: () => void }) {
  const steps = [
    { title: "1 · Ekle", text: "Soldaki araçlardan şablon, metin, grafik veya kendi görselini ekle. Görseli tuvale sürükleyip bırakabilirsin." },
    { title: "2 · Düzenle", text: "Öğeyi sürükle, köşelerden büyüt, üstten döndür. Pembe çizgiler hizayı gösterir; ayarlar sağ panelde." },
    { title: "3 · Sipariş ver", text: "Renk, beden ve adedi seç. Fiyat canlı güncellenir; hazır olunca “Sepete ekle”." },
  ];
  const current = steps[step]!;
  return (
    <div className="fixed inset-0 z-[65] grid place-items-end bg-foreground/20 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-label="Stüdyo turu">
      <div className="toast-in w-full max-w-sm rounded-card bg-card p-5 shadow-2xl">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">Tasarım stüdyosuna hoş geldin</p>
        <h2 className="mt-2 font-display text-2xl">{current.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{current.text}</p>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            {steps.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-primary" : "w-1.5 bg-input")} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onSkip} className="h-9 rounded-control px-3 text-sm text-muted-foreground hover:text-foreground">
              Atla
            </button>
            <button type="button" onClick={onNext} className="h-9 rounded-control bg-foreground px-4 text-sm font-semibold text-background">
              {step >= 2 ? "Başla" : "İleri"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Shortcuts({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ["Ctrl + Z / Ctrl + Y", "Geri al / Yinele"],
    ["Ctrl + D", "Kopyala"],
    ["Ctrl + C / Ctrl + V", "Kopyala / Yapıştır"],
    ["Delete", "Sil"],
    ["Ok tuşları (+Shift)", "1 px (10 px) taşı"],
    ["] / [", "Öne / arkaya"],
    ["+ / − / 0", "Yakınlaştır / uzaklaştır / sığdır"],
    ["Ctrl + S", "Hesabına kaydet"],
    ["Ctrl + V (görsel)", "Panodan görsel yapıştır"],
    ["Esc", "Seçimi kaldır"],
  ];
  return (
    <div className="fixed inset-0 z-[65] grid place-items-center bg-foreground/30 p-4" role="dialog" aria-modal="true" aria-label="Klavye kısayolları" onClick={onClose}>
      <div className="toast-in w-full max-w-md rounded-card bg-card p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Kısayollar</h2>
          <IconButton label="Kapat" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <dl className="mt-4 divide-y divide-border text-sm">
          {rows.map(([keys, label]) => (
            <div key={keys} className="flex justify-between gap-4 py-2">
              <dt className="font-mono text-xs">{keys}</dt>
              <dd className="text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

// ── yardımcılar ─────────────────────────────────────────────
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Görsel okunamadı."));
    img.src = src;
  });
}

function imagePiece(item: Recent, offset: number) {
  const maxW = PRINT.w * 0.7;
  const ratio = item.pixelHeight / Math.max(1, item.pixelWidth);
  let width = maxW;
  let height = width * ratio;
  if (height > PRINT.h * 0.7) {
    height = PRINT.h * 0.7;
    width = height / ratio;
  }
  return makePiece({
    kind: "image",
    src: item.url,
    width,
    height,
    pixelWidth: item.pixelWidth,
    x: PRINT.x + (PRINT.w - width) / 2 + offset * 12,
    y: PRINT.y + (PRINT.h - height) / 3 + offset * 12,
  });
}

/** Köşeler opak ve beyaza yakınsa arka plan temizleme öner. */
function hasOpaqueWhiteCorners(img: HTMLImageElement) {
  try {
    const c = document.createElement("canvas");
    c.width = 24;
    c.height = 24;
    const ctx = c.getContext("2d");
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0, 24, 24);
    const pts = [
      [0, 0],
      [23, 0],
      [0, 23],
      [23, 23],
    ];
    return pts.every(([x, y]) => {
      const d = ctx.getImageData(x!, y!, 1, 1).data;
      return d[3]! > 250 && d[0]! > 235 && d[1]! > 235 && d[2]! > 235;
    });
  } catch {
    return false;
  }
}

function luminance(hex: string) {
  const v = hex.replace("#", "");
  if (v.length !== 6) return 0;
  return (parseInt(v.slice(0, 2), 16) * 0.299 + parseInt(v.slice(2, 4), 16) * 0.587 + parseInt(v.slice(4, 6), 16) * 0.114) / 255;
}

function slugify(value: string) {
  return (
    value
      .toLocaleLowerCase("tr")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "tasarim"
  );
}
