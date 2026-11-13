import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Ad en az 2 karakter olmalı.").max(40),
  lastName: z.string().trim().min(2, "Soyad en az 2 karakter olmalı.").max(40),
  email: z.string().trim().email("Geçerli bir e-posta yaz.").max(120),
  phone: z
    .string()
    .trim()
    .min(10, "Telefon en az 10 karakter olmalı.")
    .max(20, "Telefon çok uzun."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı.").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta yaz."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı.").max(72),
});

/** Tek sepet satırında en fazla adet (toplu/kurumsal siparişler için; stok ayrıca kontrol edilir). */
export const MAX_LINE_QUANTITY = 500;

export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı.").max(80),
  phone: z.string().trim().min(10, "Telefon eksik.").max(20),
  city: z.string().trim().min(2, "İl yaz.").max(40),
  district: z.string().trim().min(2, "İlçe yaz.").max(40),
  line1: z.string().trim().min(8, "Adres en az 8 karakter olmalı.").max(200),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Posta kodu 5 haneli olmalı."),
  shippingId: z.enum(["aras", "yurtici", "mng", "surat"]),
  provider: z.enum(["SIMULATION", "IYZICO", "PAYTR"]),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
});

export const webhookSchema = z.object({
  provider: z.enum(["IYZICO", "PAYTR", "SIMULATION"]),
  event: z.enum(["payment_success", "payment_failed", "payment_pending", "refund"]),
  orderId: z.string().min(1),
  providerRef: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
