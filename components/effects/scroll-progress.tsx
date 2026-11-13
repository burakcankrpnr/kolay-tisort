"use client";

import { useEffect, useRef } from "react";
import { useFx } from "./effects-provider";

/** Üstte ince, marka renginde okuma ilerlemesi (blog / uzun sayfalar). */
export function ScrollProgress() {
  const on = useFx("scrollProgress");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!on) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      ref.current?.style.setProperty("transform", `scaleX(${max > 0 ? scrollY / max : 0})`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [on]);

  if (!on) return null;
  return (
    <div ref={ref} aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left scale-x-0 bg-primary" />
  );
}
