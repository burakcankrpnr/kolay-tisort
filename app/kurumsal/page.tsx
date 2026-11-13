import type { Metadata } from "next";
import { SoonPage } from "@/components/soon-page";

export const metadata: Metadata = { title: "Kurumsal" };

export default function CorporatePage() {
  return (
    <SoonPage
      title="Kurumsal baskı"
      body="Kurumsal teklif formu sıradaki aşamada. Bu sayfadan sipariş alınmıyor."
    />
  );
}
