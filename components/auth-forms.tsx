"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { demoAccounts } from "@/config/site";
import { formatTrPhone } from "@/lib/tr-cities";
import { cn } from "@/lib/utils";
import { loginAction, registerAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordInput({ id, autoComplete, onValue }: { id: string; autoComplete: string; onValue?: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        name="password"
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={8}
        className="pr-12"
        onChange={(event) => onValue?.(event.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
        className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function strength(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-ZÇĞİÖŞÜ]/.test(value) && /[a-zçğıöşü]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^\w\sçğıöşüÇĞİÖŞÜ]/.test(value)) score += 1;
  return Math.min(4, score);
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="shake rounded-control border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </p>
  );
}

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setError(null);
        start(async () => {
          const result = await loginAction(data);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="ornek@eposta.com" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Şifre</Label>
          <Link href="/sifremi-unuttum" className="mb-1.5 text-sm text-muted-foreground underline hover:text-foreground">
            Şifremi unuttum
          </Link>
        </div>
        <PasswordInput id="password" autoComplete="current-password" />
      </div>
      <FormError message={error} />
      <Button type="submit" size="lg" loading={pending} className="w-full">
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-foreground underline">
          Kayıt ol
        </Link>
      </p>
      {process.env.NODE_ENV === "development" ? (
        <p className="rounded-control bg-muted px-4 py-3 text-xs text-muted-foreground">
          Geliştirme hesapları: {demoAccounts.customer} · {demoAccounts.admin} · Şifre: {demoAccounts.password}
        </p>
      ) : null}
    </form>
  );
}

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, start] = useTransition();
  const score = strength(password);
  const labels = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"];

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        data.set("phone", phone.replace(/\s/g, ""));
        setError(null);
        start(async () => {
          const result = await registerAction(data);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">Ad</Label>
          <Input id="firstName" name="firstName" autoComplete="given-name" required />
        </div>
        <div>
          <Label htmlFor="lastName">Soyad</Label>
          <Input id="lastName" name="lastName" autoComplete="family-name" required />
        </div>
      </div>
      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="ornek@eposta.com" />
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
          placeholder="05xx xxx xx xx"
          value={phone}
          onChange={(event) => setPhone(formatTrPhone(event.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="password">Şifre</Label>
        <PasswordInput id="password" autoComplete="new-password" onValue={setPassword} />
        {password ? (
          <div className="mt-2" aria-live="polite">
            <div className="grid grid-cols-4 gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    i < score ? (score <= 1 ? "bg-destructive" : score === 2 ? "bg-warning" : "bg-success") : "bg-border",
                  )}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Şifre gücü: {labels[score]}
              {password.length < 8 ? " · en az 8 karakter" : ""}
            </p>
          </div>
        ) : null}
      </div>
      <FormError message={error} />
      <Button type="submit" size="lg" loading={pending} className="w-full">
        {pending ? "Hesap açılıyor…" : "Hesap aç"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Hesabın var mı?{" "}
        <Link href="/giris" className="font-semibold text-foreground underline">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}
