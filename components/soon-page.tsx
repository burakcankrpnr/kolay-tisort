import Link from "next/link";

export function SoonPage({ title, body }: { title: string; body: string }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="text-h1">{title}</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{body}</p>
      <Link href="/urunler" className="mt-8 inline-flex h-12 items-center rounded-control bg-foreground px-6 text-sm font-semibold text-background">
        Ürünlere dön
      </Link>
    </article>
  );
}
