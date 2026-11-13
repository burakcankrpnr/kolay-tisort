import { cache } from "react";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseSetting, settingSchemas, type SettingKey, type Settings } from "@/lib/settings-schema";

const keys = Object.keys(settingSchemas) as SettingKey[];

/** Yalnızca önizleme çerezi olan bir admin taslakları görür. */
export const getPreviewState = cache(async () => {
  try {
    const jar = await cookies();
    if (!jar.get("settings_preview")) return false;
    const session = await auth();
    return session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  } catch {
    return false;
  }
});

/**
 * Yayındaki ayarları tek sorguda okur. İstek başına bir kez çalışır (React cache).
 * Tablo yoksa veya DB erişilemezse varsayılanlara döner; site hiç düşmez.
 * Admin önizleme modundaysa taslaklar yayındaki değerin yerine geçer.
 */
export const getSettings = cache(async (): Promise<Settings> => {
  let rows: { key: string; value: unknown; draft: unknown }[] = [];
  try {
    rows = await prisma.siteSetting.findMany({ select: { key: true, value: true, draft: true } });
  } catch {
    rows = [];
  }
  const preview = rows.some((row) => row.draft) && (await getPreviewState());
  const map = new Map(rows.map((row) => [row.key, preview && row.draft ? row.draft : row.value]));
  return Object.fromEntries(keys.map((key) => [key, parseSetting(key, map.get(key))])) as Settings;
});

/** Admin formu: taslak varsa taslağı, yoksa yayındakini döner. */
export async function getDraftSettings() {
  const rows = await prisma.siteSetting.findMany();
  const map = new Map(rows.map((row) => [row.key, row]));
  const settings = Object.fromEntries(
    keys.map((key) => [key, parseSetting(key, map.get(key)?.draft ?? map.get(key)?.value)]),
  ) as Settings;
  const hasDraft = Object.fromEntries(keys.map((key) => [key, Boolean(map.get(key)?.draft)])) as Record<SettingKey, boolean>;
  const versions = Object.fromEntries(keys.map((key) => [key, map.get(key)?.version ?? 0])) as Record<SettingKey, number>;
  return { settings, hasDraft, versions };
}

/** Duyuru çubuğu tarih aralığında mı? (render dışında hesaplanır) */
export function isPromoActive(promo: Settings["promo"], now = Date.now()) {
  if (!promo.enabled || !promo.text) return false;
  if (promo.startsAt && Date.parse(promo.startsAt) > now) return false;
  if (promo.endsAt && Date.parse(promo.endsAt) < now) return false;
  return true;
}
