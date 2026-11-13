import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth-forms";
import { safeCallback } from "@/lib/callback";

export const metadata: Metadata = { title: "Giriş" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const next = safeCallback(callbackUrl);
  if (session?.user) redirect(next);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-5xl md:text-7xl">Giriş</h1>
      <p className="mt-3 max-w-md text-sm text-ink/70">
        Google ve Apple girişleri ortam değişkenleri tanımlanınca açılır.
      </p>
      <div className="mt-8">
        <LoginForm callbackUrl={next} />
      </div>
    </div>
  );
}
