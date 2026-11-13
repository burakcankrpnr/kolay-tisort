import { MessageCircle } from "lucide-react";

/** Sabit WhatsApp destek butonu; numara panelde boşsa hiç render edilmez. */
export function WhatsAppButton({ phone }: { phone: string }) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile destek"
      className="fixed right-4 bottom-20 z-40 grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 md:bottom-6"
    >
      <MessageCircle size={22} />
    </a>
  );
}
