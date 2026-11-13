"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { addReview } from "@/server/actions/marketplace";
import { textareaClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId }: { productId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const [pending, start] = useTransition();
  if (done) {
    return <p className="mt-6 rounded-card bg-success/10 p-4 text-sm text-success">Yorumun için teşekkürler! Onaylandıktan sonra burada görünecek.</p>;
  }
  return (
    <form
      className="mt-6 grid max-w-xl gap-4 rounded-card border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        start(async () => {
          const result = await addReview(productId, rating, String(data.get("body") ?? ""));
          if (result.error) setError(result.error);
          else {
            setError(null);
            form.reset();
            setDone(true);
          }
        });
      }}
    >
      <p className="font-semibold">Yorum yaz</p>
      <div role="radiogroup" aria-label="Puan" className="flex gap-1" onMouseLeave={() => setHover(null)}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} yıldız`}
            onMouseEnter={() => setHover(value)}
            onClick={() => setRating(value)}
            className="p-0.5"
          >
            <Star size={26} className={cn("transition-colors", value <= (hover ?? rating) ? "fill-primary text-primary" : "text-input")} />
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor={`review-${productId}`}>
        Yorumun
      </label>
      <textarea
        id={`review-${productId}`}
        name="body"
        required
        minLength={8}
        rows={4}
        className={textareaClass}
        placeholder="Baskı kalitesi, kalıp ve kumaş hakkında ne düşünüyorsun?"
      />
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="h-11 rounded-control bg-foreground text-sm font-semibold text-background disabled:opacity-60">
        {pending ? "Gönderiliyor…" : "Yorumu gönder"}
      </button>
    </form>
  );
}
