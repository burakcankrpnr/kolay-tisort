"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/server/actions/password";

export function PasswordRequestForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  if (sent) {
    return (
      <div className="toast-in rounded-card border border-border bg-card p-6">
        <MailCheck size={28} className="text-success" aria-hidden="true" />
        <p className="mt-3 font-semibold">E-postanı kontrol et</p>
        <p className="mt-1 text-sm text-muted-foreground">Bu adresle bir hesap varsa şifre yenileme bağlantısı gönderildi. Bağlantı 1 saat geçerlidir.</p>
        <Link href="/giris" className="mt-4 inline-block text-sm font-semibold underline">
          Girişe dön
        </Link>
      </div>
    );
  }
  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        start(async () => {
          const result = await requestPasswordReset(data);
          if (result.error) setError(result.error);
          else setSent(true);
        });
      }}
    >
      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="ornek@eposta.com" />
      </div>
      {error ? (
        <p role="alert" className="shake rounded-control bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Bağlantı gönder
      </Button>
      <Link href="/giris" className="text-center text-sm text-muted-foreground underline">
        Girişe dön
      </Link>
    </form>
  );
}
