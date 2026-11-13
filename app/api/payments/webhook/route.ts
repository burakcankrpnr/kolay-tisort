import { NextResponse } from "next/server";
import { webhookSchema } from "@/lib/validators";
import { applyPaymentEvent } from "@/server/payments";

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!process.env.PAYMENT_WEBHOOK_SECRET || secret !== process.env.PAYMENT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON okunamadı." }, { status: 400 });
  }

  const parsed = webhookSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Olay gövdesi geçersiz." }, { status: 400 });
  }

  try {
    const order = await applyPaymentEvent({
      orderId: parsed.data.orderId,
      event: parsed.data.event,
      providerRef: parsed.data.providerRef,
    });
    return NextResponse.json({ ok: true, orderId: order.id, status: order.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Olay işlenemedi.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
