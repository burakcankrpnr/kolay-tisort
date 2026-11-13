import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog: Tişört Tasarımı ve DTF Baskı Rehberi",
  description: "Baskı dosyası hazırlama, DTF tabaka dizimi, kumaş ve kalıp seçimi, kurumsal baskı ipuçları.",
  alternates: { canonical: "/blog" },
};

const dateFormat = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where: { deletedAt: null, ...(kategori ? { category: { slug: kategori } } : {}) },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  const [featured, ...rest] = posts;
  const minutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).length / 200));

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
      <PageHeader eyebrow="Blog" title="Baskı rehberi" lede="Dosya hazırlamaktan kumaş seçimine; daha iyi baskı için bilmen gerekenler." crumbs={[{ href: "/", label: "Ana sayfa" }, { label: "Blog" }]} />
      {categories.length ? (
        <nav aria-label="Blog kategorileri" className="mb-8 flex gap-2 overflow-x-auto pb-1">
          <Link href="/blog" className={cn("shrink-0 rounded-full border px-4 py-1.5 text-sm", !kategori ? "border-foreground bg-foreground text-background" : "border-border")}>
            Tümü
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog?kategori=${category.slug}`}
              className={cn("shrink-0 rounded-full border px-4 py-1.5 text-sm", kategori === category.slug ? "border-foreground bg-foreground text-background" : "border-border")}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      ) : null}

      {!featured ? (
        <div className="rounded-card border border-dashed border-border px-6 py-16 text-center">
          <BookOpen size={34} className="mx-auto text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-muted-foreground">Bu kategoride henüz yazı yok.</p>
        </div>
      ) : (
        <>
          <Link href={`/blog/${featured.slug}`} className="fx-spot group relative block overflow-hidden rounded-card bg-foreground p-8 text-background md:p-12">
            <p className="text-sm text-background/60">
              {featured.category?.name ?? "Rehber"} · {minutes(featured.body)} dk · {dateFormat.format(featured.createdAt)}
            </p>
            <h2 className="text-h1 mt-4 max-w-3xl">{featured.title}</h2>
            <p className="mt-4 max-w-2xl text-background/70">{featured.excerpt}</p>
            <span className="mt-8 inline-flex items-center gap-1.5 font-semibold">
              Yazıyı oku <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </span>
          </Link>
          {rest.length ? (
            <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, index) => (
                <Reveal as="li" key={post.id} stagger={index % 3}>
                  <Link href={`/blog/${post.slug}`} className="fx-card group flex h-full flex-col rounded-card border border-border bg-card p-6">
                    <p className="text-xs text-muted-foreground">
                      {post.category?.name ?? "Rehber"} · {minutes(post.body)} dk
                    </p>
                    <h2 className="mt-3 font-display text-2xl leading-tight">{post.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                    <span className="mt-auto flex items-center gap-1 pt-6 text-sm font-semibold">
                      Oku <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}
