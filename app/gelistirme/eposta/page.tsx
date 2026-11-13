import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "E-posta kutusu" };

export default async function MailboxPage() {
  if (process.env.NODE_ENV === "production" && process.env.SHOW_MAILBOX !== "true") notFound();
  const messages = await prisma.emailMessage.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-5xl">E-posta kutusu</h1>
      <p className="mt-3 text-sm">Geliştirme ortamında giden iletiler burada durur. SMTP tanımlıysa aynı ileti oraya da gider.</p>
      <ul className="mt-6 space-y-4">
        {messages.map((message) => (
          <li key={message.id} className="border border-line p-4 text-sm">
            <p>
              {message.to} · {message.subject}
            </p>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-muted-foreground">{message.body}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
