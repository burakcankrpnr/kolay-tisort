import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { PasswordRequestForm } from "@/components/password-request-form";

export const metadata: Metadata = { title: "Şifremi unuttum", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell title="Şifreni mi unuttun?" lede="E-posta adresini yaz; şifreni yenilemen için bir bağlantı gönderelim.">
      <PasswordRequestForm />
    </AuthShell>
  );
}
