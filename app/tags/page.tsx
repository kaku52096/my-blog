import Link from "next/link";
import type { Metadata } from "next";
import { getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "标签",
  description: "所有文章标签",
};

export default function TagsPage() {
  const tags = getAllTags();
  const sortedTags = Object.entries(tags).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8">
        标签
      </h1>

      {sortedTags.length === 0 ? (
        <p className="text-slate-400">暂无标签</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {sortedTags.map(([tag, count]) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="group flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
            >
              <span className="text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 font-medium">
                {tag}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-1.5 py-0.5">
                {count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
