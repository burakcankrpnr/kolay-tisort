"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Group, Image as KonvaImage, Layer, Line, Path, Rect, Stage, Text, TextPath, Transformer } from "react-konva";
import type { Silhouette } from "@prisma/client";
import { garmentPaths } from "@/components/garment";
import { iconDataUrl } from "./assets";
import { fontFamilyFor } from "./fonts";
import { curvePath, PRINT, PRINT_HEIGHT_CM, PRINT_WIDTH_CM, PX_PER_CM, STAGE, type Piece, type ShapeType } from "./model";

export type CanvasHandle = {
  exportMockup: () => string | null;
  exportPrintFile: (dpi: number) => string | null;
  boxOf: (id: string) => { x: number; y: number; width: number; height: number } | null;
};

type Props = {
  pieces: Piece[];
  silhouette: Silhouette;
  garmentColor: string;
  side?: "front" | "back";
  selectedId: string | null;
  scale: number;
  showGrid: boolean;
  realistic: boolean;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<Piece>) => void;
  onPinch: (factor: number) => void;
};

const GARMENT_SCALE = 3;
const SNAP = 6;

/** Şekillerin yerel (0..w, 0..h) yol verisi; tümü Konva.Path ile çizilir. */
export function shapePath(shape: ShapeType, w: number, h: number, r: number) {
  switch (shape) {
    case "circle": {
      const rx = w / 2;
      const ry = h / 2;
      return `M0,${ry} A${rx},${ry} 0 1,0 ${w},${ry} A${rx},${ry} 0 1,0 0,${ry} Z`;
    }
    case "triangle":
      return `M${w / 2},0 L${w},${h} L0,${h} Z`;
    case "star": {
      const pts: string[] = [];
      for (let i = 0; i < 10; i += 1) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? 1 : 0.42;
        pts.push(`${(w / 2 + Math.cos(angle) * (w / 2) * rad).toFixed(1)},${(h / 2 + Math.sin(angle) * (h / 2) * rad).toFixed(1)}`);
      }
      return `M${pts.join(" L")} Z`;
    }
    case "heart":
      return `M${w / 2},${h} C${w * -0.1},${h * 0.55} ${w * 0.05},${h * -0.05} ${w / 2},${h * 0.22} C${w * 0.95},${h * -0.05} ${w * 1.1},${h * 0.55} ${w / 2},${h} Z`;
    case "badge": {
      const pts: string[] = [];
      for (let i = 0; i < 24; i += 1) {
        const angle = (Math.PI / 12) * i;
        const rad = i % 2 === 0 ? 1 : 0.88;
        pts.push(`${(w / 2 + Math.cos(angle) * (w / 2) * rad).toFixed(1)},${(h / 2 + Math.sin(angle) * (h / 2) * rad).toFixed(1)}`);
      }
      return `M${pts.join(" L")} Z`;
    }
    case "line":
    case "rect":
    default: {
      const rr = Math.min(r, w / 2, h / 2);
      if (rr <= 0) return `M0,0 H${w} V${h} H0 Z`;
      return `M${rr},0 H${w - rr} A${rr},${rr} 0 0 1 ${w},${rr} V${h - rr} A${rr},${rr} 0 0 1 ${w - rr},${h} H${rr} A${rr},${rr} 0 0 1 0,${h - rr} V${rr} A${rr},${rr} 0 0 1 ${rr},0 Z`;
    }
  }
}

function useHtmlImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) return;
    let alive = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => alive && setImage(img);
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return src ? image : null;
}

export const DesignCanvas = forwardRef<CanvasHandle, Props>(function DesignCanvas(
  { pieces, silhouette, garmentColor, side = "front", selectedId, scale, showGrid, realistic, onSelect, onChange, onPinch },
  ref,
) {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const chromeRef = useRef<Konva.Group>(null);
  const garmentRef = useRef<Konva.Group>(null);
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });
  const snapTargets = useRef<{ v: number[]; h: number[] }>({ v: [], h: [] });
  const pinch = useRef<number | null>(null);
  const prev = useRef<{ x?: number; y?: number } | null>(null);
  const selected = pieces.find((piece) => piece.id === selectedId) ?? null;

  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const node = selected && !selected.locked && !selected.hidden ? stage.findOne(`#${selected.id}`) : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selected, pieces]);

  useImperativeHandle(ref, () => ({
    boxOf(id) {
      const node = stageRef.current?.findOne(`#${id}`);
      const layer = layerRef.current;
      if (!node || !layer) return null;
      return node.getClientRect({ relativeTo: layer });
    },
    exportMockup() {
      const stage = stageRef.current;
      if (!stage) return null;
      trRef.current?.visible(false);
      chromeRef.current?.visible(false);
      const url = stage.toDataURL({ pixelRatio: 1.5 / scale, mimeType: "image/png" });
      trRef.current?.visible(true);
      chromeRef.current?.visible(true);
      return url;
    },
    exportPrintFile(dpi) {
      const stage = stageRef.current;
      if (!stage) return null;
      const targetPx = (PRINT_WIDTH_CM / 2.54) * dpi;
      trRef.current?.visible(false);
      chromeRef.current?.visible(false);
      garmentRef.current?.visible(false);
      const url = stage.toDataURL({
        x: PRINT.x * scale,
        y: PRINT.y * scale,
        width: PRINT.w * scale,
        height: PRINT.h * scale,
        pixelRatio: targetPx / (PRINT.w * scale),
        mimeType: "image/png",
      });
      trRef.current?.visible(true);
      chromeRef.current?.visible(true);
      garmentRef.current?.visible(true);
      return url;
    },
  }));

  function collectTargets(exceptId: string) {
    const layer = layerRef.current;
    const stage = stageRef.current;
    const v = [PRINT.x, PRINT.x + PRINT.w / 2, PRINT.x + PRINT.w];
    const h = [PRINT.y, PRINT.y + PRINT.h / 2, PRINT.y + PRINT.h];
    if (layer && stage) {
      for (const piece of pieces) {
        if (piece.id === exceptId || piece.hidden) continue;
        const node = stage.findOne(`#${piece.id}`);
        if (!node) continue;
        const b = node.getClientRect({ relativeTo: layer });
        v.push(b.x, b.x + b.width / 2, b.x + b.width);
        h.push(b.y, b.y + b.height / 2, b.y + b.height);
      }
    }
    snapTargets.current = { v, h };
  }

  function snap(node: Konva.Node) {
    const layer = layerRef.current;
    if (!layer) return;
    const box = node.getClientRect({ relativeTo: layer });
    const edgesX = [box.x, box.x + box.width / 2, box.x + box.width];
    const edgesY = [box.y, box.y + box.height / 2, box.y + box.height];
    let bestX: { d: number; t: number } | null = null;
    let bestY: { d: number; t: number } | null = null;
    for (const t of snapTargets.current.v) {
      for (const e of edgesX) {
        const d = t - e;
        if (Math.abs(d) < SNAP && (!bestX || Math.abs(d) < Math.abs(bestX.d))) bestX = { d, t };
      }
    }
    for (const t of snapTargets.current.h) {
      for (const e of edgesY) {
        const d = t - e;
        if (Math.abs(d) < SNAP && (!bestY || Math.abs(d) < Math.abs(bestY.d))) bestY = { d, t };
      }
    }
    if (bestX) node.x(node.x() + bestX.d);
    if (bestY) node.y(node.y() + bestY.d);
    const next = { v: bestX ? [bestX.t] : [], h: bestY ? [bestY.t] : [] };
    setGuides((prev) => (prev.v[0] === next.v[0] && prev.h[0] === next.h[0] ? prev : next));
    if ((bestX || bestY) && typeof navigator !== "undefined" && "vibrate" in navigator && (prev.current?.x !== bestX?.t || prev.current?.y !== bestY?.t)) {
      try {
        navigator.vibrate?.(8);
      } catch {
        // titreşim desteklenmiyor
      }
    }
    prev.current = { x: bestX?.t, y: bestY?.t };
  }
  const garmentPath = garmentPaths[silhouette];
  const ticksX = useMemo(() => Array.from({ length: Math.floor(PRINT_WIDTH_CM / 5) + 1 }, (_, i) => i * 5), []);
  const ticksY = useMemo(() => Array.from({ length: Math.floor(PRINT_HEIGHT_CM / 5) + 1 }, (_, i) => i * 5), []);
  const isLight = luminance(garmentColor) > 0.6;
  const chromeColor = isLight ? "rgba(17,17,17,0.45)" : "rgba(255,255,255,0.55)";

  return (
    <Stage
      ref={stageRef}
      width={STAGE.w * scale}
      height={STAGE.h * scale}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={(event) => {
        if (event.target === event.target.getStage() || event.target.name() === "bg") onSelect(null);
      }}
      onTouchStart={(event) => {
        if (event.target === event.target.getStage() || event.target.name() === "bg") onSelect(null);
      }}
      onTouchMove={(event) => {
        const touches = event.evt.touches;
        if (touches.length !== 2) return;
        event.evt.preventDefault();
        const [a, b] = [touches[0]!, touches[1]!];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (pinch.current) onPinch(dist / pinch.current);
        pinch.current = dist;
      }}
      onTouchEnd={() => {
        pinch.current = null;
      }}
    >
      <Layer ref={layerRef}>
        {/* Ürün */}
        <Group ref={garmentRef} listening={true}>
          <Rect name="bg" x={0} y={0} width={STAGE.w} height={STAGE.h} fill="rgba(0,0,0,0)" />
          <Path data={garmentPath} scaleX={GARMENT_SCALE} scaleY={GARMENT_SCALE} fill="#000" opacity={0.08} x={6} y={14} listening={false} />
          <Path
            name="bg"
            data={garmentPath}
            scaleX={GARMENT_SCALE}
            scaleY={GARMENT_SCALE}
            fill={garmentColor}
            stroke={isLight ? "rgba(17,17,17,0.25)" : "rgba(255,255,255,0.12)"}
            strokeWidth={0.5}
          />
          {side === "back" ? (
            <Group listening={false} scaleX={GARMENT_SCALE} scaleY={GARMENT_SCALE}>
              <Rect x={88} y={48} width={24} height={14} fill={isLight ? "rgba(17,17,17,0.12)" : "rgba(255,255,255,0.14)"} stroke={chromeColor} strokeWidth={0.4} />
              <Line points={[94, 52, 106, 52]} stroke={chromeColor} strokeWidth={0.5} />
              <Path
                data={silhouette === "HOODIE" ? "M78 42 C100 58 122 42 122 42" : "M82 40 C100 28 118 40 118 40"}
                stroke={chromeColor}
                strokeWidth={0.5}
                fillEnabled={false}
              />
            </Group>
          ) : null}
        </Group>

        {/* Baskı alanı, ızgara ve cetvel (dışa aktarımda gizlenir) */}
        <Group ref={chromeRef} listening={false} visible={!realistic}>
          <Rect x={PRINT.x} y={PRINT.y} width={PRINT.w} height={PRINT.h} stroke="#FF3B00" strokeWidth={1.2} dash={[7, 5]} />
          {showGrid
            ? [
                ...ticksX.slice(1, -1).map((cm) => (
                  <Line key={`gx${cm}`} points={[PRINT.x + cm * PX_PER_CM, PRINT.y, PRINT.x + cm * PX_PER_CM, PRINT.y + PRINT.h]} stroke={chromeColor} strokeWidth={0.5} dash={[2, 4]} />
                )),
                ...ticksY.slice(1, -1).map((cm) => (
                  <Line key={`gy${cm}`} points={[PRINT.x, PRINT.y + cm * PX_PER_CM, PRINT.x + PRINT.w, PRINT.y + cm * PX_PER_CM]} stroke={chromeColor} strokeWidth={0.5} dash={[2, 4]} />
                )),
                <Line key="cx" points={[PRINT.x + PRINT.w / 2, PRINT.y, PRINT.x + PRINT.w / 2, PRINT.y + PRINT.h]} stroke="#FF3B00" strokeWidth={0.6} opacity={0.6} />,
              ]
            : null}
          {ticksX.map((cm) => (
            <Line key={`tx${cm}`} points={[PRINT.x + cm * PX_PER_CM, PRINT.y - 8, PRINT.x + cm * PX_PER_CM, PRINT.y - (cm % 10 === 0 ? 14 : 11)]} stroke={chromeColor} strokeWidth={1} />
          ))}
          {ticksY.map((cm) => (
            <Line key={`ty${cm}`} points={[PRINT.x - 8, PRINT.y + cm * PX_PER_CM, PRINT.x - (cm % 10 === 0 ? 14 : 11), PRINT.y + cm * PX_PER_CM]} stroke={chromeColor} strokeWidth={1} />
          ))}
          <Text x={PRINT.x} y={PRINT.y - 30} width={PRINT.w} align="center" text={`${PRINT_WIDTH_CM} cm`} fontSize={11} fill={chromeColor} fontFamily="system-ui, sans-serif" />
          <Text x={PRINT.x - 34} y={PRINT.y + PRINT.h / 2 + 20} rotation={-90} text={`${PRINT_HEIGHT_CM} cm`} fontSize={11} fill={chromeColor} fontFamily="system-ui, sans-serif" />
        </Group>

        {/* Tasarım öğeleri */}
        {pieces.map((piece) => (
          <PieceNode
            key={piece.id}
            piece={piece}
            onSelect={() => onSelect(piece.id)}
            onChange={(patch) => onChange(piece.id, patch)}
            onDragStart={() => collectTargets(piece.id)}
            onDragMove={(node) => snap(node)}
            onDragEnd={() => setGuides({ v: [], h: [] })}
          />
        ))}

        {/* Baskı alanı dışı soluklaştırma (ürün rengiyle maske) */}
        <Group
          listening={false}
          clipFunc={() => {
            const clip = new Path2D();
            clip.addPath(new Path2D(garmentPath), new DOMMatrix().scale(GARMENT_SCALE));
            return [clip];
          }}
        >
          <Rect x={0} y={0} width={STAGE.w} height={PRINT.y} fill={garmentColor} opacity={0.72} />
          <Rect x={0} y={PRINT.y + PRINT.h} width={STAGE.w} height={STAGE.h - PRINT.y - PRINT.h} fill={garmentColor} opacity={0.72} />
          <Rect x={0} y={PRINT.y} width={PRINT.x} height={PRINT.h} fill={garmentColor} opacity={0.72} />
          <Rect x={PRINT.x + PRINT.w} y={PRINT.y} width={STAGE.w - PRINT.x - PRINT.w} height={PRINT.h} fill={garmentColor} opacity={0.72} />
        </Group>

        {/* Gerçekçi önizleme: kumaş gölgesi + ışık, baskıyı kumaşa oturtur */}
        {realistic ? (
          <Group listening={false}>
            <Path
              data={garmentPath}
              scaleX={GARMENT_SCALE}
              scaleY={GARMENT_SCALE}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 200, y: 230 }}
              fillLinearGradientColorStops={[0, "rgba(255,255,255,1)", 0.5, "rgba(235,235,235,1)", 1, "rgba(150,150,150,1)"]}
              globalCompositeOperation="multiply"
            />
            <Path
              data={garmentPath}
              scaleX={GARMENT_SCALE}
              scaleY={GARMENT_SCALE}
              fillRadialGradientStartPoint={{ x: 100, y: 80 }}
              fillRadialGradientEndPoint={{ x: 100, y: 80 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndRadius={120}
              fillRadialGradientColorStops={[0, "rgba(255,255,255,0.18)", 1, "rgba(255,255,255,0)"]}
              globalCompositeOperation="screen"
            />
            <Path data="M64 118 C84 128 116 110 136 122" scaleX={GARMENT_SCALE} scaleY={GARMENT_SCALE} stroke="rgba(0,0,0,0.07)" strokeWidth={6} />
          </Group>
        ) : null}

        {/* Hizalama kılavuzları */}
        {guides.v.map((x) => (
          <Line key={`gv${x}`} points={[x, 0, x, STAGE.h]} stroke="#EC4899" strokeWidth={1 / scale} dash={[4 / scale, 3 / scale]} listening={false} />
        ))}
        {guides.h.map((y) => (
          <Line key={`gh${y}`} points={[0, y, STAGE.w, y]} stroke="#EC4899" strokeWidth={1 / scale} dash={[4 / scale, 3 / scale]} listening={false} />
        ))}

        <Transformer
          ref={trRef}
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={6}
          anchorSize={10}
          anchorCornerRadius={5}
          anchorStroke="#FF3B00"
          anchorFill="#FFFFFF"
          borderStroke="#FF3B00"
          borderStrokeWidth={1.2}
          padding={4}
          keepRatio={selected?.kind !== "shape"}
          enabledAnchors={
            selected?.kind === "shape"
              ? ["top-left", "top-center", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-center", "bottom-right"]
              : ["top-left", "top-right", "bottom-left", "bottom-right"]
          }
          boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 8 || Math.abs(newBox.height) < 8 ? oldBox : newBox)}
        />
      </Layer>
    </Stage>
  );
});

function PieceNode({
  piece,
  onSelect,
  onChange,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  piece: Piece;
  onSelect: () => void;
  onChange: (patch: Partial<Piece>) => void;
  onDragStart: () => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: () => void;
}) {
  const iconSrc = piece.kind === "icon" ? iconDataUrl(piece.icon, piece.fill, piece.strokeWidth || 2, piece.iconFilled) : "";
  const image = useHtmlImage(piece.kind === "image" ? piece.src : iconSrc);
  const imageRef = useRef<Konva.Image>(null);

  const filtered = piece.kind === "image" && (piece.grayscale || piece.brightness !== 0 || piece.contrast !== 0);
  useEffect(() => {
    const node = imageRef.current;
    if (!node || !image) return;
    if (filtered) node.cache({ pixelRatio: 2 });
    else node.clearCache();
    node.getLayer()?.batchDraw();
  }, [image, filtered, piece.grayscale, piece.brightness, piece.contrast, piece.width, piece.height]);

  const flippable = piece.kind !== "text";
  const common = {
    id: piece.id,
    x: piece.x,
    y: piece.y,
    rotation: piece.rotation,
    scaleX: piece.scaleX * (flippable && piece.flipX ? -1 : 1),
    scaleY: piece.scaleY * (flippable && piece.flipY ? -1 : 1),
    offsetX: flippable && piece.flipX ? piece.width : 0,
    offsetY: flippable && piece.flipY ? piece.height : 0,
    opacity: piece.opacity,
    visible: !piece.hidden,
    draggable: !piece.locked,
    shadowEnabled: piece.shadow,
    shadowColor: piece.shadowColor,
    shadowBlur: piece.shadowBlur,
    shadowOffset: { x: 3, y: 3 },
    shadowOpacity: 0.9,
    onClick: onSelect,
    onTap: onSelect,
    onDragStart: () => {
      onSelect();
      onDragStart();
    },
    onDragMove: (event: Konva.KonvaEventObject<DragEvent>) => onDragMove(event.target),
    onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => {
      onDragEnd();
      onChange({ x: event.target.x(), y: event.target.y() });
    },
    onTransformEnd: (event: Konva.KonvaEventObject<Event>) => {
      const node = event.target;
      onChange({ x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: Math.abs(node.scaleX()), scaleY: Math.abs(node.scaleY()) });
    },
  };

  if (piece.kind === "text") {
    const text = piece.uppercase ? piece.text.toLocaleUpperCase("tr") : piece.text;
    const textProps = {
      text,
      fontSize: piece.fontSize,
      fontFamily: fontFamilyFor(piece.fontFamily),
      fontStyle: piece.fontStyle,
      textDecoration: piece.textDecoration,
      letterSpacing: piece.letterSpacing,
      fill: piece.fill,
      stroke: piece.strokeWidth > 0 ? piece.stroke : undefined,
      strokeWidth: piece.strokeWidth,
      fillAfterStrokeEnabled: true,
    };
    if (piece.curve !== 0) {
      const width = Math.max(80, measureText(text, textProps.fontFamily, piece.fontStyle, piece.fontSize) * 1.04 + piece.letterSpacing * text.length + 8);
      return <TextPath {...common} {...textProps} data={curvePath(width, piece.curve)} align="center" />;
    }
    return <Text {...common} {...textProps} lineHeight={piece.lineHeight} align={piece.align} />;
  }

  if (piece.kind === "shape") {
    return (
      <Path
        {...common}
        data={shapePath(piece.shape, piece.width, piece.height, piece.cornerRadius)}
        fill={piece.fill}
        stroke={piece.strokeWidth > 0 ? piece.stroke : undefined}
        strokeWidth={piece.strokeWidth}
        hitStrokeWidth={piece.shape === "line" ? 16 : undefined}
      />
    );
  }

  if (!image) return null;
  return (
    <KonvaImage
      ref={imageRef}
      {...common}
      image={image}
      width={piece.width}
      height={piece.height}
      filters={filtered ? [Konva.Filters.Grayscale, Konva.Filters.Brighten, Konva.Filters.Contrast].filter((f, i) => (i === 0 ? piece.grayscale : true)) : undefined}
      brightness={piece.brightness}
      contrast={piece.contrast}
    />
  );
}

let measureCtx: CanvasRenderingContext2D | null = null;
/** Kavisli yazı yolunun uzunluğu için metnin gerçek genişliği. */
export function measureText(text: string, family: string, style: string, size: number) {
  if (typeof document === "undefined") return text.length * size * 0.7;
  measureCtx ??= document.createElement("canvas").getContext("2d");
  if (!measureCtx) return text.length * size * 0.7;
  const weight = style.includes("bold") ? "700" : "400";
  const italic = style.includes("italic") ? "italic " : "";
  measureCtx.font = `${italic}${weight} ${size}px ${family}`;
  return measureCtx.measureText(text).width;
}

function luminance(hex: string) {
  const v = hex.replace("#", "");
  if (v.length !== 6) return 0;
  return (parseInt(v.slice(0, 2), 16) * 0.299 + parseInt(v.slice(2, 4), 16) * 0.587 + parseInt(v.slice(4, 6), 16) * 0.114) / 255;
}
