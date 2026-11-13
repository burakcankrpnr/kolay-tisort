import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-5xl">Sayfa yok</h1>
      <p className="mt-3">Bu adres Katman’da bir sayfaya çıkmıyor.</p>
      <Link href="/" className="mt-6 inline-block underline">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
