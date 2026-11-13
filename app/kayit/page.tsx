import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Kayıt" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/hesap");

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-5xl md:text-7xl">Kayıt</h1>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
