"use client";

import { useState, useTransition } from "react";
import { Check, ChevronLeft, CreditCard, Lock, MapPin, Package, Tag, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shippingOptions, type ShippingId } from "@/lib/shipping";
import { formatTrPhone, trCities } from "@/lib/tr-cities";
import { cn } from "@/lib/utils";
import { placeOrder, previewCheckout } from "@/server/actions/checkout";
import { formatTry } from "@/utils/money";

type Line = { name: string; detail: string; quantity: number; unitPrice: number; previewUrl?: string | null };
type Quote = { subtotal: number; discount: number; bulkDiscount?: number; bulkPercent?: number; couponDiscount?: number; shippingFee: number; total: number };

const steps = [
  { label: "Adres", icon: MapPin },
  { label: "Kargo", icon: Truck },
  { label: "Ödeme", icon: CreditCard },
  { label: "Onay", icon: Package },
];

const addressFields = ["fullName", "phone", "city", "district", "postalCode", "line1"];

export function CheckoutForm({
  lines,
  subtotal,
  bulk,
  bulkPercent,
  simulationEnabled,
  defaults,
}: {
  lines: Line[];
  subtotal: number;
  bulk: number;
  bulkPercent: number;
  simulationEnabled: boolean;
  defaults?: { fullName?: string; phone?: string; city?: string; district?: string; line1?: string; postalCode?: string };
}) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [pending, start] = useTransition();
  const [shippingId, setShippingId] = useState<ShippingId>("yurtici");
  const [provider, setProvider] = useState<"SIMULATION" | "IYZICO" | "PAYTR">(simulationEnabled ? "SIMULATION" : "IYZICO");
  const [couponCode, setCouponCode] = useState("");
  const [couponState, setCouponState] = useState<"idle" | "ok" | "error">("idle");
  const [phone, setPhone] = useState(formatTrPhone(defaults?.phone ?? ""));
  const [quote, setQuote] = useState<Quote | null>(null);
  const [accepted, setAccepted] = useState(false);

  const shipping = shippingOptions.find((option) => option.id === shippingId);
  const shown: Quote = quote ?? {
    subtotal,
    discount: bulk,
    bulkDiscount: bulk,
    bulkPercent,
    shippingFee: shipping?.fee ?? 0,
    total: subtotal - bulk + (shipping?.fee ?? 0),
  };

  function fail(message: string) {
    setError(message);
    setShake((n) => n + 1);
  }

  function loadQuote(nextShipping = shippingId, code = couponCode) {
    start(async () => {
      const result = await previewCheckout({ shippingId: nextShipping, couponCode: code });
      if (!result.ok) {
        if (code.trim()) setCouponState("error");
        fail(result.error);
        return;
      }
      setError(null);
      setCouponState(code.trim() ? "ok" : "idle");
      setQuote(result);
    });
  }

  function validateAddress() {
    for (const id of addressFields) {
      const field = document.getElementById(id);
      if (field instanceof HTMLInputElement && !field.checkValidity()) {
        field.setAttribute("aria-invalid", "true");
        field.scrollIntoView({ behavior: "smooth", block: "center" });
        field.reportValidity();
        setShake((n) => n + 1);
        return false;
      }
      field?.removeAttribute("aria-invalid");
    }
    return true;
  }

  function go(target: number) {
    if (target > 0 && step === 0 && !validateAddress()) return;
    if (target >= 1 && !quote) loadQuote();
    setError(null);
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(formData: FormData) {
    if (!accepted) {
      fail("Devam etmek için sipariş onay kutusunu işaretle.");
      return;
    }
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      phone: phone.replace(/\s/g, ""),
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
      if (result?.error) fail(result.error);
    });
  }

  return (
    <form action={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div>
        {/* Adım göstergesi */}
        <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Ödeme adımları">
          {steps.map(({ label, icon: Icon }, index) => {
            const done = index < step;
            const current = index === step;
            return (
              <li key={label}>
                <button
                  type="button"
                  disabled={index > step}
                  onClick={() => go(index)}
                  aria-current={current ? "step" : undefined}
                  className="group flex w-full flex-col gap-2 text-left disabled:cursor-default"
                >
                  <span className={cn("h-1 rounded-full transition-colors duration-500", done || current ? "bg-foreground" : "bg-border")} />
                  <span className={cn("flex items-center gap-1.5 text-xs font-medium sm:text-sm", current ? "text-foreground" : done ? "text-foreground/70" : "text-muted-foreground")}>
                    <span className={cn("grid size-6 place-items-center rounded-full border text-[11px]", done ? "border-foreground bg-foreground text-background" : current ? "border-foreground" : "border-border")}>
                      {done ? <Check size={12} /> : <Icon size={12} />}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div key={step} className="toast-in">
          {/* 1. Adres */}
          <section className={step === 0 ? "rounded-card border border-border bg-card p-5 sm:p-6" : "hidden"} aria-labelledby="adres-baslik">
            <h2 id="adres-baslik" className="font-display text-2xl">
              Teslimat adresi
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Siparişin bu adrese gönderilir. Kargo takip bilgisi SMS ve e-postayla gelir.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Ad soyad</Label>
                <Input id="fullName" name="fullName" autoComplete="name" required minLength={3} defaultValue={defaults?.fullName} />
              </div>
              <div>
                <Label htmlFor="phone">Cep telefonu</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  pattern="0\d{3} \d{3} \d{2} \d{2}"
                  title="05xx xxx xx xx biçiminde yaz"
                  placeholder="05xx xxx xx xx"
                  value={phone}
                  onChange={(event) => setPhone(formatTrPhone(event.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="city">İl</Label>
                <Input id="city" name="city" list="tr-iller" autoComplete="address-level1" required defaultValue={defaults?.city} placeholder="İl seç veya yaz" />
                <datalist id="tr-iller">
                  {trCities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="district">İlçe</Label>
                <Input id="district" name="district" autoComplete="address-level2" required defaultValue={defaults?.district} />
              </div>
              <div>
                <Label htmlFor="postalCode">Posta kodu</Label>
                <Input id="postalCode" name="postalCode" inputMode="numeric" autoComplete="postal-code" required pattern="\d{5}" maxLength={5} title="5 haneli posta kodu" defaultValue={defaults?.postalCode} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line1">Açık adres</Label>
                <Input id="line1" name="line1" autoComplete="street-address" required minLength={8} placeholder="Mahalle, cadde/sokak, bina no, daire no" defaultValue={defaults?.line1} />
              </div>
            </div>
          </section>

          {/* 2. Kargo */}
          <fieldset className={step === 1 ? "rounded-card border border-border bg-card p-5 sm:p-6" : "hidden"}>
            <legend className="sr-only">Kargo firması</legend>
            <h2 className="font-display text-2xl">Kargo firması</h2>
            <p className="mt-1 text-sm text-muted-foreground">Süre, üretimin bitişinden itibaren hesaplanır.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "relative flex cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors",
                    shippingId === option.id ? "border-foreground bg-foreground/[0.03] ring-1 ring-foreground" : "border-border hover:border-foreground/40",
                  )}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value={option.id}
                    checked={shippingId === option.id}
                    onChange={() => {
                      setShippingId(option.id);
                      loadQuote(option.id);
                    }}
                    className="mt-1"
                  />
                  <span className="flex-1">
                    <span className="block font-semibold">{option.name}</span>
                    <span className="text-sm text-muted-foreground">{option.eta}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{formatTry(option.fee)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 3. Ödeme */}
          <fieldset className={step === 2 ? "rounded-card border border-border bg-card p-5 sm:p-6" : "hidden"}>
            <legend className="sr-only">Ödeme yöntemi</legend>
            <h2 className="font-display text-2xl">Ödeme yöntemi</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock size={14} aria-hidden="true" /> Kart bilgilerin bizde saklanmaz; ödeme sağlayıcının 3D Secure sayfasında alınır.
            </p>
            <div className="mt-5 space-y-3">
              {(
                [
                  ...(simulationEnabled ? [{ id: "SIMULATION" as const, name: "Test ödemesi (geliştirme)", text: "Kart numarası istenmez ve saklanmaz." }] : []),
                  { id: "IYZICO" as const, name: "iyzico ile kart", text: "Kredi / banka kartı, 3D Secure." },
                  { id: "PAYTR" as const, name: "PayTR ile kart", text: "Kredi / banka kartı, 3D Secure." },
                ]
              ).map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors",
                    provider === option.id ? "border-foreground ring-1 ring-foreground" : "border-border hover:border-foreground/40",
                  )}
                >
                  <input type="radio" name="provider" checked={provider === option.id} onChange={() => setProvider(option.id)} className="mt-1" />
                  <span>
                    <span className="block font-semibold">{option.name}</span>
                    <span className="text-sm text-muted-foreground">{option.text}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 4. Onay */}
          <section className={step === 3 ? "space-y-4 rounded-card border border-border bg-card p-5 sm:p-6" : "hidden"}>
            <h2 className="font-display text-2xl">Siparişini onayla</h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-control bg-muted/60 p-3">
                <dt className="text-muted-foreground">Kargo</dt>
                <dd className="mt-1 font-semibold">{shipping?.name}</dd>
              </div>
              <div className="rounded-control bg-muted/60 p-3">
                <dt className="text-muted-foreground">Ödeme</dt>
                <dd className="mt-1 font-semibold">{provider === "SIMULATION" ? "Test ödemesi" : provider === "IYZICO" ? "iyzico" : "PayTR"}</dd>
              </div>
              <div className="rounded-control bg-muted/60 p-3">
                <dt className="text-muted-foreground">Telefon</dt>
                <dd className="mt-1 font-semibold">{phone || "—"}</dd>
              </div>
            </dl>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 size-4" />
              <span>
                Sipariş ve teslimat bilgilerimin doğru olduğunu onaylıyorum. Kişiye özel üretilen ürünlerde cayma hakkı bulunmadığını
                biliyorum.
              </span>
            </label>
          </section>
        </div>

        {error ? (
          <p key={shake} role="alert" className="shake mt-4 rounded-control border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div key={`nav-${shake}`} className={cn("mt-6 flex items-center gap-3", shake && !error && "shake")}>
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="flex h-12 items-center gap-1 rounded-control px-4 text-sm font-medium hover:bg-muted">
              <ChevronLeft size={16} /> Geri
            </button>
          ) : null}
          {step < 3 ? (
            <button type="button" onClick={() => go(step + 1)} className="ml-auto h-12 rounded-control bg-foreground px-8 text-sm font-semibold text-background hover:bg-foreground/85">
              Devam et
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="btn-fill ml-auto flex h-13 items-center gap-2 rounded-control bg-foreground px-8 text-[15px] font-semibold text-background hover:text-primary-foreground disabled:opacity-60"
            >
              <Lock size={16} /> {pending ? "Sipariş oluşturuluyor…" : `${formatTry(shown.total)} öde`}
            </button>
          )}
        </div>
      </div>

      {/* Özet */}
      <aside className="h-fit rounded-card border border-border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-xl">Sipariş özeti</h2>
        <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          {lines.map((line, index) => (
            <li key={`${line.name}-${line.detail}-${index}`} className="flex gap-3 text-sm">
              <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-control bg-muted">
                {line.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.previewUrl} alt="" className="size-full object-contain" />
                ) : (
                  <Package size={18} className="text-muted-foreground" aria-hidden="true" />
                )}
                <span className="absolute -top-0 -right-0 grid min-w-5 place-items-center rounded-bl-[8px] bg-foreground px-1 text-[11px] font-semibold text-background">{line.quantity}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{line.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{line.detail}</span>
              </span>
              <span className="tabular-nums">{formatTry(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-border pt-4">
          <Label htmlFor="coupon" className="flex items-center gap-1.5">
            <Tag size={14} aria-hidden="true" /> Kupon kodu
          </Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              value={couponCode}
              onChange={(event) => {
                setCouponCode(event.target.value.toUpperCase());
                setCouponState("idle");
              }}
              placeholder="KUPON"
              className="h-11 uppercase"
              aria-invalid={couponState === "error" || undefined}
            />
            <button type="button" onClick={() => loadQuote(shippingId, couponCode)} disabled={pending || !couponCode.trim()} className="h-11 shrink-0 rounded-control border border-input px-4 text-sm font-semibold hover:border-foreground/50 disabled:opacity-40">
              Uygula
            </button>
          </div>
          {couponState === "ok" ? <p className="mt-1.5 text-xs text-success">Kupon uygulandı.</p> : null}
        </div>

        <dl className={cn("mt-5 space-y-2 text-sm transition-opacity", pending && "opacity-60")}>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Ara toplam</dt>
            <dd className="tabular-nums">{formatTry(shown.subtotal)}</dd>
          </div>
          {shown.bulkDiscount ? (
            <div className="flex justify-between text-success">
              <dt>Toplu indirim (%{shown.bulkPercent})</dt>
              <dd className="tabular-nums">−{formatTry(shown.bulkDiscount)}</dd>
            </div>
          ) : null}
          {shown.couponDiscount ? (
            <div className="flex justify-between text-success">
              <dt>Kupon</dt>
              <dd className="tabular-nums">−{formatTry(shown.couponDiscount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Kargo · {shipping?.name}</dt>
            <dd className="tabular-nums">{formatTry(shown.shippingFee)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <dt className="font-semibold">Toplam</dt>
            <dd key={shown.total} className="price-tick font-display text-3xl font-bold tabular-nums">
              {formatTry(shown.total)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock size={12} aria-hidden="true" /> Güvenli ödeme · iyzico / PayTR · 3D Secure
        </p>
      </aside>
    </form>
  );
}
