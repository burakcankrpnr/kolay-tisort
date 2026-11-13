import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Kayıt ol", robots: { index: false } };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/hesap");

  return (
    <AuthShell title="Hesap oluştur" lede="Bir dakikada üye ol; tasarımların hesabında saklansın.">
      <RegisterForm />
    </AuthShell>
  );
}
