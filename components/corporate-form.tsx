"use client";

import { useState, useTransition } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { printFees, quantityTierPercent } from "@/lib/pricing";
import { formatTrPhone } from "@/lib/tr-cities";
import { textareaClass } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { submitCorporate } from "@/server/actions/marketplace";
import { formatTry } from "@/utils/money";

type ProductOption = { slug: string; name: string; basePrice: number };

const steps = ["Firma", "Ürün ve adet", "Detaylar"];

export function CorporateForm({ products }: { products: ProductOption[] }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ total: number; percent: number } | null>(null);
  const [pending, start] = useTransition();
  const [phone, setPhone] = useState("");
  const [productSlug, setProductSlug] = useState(products[0]?.slug ?? "");
  const [printSide, setPrintSide] = useState<"FRONT" | "BOTH" | "NONE">("FRONT");
  const [quantity, setQuantity] = useState(50);

  const product = products.find((item) => item.slug === productSlug);
  const unit = (product?.basePrice ?? 0) + (printSide === "BOTH" ? printFees.BOTH : printSide === "NONE" ? 0 : printFees.FRONT);
  const pct = quantityTierPercent(quantity);
  const estimate = Math.round(unit * quantity * (1 - pct / 100));

  function next() {
    const section = document.getElementById(`kurumsal-adim-${step}`);
    const invalid = section?.querySelector<HTMLInputElement>("input:invalid, select:invalid, textarea:invalid");
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    setStep((s) => Math.min(2, s + 1));
  }

  if (result) {
    return (
      <div className="toast-in rounded-card border border-border bg-card p-8 text-center">
        <svg viewBox="0 0 64 64" className="mx-auto size-16 text-success" aria-hidden="true">
          <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="3" className="draw-circle" />
          <path d="M19 33 L28 42 L46 23" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="draw-check" />
        </svg>
        <h3 className="mt-4 font-display text-2xl">Teklif talebin alındı</h3>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
          Ön hesaplama: <strong className="text-foreground">{formatTry(result.total)}</strong>
          {result.percent ? ` (%${result.percent} toplu indirim dahil)` : ""}. Ekibimiz baskı detaylarını netleştirmek için seninle iletişime geçecek.
        </p>
      </div>
    );
  }

  return (
    <form
      className="rounded-card border border-border bg-card p-5 sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        if (step < 2) {
          next();
          return;
        }
        const data = new FormData(event.currentTarget);
        data.set("phone", phone.replace(/\s/g, ""));
        data.set("productSlug", productSlug);
        data.set("printSide", printSide);
        data.set("quantity", String(quantity));
        start(async () => {
          const response = await submitCorporate(data);
          if (!response.ok) {
            setError(response.error);
            return;
          }
          setError(null);
          setResult({ total: response.total, percent: response.percent });
        });
      }}
    >
      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Form adımları">
        {steps.map((label, index) => (
          <li key={label} className="flex flex-col gap-2">
            <span className={cn("h-1 rounded-full transition-colors duration-500", index <= step ? "bg-foreground" : "bg-border")} />
            <span className={cn("flex items-center gap-1.5 text-xs font-medium", index === step ? "text-foreground" : "text-muted-foreground")}>
              {index < step ? <Check size={12} /> : <span className="tabular-nums">{index + 1}.</span>} {label}
            </span>
          </li>
        ))}
      </ol>

      <div key={step} className="toast-in">
        <div id="kurumsal-adim-0" className={step === 0 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
          <div className="sm:col-span-2">
            <Label htmlFor="company">Firma / kurum adı</Label>
            <Input id="company" name="company" required minLength={2} autoComplete="organization" />
          </div>
          <div>
            <Label htmlFor="contactName">Yetkili</Label>
            <Input id="contactName" name="contactName" required minLength={2} autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="corp-phone">Telefon</Label>
            <Input id="corp-phone" type="tel" required placeholder="05xx xxx xx xx" pattern="0\d{3} \d{3} \d{2} \d{2}" value={phone} onChange={(e) => setPhone(formatTrPhone(e.target.value))} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
        </div>

        <div id="kurumsal-adim-1" className={step === 1 ? "grid gap-5" : "hidden"}>
          <div>
            <Label htmlFor="product">Ürün</Label>
            <select
              id="product"
              value={productSlug}
              onChange={(event) => setProductSlug(event.target.value)}
              className="h-12 w-full rounded-control border border-input bg-card px-4 text-[15px] outline-none focus:border-foreground"
            >
              {products.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name} — {formatTry(item.basePrice)}
                </option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Baskı</legend>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["FRONT", "Tek yüz"],
                  ["BOTH", "Ön + arka"],
                  ["NONE", "Baskısız"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={printSide === id}
                  onClick={() => setPrintSide(id)}
                  className={cn("h-11 rounded-control border text-sm font-medium", printSide === id ? "border-foreground bg-foreground text-background" : "border-input hover:border-foreground/50")}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="quantity">Adet</Label>
              <span className="mb-1.5 text-sm font-semibold tabular-nums">{quantity}</span>
            </div>
            <input id="quantity" type="range" min={10} max={500} step={5} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="studio-range h-6 w-full" />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>10</span>
              <span>500</span>
            </div>
          </div>
          <div className="rounded-control bg-muted/60 p-4 text-sm">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Birim</span>
              <span className="tabular-nums">{formatTry(unit)}</span>
            </p>
            {pct ? (
              <p className="mt-1 flex justify-between text-success">
                <span>Toplu indirim</span>
                <span>%{pct}</span>
              </p>
            ) : null}
            <p className="mt-2 flex items-baseline justify-between border-t border-border pt-2">
              <span className="font-semibold">Tahmini toplam</span>
              <span key={estimate} className="price-tick font-display text-2xl font-bold tabular-nums">
                {formatTry(estimate)}
              </span>
            </p>
          </div>
        </div>

        <div id="kurumsal-adim-2" className={step === 2 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
          <div>
            <Label htmlFor="printType">Baskı tekniği</Label>
            <select id="printType" name="printType" defaultValue="DTF" className="h-12 w-full rounded-control border border-input bg-card px-4 text-[15px] outline-none focus:border-foreground">
              <option value="DTF">DTF</option>
              <option value="Nakış">Nakış (teklif)</option>
              <option value="Karar verilmedi">Karar vermedim</option>
            </select>
          </div>
          <div>
            <Label htmlFor="dueDate">İstenen teslim tarihi</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="note">Notlar</Label>
            <textarea id="note" name="note" rows={4} className={textareaClass} placeholder="Logo konumu, renk dağılımı, beden dağılımı…" />
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="shake mt-4 rounded-control bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="flex h-12 items-center gap-1 rounded-control px-4 text-sm font-medium hover:bg-muted">
            <ChevronLeft size={16} /> Geri
          </button>
        ) : null}
        <button type="submit" disabled={pending} className="ml-auto h-12 rounded-control bg-foreground px-8 text-sm font-semibold text-background hover:bg-foreground/85 disabled:opacity-60">
          {step < 2 ? "Devam et" : pending ? "Gönderiliyor…" : "Teklif iste"}
        </button>
      </div>
    </form>
  );
}
