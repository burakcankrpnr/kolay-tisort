"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import {
  effectNames,
  isEffectEnabled,
  type EffectLevel,
  type EffectName,
  type Effects,
} from "@/lib/settings-schema";

type Env = { reduced: boolean; lowPower: boolean; coarse: boolean; mobile: boolean; ready: boolean };
type FxContext = { enabled: Record<EffectName, boolean>; level: EffectLevel; env: Env };

const ssrEnv: Env = { reduced: false, lowPower: false, coarse: false, mobile: false, ready: false };
const allOff = Object.fromEntries(effectNames.map((name) => [name, false])) as Record<EffectName, boolean>;
const Context = createContext<FxContext>({ enabled: allOff, level: "off", env: ssrEnv });

/** Sunucuda ve hidrasyondan önce tüm efektler kapalıdır → içerik hep görünür başlar. */
export function useFx(name: EffectName) {
  return useContext(Context).enabled[name];
}

export function useFxContext() {
  return useContext(Context);
}

const CustomCursor = dynamic(() => import("./custom-cursor").then((m) => m.CustomCursor), { ssr: false });

/** Efektlerin HTML öznitelik adları (globals.css bunlara bakar). */
// kineticTitle burada yok: sunucuda basılır ve hidrasyondan sonra değiştirilmez
// (değişirse animasyon yeniden oynayıp titreme yaratırdı).
const attrs: Partial<Record<EffectName, string>> = {
  scrollReveal: "reveal",
  marquee: "marquee",
  meshGradient: "mesh",
  grain: "grain",
  spotlight: "spotlight",
  heroParallax: "parallax",
  pageTransitions: "pages",
};

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  deviceMemory?: number;
};

function readEnv(): Env {
  const nav = navigator as NavigatorWithHints;
  const slowNet = nav.connection?.saveData || /(^|-)2g|3g/.test(nav.connection?.effectiveType ?? "");
  const weakDevice = (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2;
  return {
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    lowPower: Boolean(slowNet || weakDevice),
    coarse: matchMedia("(hover: none), (pointer: coarse)").matches,
    mobile: matchMedia("(max-width: 767px)").matches,
    ready: true,
  };
}

/** Ağır efektler: zayıf cihaz/yavaş bağlantıda kapanır. */
const heavy: EffectName[] = ["meshGradient", "heroParallax", "customCursor", "pageTransitions", "grain"];
/** Sadece ince işaretçili (fare) cihazlarda anlamlı olanlar. */
const pointerOnly: EffectName[] = ["tiltCard", "magnetic", "customCursor", "spotlight"];

export function EffectsProvider({ effects, children }: { effects: Effects; children: ReactNode }) {
  const [env, setEnv] = useState<Env>(ssrEnv);

  useEffect(() => {
    const update = () => setEnv(readEnv());
    update();
    const queries = ["(prefers-reduced-motion: reduce)", "(max-width: 767px)", "(hover: none), (pointer: coarse)"].map(
      (q) => matchMedia(q),
    );
    queries.forEach((q) => q.addEventListener("change", update));
    return () => queries.forEach((q) => q.removeEventListener("change", update));
  }, []);

  const value = useMemo<FxContext>(() => {
    if (!env.ready) return { enabled: allOff, level: "off", env };
    let level: EffectLevel = env.mobile && effects.mobileLevel !== "inherit" ? effects.mobileLevel : effects.level;
    if (env.reduced) level = "off";
    const enabled = Object.fromEntries(
      effectNames.map((name) => {
        let on = isEffectEnabled(effects, name, level);
        if (env.reduced && name !== "confetti") on = false;
        if (env.lowPower && heavy.includes(name)) on = false;
        if (env.coarse && pointerOnly.includes(name)) on = false;
        return [name, on];
      }),
    ) as Record<EffectName, boolean>;
    return { enabled, level, env };
  }, [effects, env]);

  // html[data-fx-*] özniteliklerini senkronla
  useEffect(() => {
    const root = document.documentElement;
    for (const [name, attr] of Object.entries(attrs) as [EffectName, string][]) {
      root.setAttribute(`data-fx-${attr}`, value.enabled[name] ? "on" : "off");
    }
    root.dataset.fxLevel = value.level;
  }, [value]);

  useRevealObserver(value.enabled.scrollReveal);
  usePointerEffects(value.enabled);

  return (
    <Context.Provider value={value}>
      {children}
      {value.enabled.customCursor ? <CustomCursor /> : null}
    </Context.Provider>
  );
}

/**
 * Tek bir IntersectionObserver ile tüm [data-reveal] öğelerini izler.
 * Bir kez görünür olan tekrar animasyon oynatmaz (once: true).
 */
function useRevealObserver(on: boolean) {
  useEffect(() => {
    const reveal = (el: Element) => el.setAttribute("data-revealed", "");
    if (!on) {
      document.querySelectorAll("[data-reveal]").forEach(reveal);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = (root: ParentNode, initial = false) => {
      root.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => {
        // İlk taramada ekranda ya da üstünde olan öğeler animasyonsuz görünür kalır
        // (görünen içerik asla gizlenip yeniden gelmez). Sadece ekran altı öğeler canlanır.
        if (initial && el.getBoundingClientRect().top < innerHeight) reveal(el);
        else io.observe(el);
      });
    };
    scan(document, true);
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.matches("[data-reveal]:not([data-revealed])")) io.observe(node);
            scan(node);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [on]);
}

/**
 * Spotlight, 3D tilt ve magnetic buton için tek, olay-delegasyonlu dinleyici.
 * requestAnimationFrame ile kısılır; sadece transform/CSS değişkeni yazar.
 */
function usePointerEffects(enabled: Record<EffectName, boolean>) {
  const { spotlight, tiltCard, magnetic } = enabled;
  useEffect(() => {
    if (!spotlight && !tiltCard && !magnetic) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    let tilted: HTMLElement | null = null;
    let pulled: HTMLElement | null = null;

    const resetTilt = () => {
      if (tilted) {
        tilted.style.setProperty("--rx", "0deg");
        tilted.style.setProperty("--ry", "0deg");
        tilted = null;
      }
    };
    const resetPull = () => {
      if (pulled) {
        pulled.style.transform = "";
        pulled = null;
      }
    };

    const run = () => {
      frame = 0;
      const event = last;
      if (!event || !(event.target instanceof Element)) return;
      const surface = event.target.closest<HTMLElement>(".fx-card, .fx-spot, .btn-fill");
      if (surface) {
        const rect = surface.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        surface.style.setProperty("--mx", `${x}px`);
        surface.style.setProperty("--my", `${y}px`);
        surface.style.setProperty("--bx", `${x}px`);
        surface.style.setProperty("--by", `${y}px`);
        if (tiltCard && surface.matches("[data-tilt]")) {
          if (tilted !== surface) resetTilt();
          tilted = surface;
          const px = x / rect.width - 0.5;
          const py = y / rect.height - 0.5;
          surface.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
          surface.style.setProperty("--ry", `${(px * 6).toFixed(2)}deg`);
        }
      } else {
        resetTilt();
      }
      const magnet = magnetic ? event.target.closest<HTMLElement>("[data-magnetic]") : null;
      if (magnet) {
        if (pulled !== magnet) resetPull();
        pulled = magnet;
        const rect = magnet.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        magnet.style.transform = `translate(${(dx * 0.18).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px)`;
      } else {
        resetPull();
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      last = event;
      if (!frame) frame = requestAnimationFrame(run);
    };
    const onLeave = () => {
      resetTilt();
      resetPull();
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, [spotlight, tiltCard, magnetic]);
}
