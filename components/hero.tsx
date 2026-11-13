"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Garment } from "@/components/garment";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="grid items-end gap-10 border-b border-line py-12 md:grid-cols-[1.15fr_0.85fr] md:py-20">
      <div>
        <motion.h1
          className="max-w-xl font-display text-6xl leading-[0.88] font-semibold md:text-8xl"
          initial={reduce ? false : { y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          Kendi Tasarımını Giy.
        </motion.h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed">
          Tasarımını yükle, ürününü seç, baskını oluştur. Biz üretelim, kapına gönderelim.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/urunler">Ürününü Tasarla</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dtf-baski">DTF Baskı Oluştur</Link>
          </Button>
        </div>
      </div>
      <Garment kind="TEE" color="#161616" className="mx-auto w-full max-w-sm" />
    </section>
  );
}
