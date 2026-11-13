"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  AlignStartVertical,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  ChevronDown,
  ChevronUp,
  Copy,
  Eraser,
  Eye,
  EyeOff,
  FlipHorizontal2,
  FlipVertical2,
  Italic,
  Lock,
  LockOpen,
  RotateCcw,
  Trash2,
  Underline,
  CaseUpper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { studioFonts } from "./fonts";
import { cmToPx, dpiLevel, pieceDpi, PRINT, pxToCm, type Piece } from "./model";

type PrintBox = { x: number; y: number; w: number; h: number };
import { ColorField, NumberField, Section, SliderField, SwitchRow, Toggle } from "./ui";

export type Align = "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom";

export function Properties({
  piece,
  box,
  area = PRINT,
  onPatch,
  onAlign,
  onOrder,
  onDuplicate,
  onDelete,
  onRemoveBackground,
  busy,
}: {
  piece: Piece;
  box: { x: number; y: number; width: number; height: number } | null;
  area?: PrintBox;
  onPatch: (patch: Partial<Piece>, key?: string) => void;
  onAlign: (align: Align) => void;
  onOrder: (direction: "up" | "down" | "top" | "bottom") => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRemoveBackground: () => void;
  busy: boolean;
}) {
  const dpi = pieceDpi(piece);
  const level = dpiLevel(dpi);
  const k = (field: string) => `${piece.id}:${field}`;

  return (
    <div>
      {/* Hızlı işlemler */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
        <Toggle label="Kopyala (Ctrl+D)" onClick={onDuplicate}>
          <Copy size={16} />
        </Toggle>
        <Toggle label={piece.locked ? "Kilidi aç" : "Kilitle"} pressed={piece.locked} onClick={() => onPatch({ locked: !piece.locked })}>
          {piece.locked ? <Lock size={16} /> : <LockOpen size={16} />}
        </Toggle>
        <Toggle label={piece.hidden ? "Göster" : "Gizle"} pressed={piece.hidden} onClick={() => onPatch({ hidden: !piece.hidden })}>
          {piece.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
        </Toggle>
        <Toggle label="Yatay çevir" pressed={piece.flipX} disabled={piece.kind === "text"} onClick={() => onPatch({ flipX: !piece.flipX })}>
          <FlipHorizontal2 size={16} />
        </Toggle>
        <Toggle label="Dikey çevir" pressed={piece.flipY} disabled={piece.kind === "text"} onClick={() => onPatch({ flipY: !piece.flipY })}>
          <FlipVertical2 size={16} />
        </Toggle>
        <span className="ml-auto" />
        <Toggle label="Sil (Delete)" onClick={onDelete}>
          <Trash2 size={16} className="text-destructive" />
        </Toggle>
      </div>

      {piece.kind === "text" ? <TextSection piece={piece} onPatch={onPatch} /> : null}

      {piece.kind === "image" ? (
        <Section title="Görsel">
          {dpi !== null ? (
            <div
              className={cn(
                "rounded-control border px-3 py-2 text-xs",
                level === "good" && "border-success/40 bg-success/10 text-success",
                level === "ok" && "border-warning/40 bg-warning/10 text-warning",
                level === "bad" && "border-destructive/40 bg-destructive/10 text-destructive",
              )}
              role="status"
            >
              <p className="font-semibold">
                {dpi} DPI ·{" "}
                {level === "good" ? "Baskıya hazır" : level === "ok" ? "Kabul edilebilir" : "Düşük çözünürlük"}
              </p>
              <p className="mt-0.5 opacity-80">
                {level === "good"
                  ? "Bu boyutta net basılır."
                  : level === "ok"
                    ? "Küçültürsen netlik artar. 300 DPI idealdir."
                    : "Bu boyutta bulanık basılabilir. Görseli küçült veya daha büyük bir dosya yükle."}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={onRemoveBackground}
            className={cn(
              "flex h-10 w-full items-center justify-center gap-2 rounded-control border border-input bg-card text-sm font-medium hover:border-foreground/50 disabled:opacity-60",
              busy && "skeleton",
            )}
          >
            <Eraser size={16} /> {busy ? "Arka plan temizleniyor…" : "Beyaz arka planı kaldır"}
          </button>
          <SwitchRow label="Siyah-beyaz" checked={piece.grayscale} onChange={(value) => onPatch({ grayscale: value })} />
          <SliderField label="Parlaklık" min={-0.5} max={0.5} step={0.02} value={piece.brightness} onChange={(v) => onPatch({ brightness: v }, k("brightness"))} format={(v) => `${Math.round(v * 200)}`} />
          <SliderField label="Kontrast" min={-60} max={60} step={1} value={piece.contrast} onChange={(v) => onPatch({ contrast: v }, k("contrast"))} />
          {piece.grayscale || piece.brightness || piece.contrast ? (
            <button type="button" className="flex items-center gap-1 text-xs underline" onClick={() => onPatch({ grayscale: false, brightness: 0, contrast: 0 })}>
              <RotateCcw size={12} /> Filtreleri sıfırla
            </button>
          ) : null}
        </Section>
      ) : null}

      {piece.kind === "icon" ? (
        <Section title="Grafik">
          <ColorField label="Renk" value={piece.fill} onChange={(v) => onPatch({ fill: v }, k("fill"))} />
          <SliderField label="Çizgi kalınlığı" min={0.5} max={4} step={0.25} value={piece.strokeWidth || 2} onChange={(v) => onPatch({ strokeWidth: v }, k("sw"))} />
          <SwitchRow label="İçi dolu" checked={piece.iconFilled} onChange={(value) => onPatch({ iconFilled: value })} />
        </Section>
      ) : null}

      {piece.kind === "shape" ? (
        <Section title="Şekil">
          <ColorField label="Dolgu" value={piece.fill} onChange={(v) => onPatch({ fill: v }, k("fill"))} />
          <SliderField label="Kenar kalınlığı" min={0} max={20} step={1} value={piece.strokeWidth} onChange={(v) => onPatch({ strokeWidth: v }, k("sw"))} />
          {piece.strokeWidth > 0 ? <ColorField label="Kenar rengi" value={piece.stroke} onChange={(v) => onPatch({ stroke: v }, k("stroke"))} /> : null}
          {piece.shape === "rect" ? (
            <SliderField label="Köşe yuvarlaklığı" min={0} max={80} value={piece.cornerRadius} onChange={(v) => onPatch({ cornerRadius: v }, k("cr"))} />
          ) : null}
        </Section>
      ) : null}

      <Section title="Konum ve boyut">
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="X"
            suffix="cm"
            value={box ? pxToCm(box.x - area.x) : 0}
            onChange={(cm) => box && onPatch({ x: piece.x + (cmToPx(cm) + area.x - box.x) }, k("x"))}
          />
          <NumberField
            label="Y"
            suffix="cm"
            value={box ? pxToCm(box.y - area.y) : 0}
            onChange={(cm) => box && onPatch({ y: piece.y + (cmToPx(cm) + area.y - box.y) }, k("y"))}
          />
          <NumberField
            label="W"
            suffix="cm"
            value={box ? pxToCm(box.width) : 0}
            onChange={(cm) => {
              if (!box || cm <= 0) return;
              const ratio = cmToPx(cm) / box.width;
              onPatch({ scaleX: piece.scaleX * ratio, scaleY: piece.scaleY * ratio }, k("size"));
            }}
          />
          <NumberField
            label="H"
            suffix="cm"
            value={box ? pxToCm(box.height) : 0}
            onChange={(cm) => {
              if (!box || cm <= 0) return;
              const ratio = cmToPx(cm) / box.height;
              onPatch({ scaleX: piece.scaleX * ratio, scaleY: piece.scaleY * ratio }, k("size"));
            }}
          />
        </div>
        <SliderField label="Döndür" min={-180} max={180} value={Math.round(piece.rotation)} unit="°" onChange={(v) => onPatch({ rotation: v }, k("rot"))} />
        <SliderField label="Opaklık" min={0.1} max={1} step={0.05} value={piece.opacity} onChange={(v) => onPatch({ opacity: v }, k("op"))} format={(v) => `${Math.round(v * 100)}`} unit="%" />
      </Section>

      <Section title="Hizala (baskı alanına)">
        <div className="grid grid-cols-6 gap-1">
          <Toggle label="Sola hizala" onClick={() => onAlign("left")}>
            <AlignStartVertical size={16} />
          </Toggle>
          <Toggle label="Yatay ortala" onClick={() => onAlign("hcenter")}>
            <AlignCenterVertical size={16} />
          </Toggle>
          <Toggle label="Sağa hizala" onClick={() => onAlign("right")}>
            <AlignEndVertical size={16} />
          </Toggle>
          <Toggle label="Üste hizala" onClick={() => onAlign("top")}>
            <AlignStartHorizontal size={16} />
          </Toggle>
          <Toggle label="Dikey ortala" onClick={() => onAlign("vcenter")}>
            <AlignCenterHorizontal size={16} />
          </Toggle>
          <Toggle label="Alta hizala" onClick={() => onAlign("bottom")}>
            <AlignEndHorizontal size={16} />
          </Toggle>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <Toggle label="En öne getir" onClick={() => onOrder("top")}>
            <ArrowUpToLine size={16} />
          </Toggle>
          <Toggle label="Bir öne" onClick={() => onOrder("up")}>
            <ChevronUp size={16} />
          </Toggle>
          <Toggle label="Bir arkaya" onClick={() => onOrder("down")}>
            <ChevronDown size={16} />
          </Toggle>
          <Toggle label="En arkaya gönder" onClick={() => onOrder("bottom")}>
            <ArrowDownToLine size={16} />
          </Toggle>
        </div>
      </Section>

      {piece.kind !== "image" ? (
        <Section title="Efekt">
          <SwitchRow label="Gölge" checked={piece.shadow} onChange={(value) => onPatch({ shadow: value })} />
          {piece.shadow ? (
            <>
              <ColorField label="Gölge rengi" value={piece.shadowColor} onChange={(v) => onPatch({ shadowColor: v }, k("sc"))} />
              <SliderField label="Yumuşaklık" min={0} max={30} value={piece.shadowBlur} onChange={(v) => onPatch({ shadowBlur: v }, k("sb"))} />
            </>
          ) : null}
        </Section>
      ) : null}
    </div>
  );
}

function TextSection({ piece, onPatch }: { piece: Piece; onPatch: (patch: Partial<Piece>, key?: string) => void }) {
  const [fontsOpen, setFontsOpen] = useState(false);
  const k = (field: string) => `${piece.id}:${field}`;
  const bold = piece.fontStyle.includes("bold");
  const italic = piece.fontStyle.includes("italic");
  const style = (b: boolean, i: boolean) => [b ? "bold" : "", i ? "italic" : ""].filter(Boolean).join(" ") || "normal";
  const current = studioFonts.find((font) => font.name === piece.fontFamily);

  return (
    <Section title="Metin">
      <textarea
        value={piece.text}
        onChange={(event) => onPatch({ text: event.target.value }, k("text"))}
        rows={2}
        aria-label="Metin içeriği"
        className="w-full resize-y rounded-control border border-input bg-card px-3 py-2 text-sm outline-none focus:border-foreground"
      />
      <div className="relative">
        <button
          type="button"
          onClick={() => setFontsOpen((v) => !v)}
          aria-expanded={fontsOpen}
          className="flex h-10 w-full items-center justify-between rounded-control border border-input bg-card px-3 text-left text-sm hover:border-foreground/50"
        >
          <span style={{ fontFamily: current?.family }}>{piece.fontFamily}</span>
          <ChevronDown size={16} className={cn("transition-transform", fontsOpen && "rotate-180")} />
        </button>
        {fontsOpen ? (
          <ul className="mt-1 max-h-72 overflow-y-auto rounded-control border border-border bg-card p-1 shadow-lg" role="listbox" aria-label="Font">
            {studioFonts.map((font, index) => (
              <li key={font.name}>
                {index === 0 || studioFonts[index - 1]?.category !== font.category ? (
                  <p className="px-2 pt-2 pb-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{font.category}</p>
                ) : null}
                <button
                  type="button"
                  role="option"
                  aria-selected={font.name === piece.fontFamily}
                  onClick={() => {
                    onPatch({ fontFamily: font.name });
                    setFontsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[8px] px-2 py-2 text-left text-lg hover:bg-muted",
                    font.name === piece.fontFamily && "bg-muted",
                  )}
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: font.family }}>
                    Ağ Şç
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1">
        <Toggle label="Kalın" pressed={bold} onClick={() => onPatch({ fontStyle: style(!bold, italic) })}>
          <Bold size={16} />
        </Toggle>
        <Toggle label="İtalik" pressed={italic} onClick={() => onPatch({ fontStyle: style(bold, !italic) })}>
          <Italic size={16} />
        </Toggle>
        <Toggle label="Altı çizili" pressed={piece.textDecoration === "underline"} onClick={() => onPatch({ textDecoration: piece.textDecoration === "underline" ? "" : "underline" })}>
          <Underline size={16} />
        </Toggle>
        <Toggle label="BÜYÜK HARF" pressed={piece.uppercase} onClick={() => onPatch({ uppercase: !piece.uppercase })}>
          <CaseUpper size={16} />
        </Toggle>
        <span className="mx-1 w-px self-stretch bg-border" />
        <Toggle label="Sola yasla" pressed={piece.align === "left"} onClick={() => onPatch({ align: "left" })}>
          <AlignLeft size={16} />
        </Toggle>
        <Toggle label="Ortala" pressed={piece.align === "center"} onClick={() => onPatch({ align: "center" })}>
          <AlignCenter size={16} />
        </Toggle>
        <Toggle label="Sağa yasla" pressed={piece.align === "right"} onClick={() => onPatch({ align: "right" })}>
          <AlignRight size={16} />
        </Toggle>
      </div>
      <SliderField label="Yazı boyutu" min={8} max={220} value={piece.fontSize} onChange={(v) => onPatch({ fontSize: v }, k("fs"))} unit=" pt" />
      <SliderField label="Harf aralığı" min={-5} max={30} value={piece.letterSpacing} onChange={(v) => onPatch({ letterSpacing: v }, k("ls"))} />
      <SliderField label="Satır aralığı" min={0.7} max={2.5} step={0.05} value={piece.lineHeight} onChange={(v) => onPatch({ lineHeight: v }, k("lh"))} />
      <SliderField
        label="Kavis"
        min={-100}
        max={100}
        value={piece.curve}
        onChange={(v) => onPatch({ curve: Math.abs(v) < 4 ? 0 : v }, k("curve"))}
        format={(v) => (v === 0 ? "Düz" : v > 0 ? `Yay ${v}` : `Ters ${-v}`)}
      />
      <ColorField label="Yazı rengi" value={piece.fill} onChange={(v) => onPatch({ fill: v }, k("fill"))} />
      <SliderField label="Kontur" min={0} max={12} step={0.5} value={piece.strokeWidth} onChange={(v) => onPatch({ strokeWidth: v }, k("sw"))} />
      {piece.strokeWidth > 0 ? <ColorField label="Kontur rengi" value={piece.stroke} onChange={(v) => onPatch({ stroke: v }, k("stroke"))} /> : null}
    </Section>
  );
}
