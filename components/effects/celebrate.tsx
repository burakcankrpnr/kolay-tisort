"use client";

import { useEffect } from "react";
import { useFx } from "./effects-provider";

/** Bir kez konfeti patlatır (sipariş tamamlandı vb.). Konfeti modülü yalnızca bu an yüklenir. */
export function Celebrate({ once }: { once?: string }) {
  const on = useFx("confetti");
  useEffect(() => {
    if (!on) return;
    const key = once ? `celebrated:${once}` : null;
    try {
      if (key && sessionStorage.getItem(key)) return;
      if (key) sessionStorage.setItem(key, "1");
    } catch {
      // depolama kapalıysa yine de kutla
    }
    const timer = setTimeout(() => import("./confetti").then((m) => m.burst()), 250);
    return () => clearTimeout(timer);
  }, [on, once]);
  return null;
}
