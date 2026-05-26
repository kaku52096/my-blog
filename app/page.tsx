import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";
import { siteConfig } from "@/lib/config";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <section className="py-12 mb-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          {siteConfig.name}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          {siteConfig.description}
        </p>
      </section>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg">暂无文章</p>
          <p className="text-sm mt-2">
            在 <code className="text-indigo-500">posts/</code> 目录下创建 .md 或 .mdx 文件开始写作
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
