import { prisma } from "@/lib/prisma";
import { saveCms } from "@/server/actions/admin";

export default async function AdminCms() {
  const [hero, faq] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "hero" } }),
    prisma.page.findUnique({ where: { slug: "faq" } }),
  ]);
  return (
    <div>
      <h1 className="font-display text-5xl">İçerik</h1>
      <form action={saveCms} className="mt-6 grid max-w-xl gap-2">
        <input name="heroTitle" defaultValue={hero?.title ?? "Kendi Tasarımını Giy."} className="h-11 border border-ink px-3" />
        <textarea name="heroBody" defaultValue={hero?.body ?? ""} className="h-24 border border-ink p-3" />
        <textarea name="faq" defaultValue={faq?.body ?? "[]"} className="h-40 border border-ink p-3" />
        <p className="text-sm text-ink/60">SSS alanı {`[{"q":"soru","a":"cevap"}]`} biçiminde.</p>
        <button className="h-11 bg-ink text-paper">Kaydet</button>
      </form>
    </div>
  );
}
