"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PasswordInput } from "@/components/auth-forms";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/server/actions/password";

export function PasswordResetForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  if (done) {
    return (
      <div className="toast-in rounded-card border border-border bg-card p-6">
        <CheckCircle2 size={28} className="text-success" aria-hidden="true" />
        <p className="mt-3 font-semibold">Şifren güncellendi</p>
        <Link href="/giris" className="mt-4 inline-flex h-11 items-center rounded-control bg-foreground px-5 text-sm font-semibold text-background">
          Giriş yap
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
        data.set("token", token);
        start(async () => {
          const result = await resetPassword(data);
          if (result.error) setError(result.error);
          else setDone(true);
        });
      }}
    >
      <div>
        <Label htmlFor="password">Yeni şifre</Label>
        <PasswordInput id="password" autoComplete="new-password" />
      </div>
      {error ? (
        <p role="alert" className="shake rounded-control bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Şifreyi kaydet
      </Button>
    </form>
  );
}
