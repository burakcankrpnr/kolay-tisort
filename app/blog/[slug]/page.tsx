import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { JsonLd } from "@/components/json-ld";
import { prisma } from "@/lib/prisma";
import { clampText, siteUrl } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

const dateFormat = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, deletedAt: null } });
  if (!post) return { title: "Yazı bulunamadı", robots: { index: false } };
  return {
    title: clampText(post.title, 60),
    description: clampText(post.excerpt || post.body, 155),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.createdAt.toISOString(), modifiedTime: post.updatedAt.toISOString() },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, { brand }] = await Promise.all([
    prisma.blogPost.findFirst({ where: { slug, deletedAt: null }, include: { category: true } }),
    getSettings(),
  ]);
  if (!post) notFound();
  const paragraphs = post.body.split("\n").filter(Boolean);
  const words = post.body.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const base = siteUrl();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20">
      <ScrollProgress />
      <p className="text-sm text-muted-foreground">
        <Link href="/blog" className="link-underline">
          Blog
        </Link>
        {post.category ? ` · ${post.category.name}` : ""} · {minutes} dk okuma
      </p>
      <h1 className="text-h1 mt-4">{post.title}</h1>
      {post.excerpt ? <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p> : null}
      <p className="mt-6 border-b border-border pb-6 text-sm text-muted-foreground">
        Güncellendi: <time dateTime={post.updatedAt.toISOString()}>{dateFormat.format(post.updatedAt)}</time>
      </p>
      <div className="mt-8 space-y-5 text-[1.0625rem] leading-[1.75]">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <aside className="mt-14 rounded-card bg-foreground p-8 text-background">
        <p className="font-display text-3xl">Fikrini ürüne dönüştür.</p>
        <p className="mt-2 text-background/70">Tasarımını yükle, fiyatını anında gör.</p>
        <Link href="/tasarla" className="mt-5 inline-flex h-11 items-center rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground">
          Tasarlamaya başla
        </Link>
      </aside>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.createdAt.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          author: { "@type": "Organization", name: brand.name },
          publisher: { "@type": "Organization", name: brand.name, logo: { "@type": "ImageObject", url: `${base}/icon.svg` } },
          mainEntityOfPage: `${base}/blog/${post.slug}`,
        }}
      />
    </article>
  );
}
