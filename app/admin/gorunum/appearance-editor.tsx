"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  bodyFonts,
  contrastRatio,
  displayFonts,
  effectCatalog,
  effectLevelLabels,
  effectLevels,
  effectNames,
  fontLabels,
  type SettingKey,
  type Settings,
} from "@/lib/settings-schema";
import { cn } from "@/lib/utils";
import {
  discardSettingDraft,
  publishSetting,
  rollbackSetting,
  saveSettingDraft,
  setSettingsPreview,
  type SettingsActionResult,
} from "@/server/actions/settings";

type History = { key: string; version: number; at: string }[];

const sectionLabels: Record<SettingKey, string> = {
  brand: "Marka",
  theme: "Tema",
  effects: "Efektler",
  promo: "Duyuru çubuğu",
};

const devices = [
  { id: "desktop", label: "Masaüstü", width: 1280, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Mobil", width: 390, icon: Smartphone },
] as const;

export function AppearanceEditor({
  initial,
  hasDraft,
  versions,
  preview,
  history,
}: {
  initial: Settings;
  hasDraft: Record<SettingKey, boolean>;
  versions: Record<SettingKey, number>;
  preview: boolean;
  history: History;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [status, setStatus] = useState<Partial<Record<SettingKey, SettingsActionResult>>>({});
  const [pending, start] = useTransition();
  const [device, setDevice] = useState<(typeof devices)[number]["id"]>("desktop");
  const [frameKey, setFrameKey] = useState(0);

  function update<K extends SettingKey>(key: K, patch: Partial<Settings[K]>) {
    setValues((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }

  function run(key: SettingKey, action: () => Promise<SettingsActionResult>) {
    start(async () => {
      const result = await action();
      setStatus((current) => ({ ...current, [key]: result }));
      setFrameKey((value) => value + 1);
      router.refresh();
    });
  }

  const { brand, theme, effects, promo } = values;
  const contrast = contrastRatio(theme.primary, theme.primaryForeground);
  const textContrast = contrastRatio(theme.background, theme.foreground);

  const actions = (key: SettingKey) => (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
      <Button type="button" size="sm" loading={pending} onClick={() => run(key, () => saveSettingDraft(key, values[key]))}>
        Taslak kaydet
      </Button>
      <Button type="button" size="sm" variant="primary" disabled={pending || !hasDraft[key]} onClick={() => run(key, () => publishSetting(key))}>
        Yayınla
      </Button>
      {hasDraft[key] ? (
        <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => run(key, () => discardSettingDraft(key))}>
          Taslağı sil
        </Button>
      ) : null}
      <span className="ml-auto text-xs text-muted-foreground">
        Yayındaki sürüm: {versions[key] || "varsayılan"}
        {hasDraft[key] ? " · yayınlanmamış taslak var" : ""}
      </span>
      {status[key] ? (
        <p role="status" className={cn("w-full text-sm", status[key]?.ok ? "text-success" : "text-destructive")}>
          {status[key]?.message}
        </p>
      ) : null}
      {history.some((item) => item.key === key) ? (
        <details className="w-full text-sm">
          <summary className="cursor-pointer text-muted-foreground">Sürüm geçmişi</summary>
          <ul className="mt-2 space-y-1">
            {history
              .filter((item) => item.key === key)
              .map((item) => (
                <li key={item.version} className="flex items-center justify-between gap-2">
                  <span>
                    Sürüm {item.version} · {item.at}
                  </span>
                  {item.version !== versions[key] ? (
                    <button
                      type="button"
                      className="underline"
                      disabled={pending}
                      onClick={() => run(key, () => rollbackSetting(key, item.version))}
                    >
                      Bu sürüme dön
                    </button>
                  ) : (
                    <span className="text-muted-foreground">yayında</span>
                  )}
                </li>
              ))}
          </ul>
        </details>
      ) : null}
    </div>
  );

  return (
    <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-6">
        <Panel id="marka" title={sectionLabels.brand}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Marka adı">
              <input className={inputClass} value={brand.name} maxLength={40} onChange={(e) => update("brand", { name: e.target.value })} />
            </Field>
            <Field label="Alan adı">
              <input className={inputClass} value={brand.domain} onChange={(e) => update("brand", { domain: e.target.value })} />
            </Field>
            <Field label="Slogan" className="sm:col-span-2">
              <input className={inputClass} value={brand.slogan} onChange={(e) => update("brand", { slogan: e.target.value })} />
            </Field>
            <Field label={`Açıklama (${brand.description.length}/300) — meta açıklama ve footer`} className="sm:col-span-2">
              <textarea className={cn(inputClass, "h-24 py-2")} value={brand.description} maxLength={300} onChange={(e) => update("brand", { description: e.target.value })} />
            </Field>
            <Field label="Destek e-postası">
              <input className={inputClass} type="email" value={brand.email} onChange={(e) => update("brand", { email: e.target.value })} />
            </Field>
            <Field label="WhatsApp numarası (boşsa buton gizli)">
              <input className={inputClass} inputMode="tel" placeholder="905xxxxxxxxx" value={brand.whatsapp} onChange={(e) => update("brand", { whatsapp: e.target.value })} />
            </Field>
            <Field label="Instagram adresi" className="sm:col-span-2">
              <input className={inputClass} placeholder="https://instagram.com/..." value={brand.instagram} onChange={(e) => update("brand", { instagram: e.target.value })} />
            </Field>
          </div>
          {actions("brand")}
        </Panel>

        <Panel id="tema" title={sectionLabels.theme}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Vurgu rengi (CTA)" value={theme.primary} onChange={(v) => update("theme", { primary: v })} />
            <ColorField label="Vurgu üstü metin" value={theme.primaryForeground} onChange={(v) => update("theme", { primaryForeground: v })} />
            <ColorField label="Zemin (açık)" value={theme.background} onChange={(v) => update("theme", { background: v })} />
            <ColorField label="Metin (açık)" value={theme.foreground} onChange={(v) => update("theme", { foreground: v })} />
            <ColorField label="Çizgi (açık)" value={theme.border} onChange={(v) => update("theme", { border: v })} />
            <ColorField label="Zemin (koyu)" value={theme.darkBackground} onChange={(v) => update("theme", { darkBackground: v })} />
            <ColorField label="Metin (koyu)" value={theme.darkForeground} onChange={(v) => update("theme", { darkForeground: v })} />
            <ColorField label="Çizgi (koyu)" value={theme.darkBorder} onChange={(v) => update("theme", { darkBorder: v })} />
          </div>
          <ContrastNote label="Buton metni kontrastı" ratio={contrast} min={4.5} />
          <ContrastNote label="Gövde metni kontrastı" ratio={textContrast} min={4.5} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Başlık fontu">
              <select className={inputClass} value={theme.displayFont} onChange={(e) => update("theme", { displayFont: e.target.value as Settings["theme"]["displayFont"] })}>
                {displayFonts.map((font) => (
                  <option key={font} value={font}>
                    {fontLabels[font]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Gövde fontu">
              <select className={inputClass} value={theme.bodyFont} onChange={(e) => update("theme", { bodyFont: e.target.value as Settings["theme"]["bodyFont"] })}>
                {bodyFonts.map((font) => (
                  <option key={font} value={font}>
                    {fontLabels[font]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Köşe stili">
              <Segmented
                value={theme.radius}
                options={[
                  ["sharp", "Keskin"],
                  ["soft", "Yumuşak"],
                  ["round", "Yuvarlak"],
                ]}
                onChange={(v) => update("theme", { radius: v as Settings["theme"]["radius"] })}
              />
            </Field>
            <Field label="Varsayılan tema">
              <Segmented
                value={theme.mode}
                options={[
                  ["system", "Sistem"],
                  ["light", "Açık"],
                  ["dark", "Koyu"],
                ]}
                onChange={(v) => update("theme", { mode: v as Settings["theme"]["mode"] })}
              />
            </Field>
          </div>
          {actions("theme")}
        </Panel>

        <Panel id="efektler" title={sectionLabels.effects}>
          <Field label="Efekt yoğunluğu">
            <Segmented
              value={effects.level}
              options={effectLevels.map((level) => [level, effectLevelLabels[level]])}
              onChange={(v) => update("effects", { level: v as Settings["effects"]["level"] })}
            />
          </Field>
          <p className="mt-2 text-xs text-muted-foreground">
            Kapalı: yalnızca temel geçişler · Hafif: fade, hover, mikro etkileşimler · Normal: + scroll animasyonları, tilt, marquee ·
            Şov: + parallax, özel imleç, magnetic buton, sayfa geçişleri. Hareketi azalt tercihi olan ziyaretçilerde efektler her zaman kapalıdır.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Mobil için yoğunluk">
              <select className={inputClass} value={effects.mobileLevel} onChange={(e) => update("effects", { mobileLevel: e.target.value as Settings["effects"]["mobileLevel"] })}>
                <option value="inherit">Masaüstü ile aynı</option>
                {effectLevels.map((level) => (
                  <option key={level} value={level}>
                    {effectLevelLabels[level]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Animasyon hızı">
              <Segmented
                value={effects.speed}
                options={[
                  ["slow", "Yavaş"],
                  ["normal", "Normal"],
                  ["fast", "Hızlı"],
                ]}
                onChange={(v) => update("effects", { speed: v as Settings["effects"]["speed"] })}
              />
            </Field>
          </div>
          <h3 className="mt-6 text-sm font-semibold">Tek tek efektler</h3>
          <p className="text-xs text-muted-foreground">“Otomatik” seçili efekt, yoğunluk seviyesine göre açılır.</p>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {effectNames.map((name) => (
              <li key={name} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  {effectCatalog[name].label}
                  <span className="ml-2 text-xs text-muted-foreground">({effectLevelLabels[effectCatalog[name].minLevel]}+)</span>
                </span>
                <Segmented
                  small
                  value={effects.toggles[name] ?? "auto"}
                  options={[
                    ["auto", "Otomatik"],
                    ["on", "Açık"],
                    ["off", "Kapalı"],
                  ]}
                  onChange={(v) => update("effects", { toggles: { ...effects.toggles, [name]: v as "auto" | "on" | "off" } })}
                />
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-semibold">Sayaçlar (ana sayfa)</h3>
          <p className="text-xs text-muted-foreground">Yalnızca doğrulanabilir değerler girin; sahte sosyal kanıt kullanmayın.</p>
          <div className="mt-2 space-y-2">
            {effects.stats.map((stat, index) => (
              <div key={index} className="grid grid-cols-[4rem_5rem_4rem_1fr_auto] gap-2">
                <input aria-label="Ön ek" className={inputClass} value={stat.prefix} onChange={(e) => setStat(index, { prefix: e.target.value })} />
                <input aria-label="Değer" className={inputClass} type="number" step="any" value={stat.value} onChange={(e) => setStat(index, { value: Number(e.target.value) })} />
                <input aria-label="Son ek" className={inputClass} value={stat.suffix} onChange={(e) => setStat(index, { suffix: e.target.value })} />
                <input aria-label="Etiket" className={inputClass} value={stat.label} onChange={(e) => setStat(index, { label: e.target.value })} />
                <button type="button" className="px-2 text-sm underline" onClick={() => update("effects", { stats: effects.stats.filter((_, i) => i !== index) })}>
                  Sil
                </button>
              </div>
            ))}
            {effects.stats.length < 4 ? (
              <button
                type="button"
                className="text-sm underline"
                onClick={() => update("effects", { stats: [...effects.stats, { prefix: "", value: 0, suffix: "", label: "Yeni değer", decimals: 0 }] })}
              >
                Sayaç ekle
              </button>
            ) : null}
          </div>
          {actions("effects")}
        </Panel>

        <Panel id="duyuru" title={sectionLabels.promo}>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={promo.enabled} onChange={(e) => update("promo", { enabled: e.target.checked })} /> Duyuru çubuğu açık
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Metin" className="sm:col-span-2">
              <input className={inputClass} maxLength={160} value={promo.text} onChange={(e) => update("promo", { text: e.target.value })} />
            </Field>
            <Field label="Bağlantı">
              <input className={inputClass} value={promo.href} onChange={(e) => update("promo", { href: e.target.value })} />
            </Field>
            <div />
            <Field label="Başlangıç (boş: hemen)">
              <input className={inputClass} type="datetime-local" value={promo.startsAt} onChange={(e) => update("promo", { startsAt: e.target.value })} />
            </Field>
            <Field label="Bitiş (boş: süresiz)">
              <input className={inputClass} type="datetime-local" value={promo.endsAt} onChange={(e) => update("promo", { endsAt: e.target.value })} />
            </Field>
          </div>
          {actions("promo")}
        </Panel>
      </div>

      <div className="min-w-0 xl:sticky xl:top-24 xl:self-start">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl">Canlı önizleme</h2>
          <div className="flex items-center gap-1">
            {devices.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                aria-pressed={device === id}
                onClick={() => setDevice(id)}
                className={cn("grid size-9 place-items-center rounded-control", device === id ? "bg-foreground text-background" : "hover:bg-muted")}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={preview}
            disabled={pending}
            onChange={(e) =>
              start(async () => {
                await setSettingsPreview(e.target.checked);
                setFrameKey((value) => value + 1);
                router.refresh();
              })
            }
          />
          Taslakları önizle (sadece senin tarayıcında; ziyaretçiler yayındaki hâli görür)
        </label>
        <PreviewFrame key={frameKey} width={devices.find((d) => d.id === device)?.width ?? 1280} />
      </div>
    </div>
  );

  function setStat(index: number, patch: Partial<Settings["effects"]["stats"][number]>) {
    update("effects", { stats: effects.stats.map((stat, i) => (i === index ? { ...stat, ...patch } : stat)) });
  }
}

function PreviewFrame({ width }: { width: number }) {
  // Çerçeve sabit 640px genişliğe ölçeklenir; gerçek kesme noktaları çalışır.
  const box = 640;
  const scale = Math.min(1, box / width);
  return (
    <div className="mt-3 max-w-[640px] overflow-hidden rounded-card border border-border bg-muted" style={{ height: 720 }}>
      <iframe
        title="Site önizlemesi"
        src="/"
        style={{ width, height: 720 / scale, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0 }}
      />
    </div>
  );
}

const inputClass = "h-10 w-full rounded-control border border-input bg-card px-3 text-sm outline-none focus:border-foreground";

function Panel({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="rounded-card border border-border bg-card p-5 md:p-6">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn("grid gap-1.5 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <span className="flex gap-2">
        <input type="color" aria-label={`${label} seçici`} className="h-10 w-12 cursor-pointer rounded-control border border-input bg-card p-1" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} />
        <input className={inputClass} value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} />
      </span>
    </Field>
  );
}

function ContrastNote({ label, ratio, min }: { label: string; ratio: number; min: number }) {
  const ok = ratio >= min;
  return (
    <p className={cn("mt-3 text-sm", ok ? "text-success" : "text-warning")}>
      {label}: {ratio.toFixed(2)}:1 {ok ? "· WCAG AA uygun" : `· WCAG AA için en az ${min}:1 gerekli`}
    </p>
  );
}

function Segmented({
  value,
  options,
  onChange,
  small = false,
}: {
  value: string;
  options: (readonly [string, string])[] | [string, string][];
  onChange: (value: string) => void;
  small?: boolean;
}) {
  return (
    <span role="radiogroup" className="inline-flex flex-wrap rounded-control border border-border p-0.5">
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={cn(
            "rounded-[calc(var(--r-control)-2px)] font-medium transition-colors",
            small ? "h-7 px-2 text-xs" : "h-8 px-3 text-sm",
            value === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </span>
  );
}
