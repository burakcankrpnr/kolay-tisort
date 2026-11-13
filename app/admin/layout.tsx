import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/server/guard";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: "Yönetim", robots: { index: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="mx-auto grid max-w-site gap-6 px-4 py-6 sm:px-6 xl:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:py-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 hidden rounded-card border border-border bg-card p-4 lg:block">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Yönetim</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{session.user.email}</p>
        </div>
        <AdminNav />
      </aside>
      <div className="admin-ui min-w-0">{children}</div>
    </div>
  );
}
