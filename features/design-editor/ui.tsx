"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { swatchPalette } from "./assets";

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="border-b border-border px-4 py-4 last:border-b-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{title}</h3>
        {aside}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={id} className="text-muted-foreground">
          {label}
        </label>
        <span className="font-medium tabular-nums">
          {format ? format(value) : value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="studio-range h-5 w-full"
      />
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  step = 0.1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  suffix?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex h-9 items-center gap-1.5 rounded-control border border-input bg-card px-2 text-xs focus-within:border-foreground">
      <span className="w-4 shrink-0 font-semibold text-muted-foreground">{label}</span>
      <input
        id={id}
        type="number"
        step={step}
        value={Number.isFinite(value) ? Number(value.toFixed(2)) : 0}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        className="w-full min-w-0 bg-transparent tabular-nums outline-none"
      />
      {suffix ? <span className="text-muted-foreground">{suffix}</span> : null}
    </label>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <label htmlFor={id} className="flex cursor-pointer items-center gap-2 rounded-control border border-input bg-card px-2 py-1 font-mono text-[11px] uppercase">
          <span className="size-4 rounded-full border border-border" style={{ background: value }} />
          {value}
          <input id={id} type="color" value={value} onChange={(event) => onChange(event.target.value.toUpperCase())} className="sr-only" />
        </label>
      </div>
      <div className="grid grid-cols-8 gap-1.5" role="radiogroup" aria-label={label}>
        {swatchPalette.map((hex) => (
          <button
            key={hex}
            type="button"
            role="radio"
            aria-checked={value.toUpperCase() === hex}
            aria-label={hex}
            onClick={() => onChange(hex)}
            className={cn(
              "aspect-square rounded-full border border-foreground/15 transition-transform hover:scale-110",
              value.toUpperCase() === hex && "ring-2 ring-primary ring-offset-2 ring-offset-card",
            )}
            style={{ background: hex }}
          />
        ))}
      </div>
    </div>
  );
}

export function Toggle({
  pressed,
  onClick,
  label,
  children,
  disabled,
}: {
  pressed?: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid h-9 min-w-9 place-items-center rounded-control border px-2 text-sm transition-colors disabled:opacity-30",
        pressed ? "border-foreground bg-foreground text-background" : "border-input bg-card hover:border-foreground/50",
      )}
    >
      {children}
    </button>
  );
}

export function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-10 rounded-full transition-colors", checked ? "bg-primary" : "bg-input")}
      >
        <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-4")} />
      </button>
    </label>
  );
}

export function IconButton({
  label,
  onClick,
  children,
  disabled,
  className,
  active,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-control transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30",
        active && "bg-foreground text-background hover:bg-foreground/90",
        className,
      )}
    >
      {children}
    </button>
  );
}
