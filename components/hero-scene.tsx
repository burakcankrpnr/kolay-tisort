"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Silhouette } from "@prisma/client";
import { Garment } from "@/components/garment";
import { useFx } from "@/components/effects/effects-provider";

type Swatch = { name: string; hex: string };

/**
 * Hero ürün sahnesi: renk noktasına tıklayınca kumaş rengi circular-reveal ile dolar,
 * fare hareketine göre hafif parallax + ışık kayar (yalnızca Şov + masaüstü).
 * Hareketsiz hâlde de tam ve şık görünür.
 */
export function HeroScene({ swatches, kinds }: { swatches: Swatch[]; kinds: Silhouette[] }) {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [kindIndex, setKindIndex] = useState(0);
  const parallax = useFx("heroParallax");
  const stage = useRef<HTMLDivElement>(null);
  const current = swatches[index] ?? { name: "Siyah", hex: "#161616" };
  const kind = kinds[kindIndex] ?? "TEE";

  useEffect(() => {
    const el = stage.current;
    if (!parallax || !el) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const px = event.clientX / innerWidth - 0.5;
        const py = event.clientY / innerHeight - 0.5;
        el.style.setProperty("--px", px.toFixed(3));
        el.style.setProperty("--py", py.toFixed(3));
      });
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [parallax]);

  function pick(next: number) {
    if (next === index) return;
    setPrevious(index);
    setIndex(next);
  }

  return (
    <div className="relative">
      <div
        ref={stage}
        className="relative mx-auto aspect-square w-full max-w-[520px]"
        style={{ "--px": 0, "--py": 0 } as CSSProperties}
      >
        {/* arka disk + ışık */}
        <div
          aria-hidden="true"
          className="absolute inset-[6%] rounded-full bg-gradient-to-b from-card to-muted shadow-[inset_0_-30px_60px_-30px_hsl(var(--foreground)/0.15)] transition-transform duration-700"
          style={{ transform: "translate3d(calc(var(--px) * -18px), calc(var(--py) * -18px), 0)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-70 transition-transform duration-700"
          style={{
            background: "radial-gradient(40% 40% at calc(50% + var(--px) * 40%) calc(35% + var(--py) * 40%), hsl(0 0% 100% / 0.55), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-[10%] transition-transform duration-500 ease-out"
          style={{ transform: "translate3d(calc(var(--px) * 26px), calc(var(--py) * 20px), 0) rotate(calc(var(--px) * 3deg))" }}
        >
          <div className="float-soft relative size-full">
            {previous !== null ? (
              <Garment kind={kind} color={swatches[previous]?.hex ?? current.hex} className="absolute inset-0 size-full drop-shadow-2xl" />
            ) : null}
            <Garment
              key={`${kind}-${index}`}
              kind={kind}
              color={current.hex}
              className={`absolute inset-0 size-full drop-shadow-2xl ${previous !== null ? "color-reveal" : ""}`}
            />
          </div>
        </div>
        {/* yüzen etiketler */}
        <div className="absolute top-[12%] left-0 hidden rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur sm:block">
          DTF · 300 DPI
        </div>
        <div className="absolute right-0 bottom-[16%] hidden rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur sm:block">
          {current.name} · {kind === "HOODIE" ? "Hoodie" : kind === "SWEAT" ? "Sweatshirt" : "Oversize tişört"}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <div role="radiogroup" aria-label="Ürün rengi" className="flex items-center gap-2">
          {swatches.map((swatch, i) => (
            <button
              key={swatch.hex + swatch.name}
              type="button"
              role="radio"
              aria-checked={i === index}
              aria-label={swatch.name}
              onClick={() => pick(i)}
              className="grid size-9 place-items-center rounded-full transition-transform hover:scale-110"
            >
              <span
                className={`block size-6 rounded-full border border-foreground/20 ring-offset-2 ring-offset-background transition-shadow ${i === index ? "ring-2 ring-foreground" : ""}`}
                style={{ background: swatch.hex }}
              />
            </button>
          ))}
        </div>
        {kinds.length > 1 ? (
          <div role="radiogroup" aria-label="Ürün tipi" className="flex rounded-full border border-border p-1 text-xs font-medium">
            {kinds.map((item, i) => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={i === kindIndex}
                onClick={() => {
                  setPrevious(null);
                  setKindIndex(i);
                }}
                className={`h-8 rounded-full px-3 transition-colors ${i === kindIndex ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground"}`}
              >
                {item === "HOODIE" ? "Hoodie" : item === "SWEAT" ? "Sweat" : "Tişört"}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
