import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/seo";

type Crumb = { href?: string; label: string };

/** Tüm iç sayfalarda ortak başlık: breadcrumb + üst etiket + H1 + kısa açıklama. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  crumbs,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
  className?: string;
}) {
  const base = siteUrl();
  return (
    <header className={`pt-8 pb-10 md:pt-12 md:pb-14 ${className}`}>
      {crumbs?.length ? (
        <>
          <nav aria-label="Konum" className="mb-6 text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1">
              {crumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1">
                  {index > 0 ? <ChevronRight size={14} aria-hidden="true" /> : null}
                  {crumb.href ? (
                    <Link href={crumb.href} className="link-underline hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-foreground">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: crumbs.map((crumb, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: crumb.label,
                ...(crumb.href ? { item: `${base}${crumb.href}` } : {}),
              })),
            }}
          />
        </>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          {eyebrow ? <p className="font-display text-sm font-semibold tracking-widest text-primary uppercase">{eyebrow}</p> : null}
          <h1 className="text-h1 mt-2">{title}</h1>
          {lede ? <div className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lede}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
