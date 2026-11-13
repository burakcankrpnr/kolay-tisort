"use client";

import { useEffect, useRef } from "react";

/**
 * Şov seviyesinde, fare kullanan masaüstü için halka imleç.
 * Sistem imleci gizlenmez (erişilebilirlik); halka [data-cursor="Gör"] gibi etiketleri gösterir.
 * Metin/form alanlarında gizlenir.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let frame = 0;
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      frame = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      const target = event.target instanceof Element ? event.target : null;
      const textual = target?.closest("input, textarea, select, [contenteditable], canvas");
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (textual) el.setAttribute("data-hidden", "");
      else el.removeAttribute("data-hidden");
      const label = labelled?.dataset.cursor;
      if (label) {
        el.setAttribute("data-label", label);
        el.textContent = label;
      } else {
        el.removeAttribute("data-label");
        el.textContent = "";
      }
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const onLeave = () => el.setAttribute("data-hidden", "");
    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <div ref={ref} className="fx-cursor" data-hidden="" aria-hidden="true" />;
}
