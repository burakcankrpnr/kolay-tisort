import type { Metadata } from "next";
import { SoonPage } from "@/components/soon-page";

export const metadata: Metadata = { title: "Hazır Tasarımlar" };

export default function MarketplacePage() {
  return (
    <SoonPage
      title="Hazır Tasarımlar"
      body="Tasarımcı vitrini henüz açılmadı. Satın alınabilir hazır tasarım bu sayfada yok."
    />
  );
}
