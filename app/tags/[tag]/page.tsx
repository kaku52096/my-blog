import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  const tagNames = Object.keys(tags);

  // 静态导出要求至少返回一个参数，否则会构建失败
  if (tagNames.length === 0) {
    return [{ tag: "_" }];
  }

  return tagNames.map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `标签：${decodedTag}`,
    description: `所有关于 ${decodedTag} 的文章`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  if (decodedTag === "_") {
    notFound();
  }

  const posts = getPostsByTag(decodedTag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/tags"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-500 transition-colors mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          所有标签
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          #{decodedTag}
        </h1>
        <p className="mt-1 text-slate-400 text-sm">{posts.length} 篇文章</p>
      </div>

      <div>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
