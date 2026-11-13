import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { safeCallback } from "@/lib/callback";

export const metadata: Metadata = { title: "Giriş yap", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const next = safeCallback(callbackUrl);
  if (session?.user) redirect(next);

  return (
    <AuthShell title="Giriş yap" lede="Tasarımlarına, siparişlerine ve favorilerine ulaş.">
      <LoginForm callbackUrl={next} />
    </AuthShell>
  );
}
