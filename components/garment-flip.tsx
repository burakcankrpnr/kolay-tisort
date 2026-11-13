"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Side = "front" | "back";

/**
 * Ön ↔ arka geçişinde kıyafeti Y ekseninde çevirir.
 * Dış kutu overflow:clip ile yatay scroll üretmez.
 * prefers-reduced-motion açıksa anında geçer.
 */
export function GarmentFlip({
  side,
  className,
  children,
}: {
  side: Side;
  className?: string;
  children: (visible: Side) => ReactNode;
}) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(side);
  const [angle, setAngle] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const target = useRef<Side | null>(null);

  useEffect(() => {
    if (side === visible && phase === "idle") return;
    if (reduce) {
      target.current = null;
      setPhase("idle");
      setAngle(0);
      setVisible(side);
      return;
    }
    if (phase !== "idle" && target.current === side) return;
    target.current = side;
    setPhase("out");
    setAngle(88);
  }, [side, visible, phase, reduce]);

  return (
    <div
      className={cn(
        "relative overflow-clip [contain:paint] [perspective:900px]",
        phase !== "idle" && "overflow-clip",
        className,
      )}
    >
      <div
        className="relative origin-center will-change-transform"
        style={{
          transform: `rotateY(${angle}deg) scale(${phase === "out" ? 0.92 : 1})`,
          transition: phase === "idle" ? "none" : "transform 0.28s cubic-bezier(0.4, 0.02, 0.2, 1)",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
        onTransitionEnd={(event) => {
          if (event.propertyName !== "transform") return;
          if (phase === "out" && target.current) {
            setVisible(target.current);
            setPhase("idle");
            setAngle(-88);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setPhase("in");
                setAngle(0);
              });
            });
            return;
          }
          if (phase === "in") {
            target.current = null;
            setPhase("idle");
          }
        }}
      >
        {children(visible)}
      </div>
    </div>
  );
}
