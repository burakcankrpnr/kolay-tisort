"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileText, LayoutDashboard, Layers, Package, Palette, Paintbrush, ShoppingCart, Tag, Type } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Özet", href: "/admin", icon: LayoutDashboard },
  { label: "Siparişler", href: "/admin/siparisler", icon: ShoppingCart },
  { label: "Ürünler", href: "/admin/urunler", icon: Package },
  { label: "İlanlar", href: "/admin/ilanlar", icon: Palette },
  { label: "DTF", href: "/admin/dtf", icon: Layers },
  { label: "Kurumsal", href: "/admin/kurumsal", icon: Building2 },
  { label: "Kuponlar", href: "/admin/kuponlar", icon: Tag },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "İçerik", href: "/admin/icerik", icon: Type },
  { label: "Görünüm", href: "/admin/gorunum", icon: Paintbrush },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Yönetim menüsü" className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
      {links.map(({ label, href, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-foreground text-background" : "text-foreground/75 hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={17} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
