import { prisma } from "@/lib/prisma";

export async function deliverMail(input: { to: string; subject: string; body: string }) {
  await prisma.emailMessage.create({ data: input });
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return { channel: "outbox" as const };
  const nodemailer = (await import("nodemailer").catch(() => null)) as
    | { createTransport: (options: object) => { sendMail: (message: object) => Promise<unknown> } }
    | null;
  if (!nodemailer) return { channel: "outbox" as const };
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: input.to,
    subject: input.subject,
    text: input.body,
  });
  return { channel: "smtp" as const };
}
