import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { SearchClient } from "./SearchClient";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索所有文章",
};

export default function SearchPage() {
  const posts = getAllPosts();

  const searchData = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    tags: p.tags,
    date: p.date,
    readingTime: p.readingTime,
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
        搜索
      </h1>
      <SearchClient posts={searchData} />
    </div>
  );
}
