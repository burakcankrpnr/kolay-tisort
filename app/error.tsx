"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="font-display text-sm font-semibold tracking-widest text-primary uppercase">Bir aksilik oldu</p>
      <h1 className="text-h1 mt-3">Sayfa şu an yüklenemedi.</h1>
      <p className="mx-auto mt-4 max-w-md text-muted-foreground">Bağlantıda ya da sunucuda geçici bir sorun var. Tasarımların ve sepetin güvende; birazdan tekrar dene.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="flex h-12 items-center gap-2 rounded-control bg-foreground px-6 text-sm font-semibold text-background">
          <RotateCcw size={16} /> Yeniden dene
        </button>
        <Link href="/" className="flex h-12 items-center rounded-control border border-input px-6 text-sm font-semibold">
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
