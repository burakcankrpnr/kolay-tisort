import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * Ekrana girince fade-up + hafif ölçek. Tek global observer (EffectsProvider) yönetir.
 * `stagger` ile liste öğeleri 70 ms arayla gelir. JS yoksa içerik zaten görünür.
 */
export function Reveal({
  as: Tag = "div",
  stagger = 0,
  className,
  children,
}: {
  as?: ElementType;
  stagger?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag data-reveal="" className={className} style={{ "--stagger": stagger } as CSSProperties}>
      {children}
    </Tag>
  );
}
