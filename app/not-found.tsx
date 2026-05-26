import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-24">
      <h1 className="text-8xl font-bold text-slate-200 dark:text-slate-700 mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        页面未找到
      </h2>
      <p className="text-slate-400 mb-8">
        您访问的页面不存在或已被删除。
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
