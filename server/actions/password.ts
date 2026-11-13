"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { deliverMail } from "@/lib/mail";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { error: "Geçerli bir e-posta yaz." };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: true as const };
  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60);
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });
  const link = `${process.env.AUTH_URL ?? "http://localhost:3000"}/sifre-sifirla?token=${token}`;
  await deliverMail({
    to: email,
    subject: "Katman şifre sıfırlama",
    body: `Şifreni yenilemek için bu bağlantıyı bir saat içinde aç:\n${link}`,
  });
  return { ok: true as const };
}

export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Şifre en az 8 karakter olmalı." };
  const row = await prisma.verificationToken.findFirst({ where: { token } });
  if (!row || row.expires < new Date()) return { error: "Bağlantının süresi dolmuş." };
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { email: row.identifier }, data: { passwordHash } });
  await prisma.verificationToken.deleteMany({ where: { token } });
  return { ok: true as const };
}
