import Konva from "konva";
import { iconDataUrl } from "./assets";
import { measureText, shapePath } from "./canvas";
import { ensureFont, fontFamilyFor } from "./fonts";
import { curvePath, printArea, printSizeCm, type Piece, type Side } from "./model";

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) return resolve(null);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Bir yüzün baskı alanını, ekrandaki tuvalden bağımsız görünmez bir sahnede
 * çizip şeffaf PNG olarak döndürür. Ürün, kılavuz ve maske yoktur; yalnızca baskı.
 */
export async function renderPrintFile(pieces: Piece[], dpi = 300, side: Side = "front"): Promise<Blob | null> {
  const visible = pieces.filter((piece) => !piece.hidden);
  if (!visible.length) return null;
  await Promise.all(visible.filter((p) => p.kind === "text").map((p) => ensureFont(p.fontFamily, p.fontStyle)));

  const area = printArea(side);
  const sizeCm = printSizeCm(side);
  const container = document.createElement("div");
  const stage = new Konva.Stage({ container, width: area.w, height: area.h });
  const layer = new Konva.Layer();
  stage.add(layer);

  for (const piece of visible) {
    const flippable = piece.kind !== "text";
    const common: Konva.NodeConfig = {
      x: piece.x - area.x,
      y: piece.y - area.y,
      rotation: piece.rotation,
      scaleX: piece.scaleX * (flippable && piece.flipX ? -1 : 1),
      scaleY: piece.scaleY * (flippable && piece.flipY ? -1 : 1),
      offsetX: flippable && piece.flipX ? piece.width : 0,
      offsetY: flippable && piece.flipY ? piece.height : 0,
      opacity: piece.opacity,
    };
    const shadow = piece.shadow
      ? { shadowEnabled: true, shadowColor: piece.shadowColor, shadowBlur: piece.shadowBlur, shadowOffset: { x: 3, y: 3 }, shadowOpacity: 0.9 }
      : {};

    if (piece.kind === "text") {
      const text = piece.uppercase ? piece.text.toLocaleUpperCase("tr") : piece.text;
      const family = fontFamilyFor(piece.fontFamily);
      const textProps = {
        ...common,
        ...shadow,
        text,
        fontSize: piece.fontSize,
        fontFamily: family,
        fontStyle: piece.fontStyle,
        textDecoration: piece.textDecoration,
        letterSpacing: piece.letterSpacing,
        fill: piece.fill,
        stroke: piece.strokeWidth > 0 ? piece.stroke : undefined,
        strokeWidth: piece.strokeWidth,
        fillAfterStrokeEnabled: true,
      };
      if (piece.curve !== 0) {
        const width = Math.max(80, measureText(text, family, piece.fontStyle, piece.fontSize) * 1.04 + piece.letterSpacing * text.length + 8);
        layer.add(new Konva.TextPath({ ...textProps, data: curvePath(width, piece.curve), align: "center" }));
      } else {
        layer.add(new Konva.Text({ ...textProps, lineHeight: piece.lineHeight, align: piece.align }));
      }
      continue;
    }

    if (piece.kind === "shape") {
      layer.add(
        new Konva.Path({
          ...common,
          ...shadow,
          data: shapePath(piece.shape, piece.width, piece.height, piece.cornerRadius),
          fill: piece.fill,
          stroke: piece.strokeWidth > 0 ? piece.stroke : undefined,
          strokeWidth: piece.strokeWidth,
        }),
      );
      continue;
    }

    const src = piece.kind === "icon" ? iconDataUrl(piece.icon, piece.fill, piece.strokeWidth || 2, piece.iconFilled) : piece.src;
    const image = await loadImage(src);
    if (!image) continue;
    const node = new Konva.Image({ ...common, ...shadow, image, width: piece.width, height: piece.height });
    const filtered = piece.kind === "image" && (piece.grayscale || piece.brightness !== 0 || piece.contrast !== 0);
    if (filtered) {
      node.cache({ pixelRatio: Math.min(8, dpi / 50) });
      node.filters([...(piece.grayscale ? [Konva.Filters.Grayscale] : []), Konva.Filters.Brighten, Konva.Filters.Contrast]);
      node.brightness(piece.brightness);
      node.contrast(piece.contrast);
    }
    layer.add(node);
  }

  layer.draw();
  const targetPx = (sizeCm.widthCm / 2.54) * dpi;
  const blob = await new Promise<Blob | null>((resolve) => {
    stage.toBlob({ pixelRatio: targetPx / area.w, mimeType: "image/png", callback: (b) => resolve(b as Blob | null) });
  });
  stage.destroy();
  return blob;
}

/** Blob / data URL'i /api/uploads'a yükler ve herkese açık yolunu döndürür. */
export async function uploadBlob(blob: Blob, name: string): Promise<string | null> {
  const body = new FormData();
  body.set("file", new File([blob], name, { type: blob.type || "image/png" }));
  const response = await fetch("/api/uploads", { method: "POST", body });
  const payload = (await response.json().catch(() => ({}))) as { url?: string };
  return payload.url ?? null;
}

export async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl);
  return response.blob();
}
