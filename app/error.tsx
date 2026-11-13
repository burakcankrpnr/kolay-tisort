"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-5xl">Sayfa yüklenemedi</h1>
      <p className="mt-3 max-w-md">Bağlantı veya sunucu tarafında bir sorun var. Yeniden dene.</p>
      <button type="button" onClick={reset} className="mt-6 h-11 bg-ink px-4 text-sm text-paper">
        Yeniden dene
      </button>
    </div>
  );
}
