"use client";

import type { ReactNode } from "react";
import type { EffectName } from "@/lib/settings-schema";
import { useFx } from "./effects-provider";

/**
 * Ayara bağlı efekt sarmalayıcısı: efekt kapalıysa (panel, reduced-motion, zayıf cihaz)
 * yalnızca `fallback` render edilir ve efektin kodu hiç yüklenmez (children dinamik
 * import edilmiş bir bileşen olmalı).
 */
export function Effect({ name, fallback = null, children }: { name: EffectName; fallback?: ReactNode; children: ReactNode }) {
  return useFx(name) ? children : fallback;
}
