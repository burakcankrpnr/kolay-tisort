import { prisma } from "@/lib/prisma";
import { createPost } from "@/server/actions/admin";

export default async function AdminBlog() {
  const posts = await prisma.blogPost.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-5xl">Blog</h1>
      <form action={createPost} className="mt-6 grid max-w-xl gap-2">
        <input name="title" required placeholder="Başlık" className="h-11 border border-ink px-3" />
        <input name="excerpt" placeholder="Kısa özet" className="h-11 border border-ink px-3" />
        <textarea name="body" required minLength={40} className="h-40 border border-ink p-3" placeholder="Yazı" />
        <button className="h-11 bg-ink text-paper">Yazıyı yayınla</button>
      </form>
      <ul className="mt-8 text-sm">
        {posts.map((post) => (
          <li key={post.id} className="border-b border-line py-2">
            {post.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
