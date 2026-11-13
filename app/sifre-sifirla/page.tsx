import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { PasswordResetForm } from "@/components/password-reset-form";

export const metadata: Metadata = { title: "Yeni şifre", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell title="Yeni şifre belirle" lede="En az 8 karakter; harf, rakam ve sembol karışımı önerilir.">
      {token ? (
        <PasswordResetForm token={token} />
      ) : (
        <p className="rounded-card border border-border bg-card p-5">
          Bağlantı eksik veya geçersiz.{" "}
          <Link href="/sifremi-unuttum" className="font-semibold underline">
            Yeni bağlantı iste
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
