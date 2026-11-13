import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDraftSettings, getPreviewState } from "@/lib/settings";
import { AppearanceEditor } from "./appearance-editor";

export const metadata: Metadata = { title: "Görünüm ve efektler", robots: { index: false } };

const dateTime = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" });

export default async function AppearancePage() {
  const [{ settings, hasDraft, versions }, preview, history, logs] = await Promise.all([
    getDraftSettings(),
    getPreviewState(),
    prisma.siteSettingVersion.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { key: true, version: true, createdAt: true } }),
    prisma.auditLog.findMany({ where: { action: { startsWith: "settings." } }, orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  const actorIds = Array.from(new Set(logs.map((log) => log.actorId).filter(Boolean))) as string[];
  const actors = await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, email: true } });
  const actorEmail = new Map(actors.map((actor) => [actor.id, actor.email]));

  return (
    <div>
      <h1 className="font-display text-5xl">Görünüm ve efektler</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Marka, renk, font, efekt yoğunluğu ve duyuru çubuğu. Değişiklikler önce taslak olarak kaydedilir; önizledikten sonra tek
        tıkla yayınlanır ve önceki sürüme geri alınabilir.
      </p>
      <AppearanceEditor
        initial={settings}
        hasDraft={hasDraft}
        versions={versions}
        preview={preview}
        history={history.map((item) => ({ key: item.key, version: item.version, at: dateTime.format(item.createdAt) }))}
      />
      <section className="mt-12">
        <h2 className="font-display text-2xl">Denetim kaydı</h2>
        {logs.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Henüz değişiklik yok.</p> : null}
        <ul className="mt-3 divide-y divide-border border-y border-border text-sm">
          {logs.map((log) => (
            <li key={log.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span>
                <span className="font-medium">{log.target}</span> · {actionLabel[log.action] ?? log.action}
              </span>
              <span className="text-muted-foreground">
                {(log.actorId && actorEmail.get(log.actorId)) || "—"} · {dateTime.format(log.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const actionLabel: Record<string, string> = {
  "settings.draft": "taslak kaydedildi",
  "settings.publish": "yayınlandı",
  "settings.discard": "taslak silindi",
  "settings.rollback": "geri alındı",
};
