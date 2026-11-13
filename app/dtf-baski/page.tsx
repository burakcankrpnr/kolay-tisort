import type { Metadata } from "next";
import { SoonPage } from "@/components/soon-page";

export const metadata: Metadata = { title: "DTF Baskı" };

export default function DtfPage() {
  return (
    <SoonPage
      title="DTF Baskı"
      body="DTF tabaka siparişi bir sonraki aşamada açılacak. Bu sayfadan baskı alınmıyor. Şimdilik hazır ürünlerden sipariş verebilirsin."
    />
  );
}
