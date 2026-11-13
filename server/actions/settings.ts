"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { settingSchemas, type SettingKey } from "@/lib/settings-schema";
import { requireAdmin } from "@/server/guard";

export type SettingsActionResult = { ok: true; message: string } | { ok: false; message: string };

const keys = Object.keys(settingSchemas) as SettingKey[];

function isKey(value: unknown): value is SettingKey {
  return typeof value === "string" && (keys as string[]).includes(value);
}

async function audit(actorId: string | undefined, action: string, target: string, detail?: Prisma.InputJsonValue) {
  await prisma.auditLog.create({ data: { actorId: actorId ?? null, action, target, detail } });
}

/** Taslağı doğrular ve kaydeder; yayındaki siteyi etkilemez. */
export async function saveSettingDraft(key: SettingKey, data: unknown): Promise<SettingsActionResult> {
  const session = await requireAdmin();
  if (!isKey(key)) return { ok: false, message: "Geçersiz ayar." };
  const parsed = settingSchemas[key].safeParse(data);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ayar doğrulanamadı." };
  }
  const value = parsed.data as Prisma.InputJsonValue;
  await prisma.siteSetting.upsert({
    where: { key },
    update: { draft: value, updatedBy: session.user.id },
    create: { key, value: settingSchemas[key].parse({}) as Prisma.InputJsonValue, draft: value, version: 0, updatedBy: session.user.id },
  });
  await audit(session.user.id, "settings.draft", key);
  revalidatePath("/admin/gorunum");
  return { ok: true, message: "Taslak kaydedildi. Önizleyip yayınlayabilirsin." };
}

/** Taslağı yayına alır, eski değeri sürüm geçmişine yazar. */
export async function publishSetting(key: SettingKey): Promise<SettingsActionResult> {
  const session = await requireAdmin();
  if (!isKey(key)) return { ok: false, message: "Geçersiz ayar." };
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  if (!row?.draft) return { ok: false, message: "Yayınlanacak taslak yok." };
  const version = row.version + 1;
  await prisma.$transaction([
    prisma.siteSettingVersion.create({
      data: { key, version, value: row.draft as Prisma.InputJsonValue, createdBy: session.user.id },
    }),
    prisma.siteSetting.update({
      where: { key },
      data: { value: row.draft as Prisma.InputJsonValue, draft: Prisma.DbNull, version, updatedBy: session.user.id },
    }),
  ]);
  await audit(session.user.id, "settings.publish", key, { version });
  revalidatePath("/", "layout");
  return { ok: true, message: `Yayınlandı (sürüm ${version}).` };
}

export async function discardSettingDraft(key: SettingKey): Promise<SettingsActionResult> {
  const session = await requireAdmin();
  if (!isKey(key)) return { ok: false, message: "Geçersiz ayar." };
  await prisma.siteSetting.updateMany({ where: { key }, data: { draft: Prisma.DbNull } });
  await audit(session.user.id, "settings.discard", key);
  revalidatePath("/admin/gorunum");
  return { ok: true, message: "Taslak silindi." };
}

/** Geçmişteki bir sürümü yeni sürüm olarak yayına geri alır. */
export async function rollbackSetting(key: SettingKey, version: number): Promise<SettingsActionResult> {
  const session = await requireAdmin();
  if (!isKey(key)) return { ok: false, message: "Geçersiz ayar." };
  const target = await prisma.siteSettingVersion.findFirst({ where: { key, version } });
  if (!target) return { ok: false, message: "Sürüm bulunamadı." };
  const row = await prisma.siteSetting.findUniqueOrThrow({ where: { key } });
  const next = row.version + 1;
  await prisma.$transaction([
    prisma.siteSettingVersion.create({ data: { key, version: next, value: target.value as Prisma.InputJsonValue, createdBy: session.user.id } }),
    prisma.siteSetting.update({ where: { key }, data: { value: target.value as Prisma.InputJsonValue, version: next, updatedBy: session.user.id } }),
  ]);
  await audit(session.user.id, "settings.rollback", key, { from: version, to: next });
  revalidatePath("/", "layout");
  return { ok: true, message: `Sürüm ${version} geri yüklendi (yeni sürüm ${next}).` };
}

/** Taslak önizleme modunu aç/kapat (yalnızca bu adminin tarayıcısı için). */
export async function setSettingsPreview(on: boolean) {
  await requireAdmin();
  const jar = await cookies();
  if (on) jar.set("settings_preview", "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 });
  else jar.delete("settings_preview");
  revalidatePath("/", "layout");
}
