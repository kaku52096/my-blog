import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/posts";
import { extractToc, getMdxOptions, rewritePostAssetPaths } from "@/lib/mdx";
import { formatDate } from "@/lib/utils";
import { MDXRemote } from "next-mdx-remote/rsc";
import { TableOfContents } from "@/components/TableOfContents";
import { siteConfig } from "@/lib/config";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  if (posts.length === 0) {
    return [{ slug: "_" }];
  }
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPost(slug);
    return {
      title: post.title,
      description: post.summary,
      openGraph: {
        title: post.title,
        description: post.summary,
        type: "article",
        publishedTime: post.date,
        url: `${siteConfig.url}/blog/${slug}`,
      },
    };
  } catch {
    return { title: "文章未找到" };
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;

  if (slug === "_") {
    notFound();
  }

  let post;
  try {
    post = getPost(slug);
  } catch {
    notFound();
  }

  const toc = extractToc(post.content);
  const mdxSource = rewritePostAssetPaths(post.content);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="lg:grid lg:grid-cols-[1fr_200px] lg:gap-12">
        {/* Article */}
        <article className="min-w-0">
          {/* Header */}
          <header className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-500 transition-colors mb-6"
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
              返回首页
            </Link>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime}</span>
              {post.tags.length > 0 && (
                <>
                  <span>·</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${encodeURIComponent(tag)}`}
                        className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {post.summary && (
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 leading-relaxed border-l-4 border-indigo-300 dark:border-indigo-700 pl-4">
                {post.summary}
              </p>
            )}
          </header>

          {/* Content */}
          <div className="prose-custom">
            <MDXRemote source={mdxSource} options={getMdxOptions()} />
          </div>
        </article>

        {/* TOC Sidebar */}
        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <TableOfContents toc={toc} />
          </aside>
        )}
      </div>
    </div>
  );
}
