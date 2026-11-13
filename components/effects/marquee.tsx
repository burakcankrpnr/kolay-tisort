import { cn } from "@/lib/utils";

/** Saf CSS kayan şerit. Hareket yalnızca html[data-fx-marquee="on"] iken. */
export function Marquee({
  items,
  reverse = false,
  className,
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
}) {
  const track = (hidden: boolean) => (
    <ul className="marquee__track" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap">
          <span>{item}</span>
          <span aria-hidden="true" className="text-primary">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("marquee", className)} data-reverse={reverse || undefined}>
      {track(false)}
      {track(true)}
    </div>
  );
}
