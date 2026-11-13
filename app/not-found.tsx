import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Garment } from "@/components/garment";

export default function NotFound() {
  return (
    <div className="relative isolate mx-auto grid max-w-[1280px] items-center gap-10 overflow-hidden px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
      <div>
        <p className="font-display text-sm font-semibold tracking-widest text-primary uppercase">Hata 404</p>
        <h1 className="text-display mt-3">Bu sayfa baskıya girmemiş.</h1>
        <p className="mt-5 max-w-md text-lg text-muted-foreground">Aradığın adres taşınmış ya da hiç var olmamış olabilir. Şuradan devam edebilirsin:</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn-fill flex h-12 items-center gap-2 rounded-control bg-foreground px-6 text-sm font-semibold text-background hover:text-primary-foreground">
            Ana sayfa <ArrowRight size={16} className="btn-arrow" />
          </Link>
          <Link href="/urunler" className="flex h-12 items-center rounded-control border border-input px-6 text-sm font-semibold">
            Ürünler
          </Link>
          <Link href="/tasarla" className="flex h-12 items-center rounded-control border border-input px-6 text-sm font-semibold">
            Tasarla
          </Link>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
        <p className="absolute inset-0 grid place-items-center font-display text-[9rem] font-bold text-foreground/[0.06]">404</p>
        <Garment kind="TEE" color="#E8E6E1" print={false} className="float-soft relative w-full drop-shadow-2xl" />
      </div>
    </div>
  );
}
