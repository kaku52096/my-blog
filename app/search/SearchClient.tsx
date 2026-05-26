"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { PostCard } from "@/components/PostCard";
import type { PostMeta } from "@/lib/posts";

interface SearchClientProps {
  posts: PostMeta[];
}

export function SearchClient({ posts }: SearchClientProps) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: "title", weight: 3 },
          { name: "summary", weight: 2 },
          { name: "tags", weight: 1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [posts]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse]);

  return (
    <div>
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章标题、摘要、标签..."
          autoFocus
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {query.trim() === "" ? (
        <div className="text-center py-16 text-slate-400">
          <p>输入关键词开始搜索</p>
          <p className="text-sm mt-1">共 {posts.length} 篇文章</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p>
            未找到与 <span className="text-slate-600 dark:text-slate-300 font-medium">&ldquo;{query}&rdquo;</span> 相关的文章
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-slate-400 mb-4">
            找到 {results.length} 篇相关文章
          </p>
          {results.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
