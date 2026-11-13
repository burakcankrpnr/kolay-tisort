"use client";

import { useEffect, useRef, useState } from "react";
import { useFx } from "./effects-provider";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Görünür olunca sayarak artan değer. Sunucu HTML'inde son değer yazılıdır (SEO);
 * tabular-nums ile genişlik sabit kalır (CLS yok). Zaten ekrandaysa saymaz.
 */
export function CountUp({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const on = useFx("counters");
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const format = (n: number) =>
    new Intl.NumberFormat("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

  useEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < innerHeight && rect.bottom > 0) return;
    let frame = 0;
    let started = false;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || started) return;
      started = true;
      io.disconnect();
      const begin = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - begin) / 1400);
        setShown(value * easeOut(t));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    // Ekran dışındayken başlangıç değerine al; görünür olunca say.
    frame = requestAnimationFrame(() => {
      setShown(0);
      io.observe(el);
    });
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [on, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {format(shown)}
      {suffix}
    </span>
  );
}
