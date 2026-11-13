import type { CSSProperties, ElementType } from "react";

/**
 * Kelime kelime maskeden yukarı kayan başlık. Sunucu bileşeni: metin HTML'de tam
 * durur, animasyon yalnızca html[data-fx-kinetic="on"] iken CSS ile oynar.
 * LCP için güvenli: opaklık hiç 0'a düşmez, sadece transform.
 */
export function KineticTitle({
  text,
  as: Tag = "h1",
  className,
}: {
  text: string;
  as?: ElementType;
  className?: string;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="kinetic-word" style={{ "--i": index } as CSSProperties}>
            <span>{word}</span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
