"use server";

import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { safeCallback } from "@/lib/callback";
import { loginSchema, registerSchema } from "@/lib/validators";
import { mergeGuestCart } from "@/server/cart";

function rethrowRedirect(error: unknown): void {
  if (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }
}

async function clientKey(email: string) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${ip}:${email}`;
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formu kontrol et." };
  }

  const email = parsed.data.email.toLowerCase();
  if (!rateLimit(await clientKey(email))) {
    return { error: "Çok fazla deneme. Biraz sonra tekrar dene." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Bu e-posta ile kayıt var. Giriş yap." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      role: "CUSTOMER",
    },
  });

  await mergeGuestCart(user.id);

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/hesap",
    });
  } catch (error) {
    rethrowRedirect(error);
    if (error instanceof AuthError) {
      return { error: "Hesap açıldı ama oturum başlatılamadı. Giriş yap." };
    }
    throw error;
  }

  return { error: "Giriş tamamlanamadı." };
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formu kontrol et." };
  }

  const email = parsed.data.email.toLowerCase();
  const callbackUrl = safeCallback(String(formData.get("callbackUrl") ?? ""));
  if (!rateLimit(await clientKey(email))) {
    return { error: "Çok fazla deneme. Biraz sonra tekrar dene." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || user.deletedAt) {
    return { error: "E-posta veya şifre hatalı." };
  }
  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!matches) return { error: "E-posta veya şifre hatalı." };

  await mergeGuestCart(user.id);

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    rethrowRedirect(error);
    if (error instanceof AuthError) return { error: "E-posta veya şifre hatalı." };
    throw error;
  }

  return { error: "Giriş tamamlanamadı." };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
