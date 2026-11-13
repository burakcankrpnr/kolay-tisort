"use client";

import { useState, useTransition } from "react";
import { shippingOptions, type ShippingId } from "@/lib/shipping";
import { placeOrder, previewCheckout } from "@/server/actions/checkout";
import { formatTry } from "@/utils/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Line = { name: string; detail: string; quantity: number; unitPrice: number };

const steps = ["Adres", "Kargo", "Ödeme", "Özet"];

export function CheckoutForm({
  lines,
  subtotal,
  simulationEnabled,
  defaults,
}: {
  lines: Line[];
  subtotal: number;
  simulationEnabled: boolean;
  defaults?: {
    fullName?: string;
    phone?: string;
    city?: string;
    district?: string;
    line1?: string;
    postalCode?: string;
  };
}) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [shippingId, setShippingId] = useState<ShippingId>("aras");
  const [provider, setProvider] = useState<"SIMULATION" | "IYZICO" | "PAYTR">(
    simulationEnabled ? "SIMULATION" : "IYZICO",
  );
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<{
    subtotal: number;
    discount: number;
    shippingFee: number;
    total: number;
  } | null>(null);

  function loadQuote(code = couponCode) {
    start(async () => {
      const result = await previewCheckout({ shippingId, couponCode: code });
      if ("error" in result) {
        setQuote(null);
        setError(result.error);
        return;
      }
      setError(null);
      setQuote(result);
    });
  }

  function next() {
    if (step === 0) {
      const form = document.getElementById("adres-form") as HTMLFormElement | null;
      if (!form?.reportValidity()) return;
    }
    if (step === 2) loadQuote();
    setStep((value) => Math.min(3, value + 1));
  }

  function submit(formData: FormData) {
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      city: String(formData.get("city") ?? ""),
      district: String(formData.get("district") ?? ""),
      line1: String(formData.get("line1") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      shippingId,
      provider,
      couponCode,
    };
    setError(null);
    start(async () => {
      const result = await placeOrder(payload);
      if (result?.error) setError(result.error);
    });
  }

  const shipping = shippingOptions.find((option) => option.id === shippingId);

  return (
    <form action={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <ol className="mb-8 flex gap-4 text-sm">
          {steps.map((label, index) => (
            <li key={label} className={index === step ? "font-medium" : "text-ink/45"}>
              {index + 1} {label}
            </li>
          ))}
        </ol>

        <div id="adres-form" className={step === 0 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
          <div className="sm:col-span-2">
            <Label htmlFor="fullName">Ad soyad</Label>
            <Input id="fullName" name="fullName" autoComplete="name" required defaultValue={defaults?.fullName} />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" name="phone" autoComplete="tel" required defaultValue={defaults?.phone} />
          </div>
          <div>
            <Label htmlFor="city">İl</Label>
            <Input id="city" name="city" autoComplete="address-level1" required defaultValue={defaults?.city} />
          </div>
          <div>
            <Label htmlFor="district">İlçe</Label>
            <Input id="district" name="district" autoComplete="address-level2" required defaultValue={defaults?.district} />
          </div>
          <div>
            <Label htmlFor="postalCode">Posta kodu</Label>
            <Input id="postalCode" name="postalCode" inputMode="numeric" autoComplete="postal-code" required pattern="\d{5}" defaultValue={defaults?.postalCode} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="line1">Adres</Label>
            <Input id="line1" name="line1" autoComplete="street-address" required minLength={8} defaultValue={defaults?.line1} />
          </div>
        </div>

        <fieldset className={step === 1 ? "space-y-3" : "hidden"}>
          <legend className="text-sm">Kargo firması</legend>
          {shippingOptions.map((option) => (
            <label key={option.id} className="flex items-start gap-3 border border-line px-3 py-3">
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={shippingId === option.id}
                onChange={() => setShippingId(option.id)}
              />
              <span>
                <span className="block">{option.name}</span>
                <span className="text-sm text-ink/70">
                  {formatTry(option.fee)} · {option.eta}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <fieldset className={step === 2 ? "space-y-3" : "hidden"}>
          <legend className="text-sm">Ödeme</legend>
          {simulationEnabled ? (
            <label className="flex gap-3 border border-line px-3 py-3">
              <input
                type="radio"
                name="provider"
                checked={provider === "SIMULATION"}
                onChange={() => setProvider("SIMULATION")}
              />
              <span>
                <span className="block">Simülasyon</span>
                <span className="text-sm text-ink/70">
                  Geliştirme ödemesi. Kart numarası istenmez ve saklanmaz.
                </span>
              </span>
            </label>
          ) : null}
          <label className="flex gap-3 border border-line px-3 py-3">
            <input type="radio" name="provider" checked={provider === "IYZICO"} onChange={() => setProvider("IYZICO")} />
            <span>
              <span className="block">iyzico</span>
              <span className="text-sm text-ink/70">Anahtar yoksa sipariş ödeme bekler. Kart çekilmez.</span>
            </span>
          </label>
          <label className="flex gap-3 border border-line px-3 py-3">
            <input type="radio" name="provider" checked={provider === "PAYTR"} onChange={() => setProvider("PAYTR")} />
            <span>
              <span className="block">PayTR</span>
              <span className="text-sm text-ink/70">Anahtar yoksa sipariş ödeme bekler. Kart çekilmez.</span>
            </span>
          </label>
        </fieldset>

        <div className={step === 3 ? "space-y-4" : "hidden"}>
          <ul className="divide-y divide-line border border-line">
            {lines.map((line) => (
              <li key={`${line.name}-${line.detail}`} className="flex justify-between gap-4 px-3 py-3 text-sm">
                <span>
                  {line.name}
                  <span className="block text-ink/60">
                    {line.detail} · {line.quantity} adet
                  </span>
                </span>
                <span>{formatTry(line.unitPrice * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div>
            <Label htmlFor="coupon">Kupon</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="WELCOME10"
              />
              <Button type="button" variant="outline" onClick={() => loadQuote(couponCode)}>
                Uygula
              </Button>
            </div>
          </div>
          <p className="text-sm">
            {shipping?.name}. Teslimat bilgisi bir önceki adımda.
          </p>
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}>
              Geri
            </Button>
          ) : null}
          {step < 3 ? (
            <Button type="button" onClick={next}>
              Devam
            </Button>
          ) : (
            <Button type="submit" disabled={pending}>
              {pending ? "Sipariş oluşuyor" : "Siparişi ver"}
            </Button>
          )}
        </div>
      </div>
      <aside className="h-fit border border-line p-4 text-sm">
        <p className="flex justify-between">
          <span>Ara toplam</span>
          <span>{formatTry(quote?.subtotal ?? subtotal)}</span>
        </p>
        <p className="mt-2 flex justify-between">
          <span>İndirim</span>
          <span>{formatTry(quote?.discount ?? 0)}</span>
        </p>
        <p className="mt-2 flex justify-between">
          <span>Kargo</span>
          <span>{formatTry(quote?.shippingFee ?? shipping?.fee ?? 0)}</span>
        </p>
        <p className="mt-4 flex justify-between font-display text-3xl">
          <span>Toplam</span>
          <span>{formatTry(quote?.total ?? subtotal + (shipping?.fee ?? 0))}</span>
        </p>
      </aside>
    </form>
  );
}
