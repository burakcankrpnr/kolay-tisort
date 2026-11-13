import Link from "next/link";

export function SoonPage({ title, body }: { title: string; body: string }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-5xl leading-none md:text-7xl">{title}</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed">{body}</p>
      <Link href="/urunler" className="mt-8 inline-flex h-11 items-center bg-ink px-4 text-sm text-paper">
        Ürünlere dön
      </Link>
    </article>
  );
}
