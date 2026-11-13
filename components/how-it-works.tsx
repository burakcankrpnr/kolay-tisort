"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ImageUp, Move, ShoppingBag } from "lucide-react";
import { Garment } from "@/components/garment";
import { useFx } from "@/components/effects/effects-provider";
import { cn } from "@/lib/utils";

const steps = [
  { title: "Yükle", body: "PNG, JPG veya SVG dosyanı sürükle. Çözünürlüğü anında kontrol ederiz; 300 DPI altında seni uyarırız.", icon: ImageUp },
  { title: "Yerleştir", body: "Baskı alanı santimetre ölçüsüyle işaretli. Sürükle, büyüt, döndür; hizalama kılavuzları yerine oturtur.", icon: Move },
  { title: "Önizle", body: "Kumaş dokusu ve gölgeyle gerçekçi önizleme. Fiyat her değişiklikte canlı güncellenir.", icon: Check },
  { title: "Sipariş ver", body: "Ödeme onaylanınca baskı üretime girer. 3 iş gününde kargoya teslim edilir.", icon: ShoppingBag },
];

/**
 * Sticky hikâye: kaydırdıkça soldaki adım vurgulanır, sağdaki sahne adıma göre değişir.
 * Efekt kapalıysa adımlar sade bir liste olarak görünür.
 */
export function HowItWorks() {
  const sticky = useFx("stickyStory");
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (!sticky) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [sticky]);

  return (
    <section className="border-b border-border" aria-labelledby="nasil-calisir">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-28">
        <div>
          <p className="font-display text-sm font-semibold tracking-widest text-primary">04 — SÜREÇ</p>
          <h2 id="nasil-calisir" className="text-h1 mt-3 max-w-md">
            Dört adımda kendi ürünün.
          </h2>
          <ol className={cn("mt-10", sticky && "md:mt-[20vh] md:mb-[20vh]")}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const on = !sticky || active === index;
              return (
                <li
                  key={step.title}
                  ref={(el) => {
                    refs.current[index] = el;
                  }}
                  data-step={index}
                  className={cn(
                    "border-t border-border py-6 transition-opacity duration-500",
                    sticky && "md:min-h-[38vh]",
                    on ? "opacity-100" : "opacity-35",
                  )}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-sm tabular-nums text-muted-foreground">0{index + 1}</span>
                    <div>
                      <h3 className="flex items-center gap-3 font-display text-3xl md:text-4xl">
                        <Icon size={22} className={cn("transition-colors", on ? "text-primary" : "")} aria-hidden="true" />
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="hidden md:block">
          <div className="sticky top-28 flex aspect-[4/5] items-center justify-center overflow-hidden rounded-card border border-border bg-card">
            <StepScene step={sticky ? active : 2} />
          </div>
        </div>
      </div>
    </section>
  );
}

function StepScene({ step }: { step: number }) {
  return (
    <div className="relative size-full p-10" aria-hidden="true">
      {/* Baskı alanı çerçevesi */}
      <div className="absolute inset-0 grid place-items-center">
        <Garment kind="TEE" color="#EDEBE6" print={step >= 1} className="w-[70%] transition-all duration-700" />
      </div>
      <div
        className={cn(
          "absolute top-[34%] left-1/2 h-[30%] w-[26%] -translate-x-1/2 rounded-md border-2 border-dashed border-primary transition-opacity duration-500",
          step === 1 ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute inset-x-10 top-10 rounded-card border border-dashed border-foreground/30 bg-background/90 p-6 text-center text-sm backdrop-blur transition-all duration-500",
          step === 0 ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        )}
      >
        <ImageUp className="mx-auto mb-2 text-primary" />
        tasarim.png · 4200 × 4800 px
        <span className="mt-2 block font-semibold text-success">● 300+ DPI · Baskıya hazır</span>
      </div>
      <div
        className={cn(
          "absolute right-8 bottom-8 left-8 flex items-center justify-between rounded-card bg-foreground px-5 py-4 text-background transition-all duration-500",
          step >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        <span className="text-sm">{step === 3 ? "Sipariş alındı" : "Canlı fiyat"}</span>
        <span className="font-display text-2xl">{step === 3 ? "✓" : "Ön baskı dahil"}</span>
      </div>
    </div>
  );
}
