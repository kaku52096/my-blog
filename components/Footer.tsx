import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t py-6 mt-12">
      <div className="container mx-auto px-4 max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()} {siteConfig.author}. 保留所有权利。
        </p>
        <p>
          用{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-500 transition-colors"
          >
            Next.js
          </a>{" "}
          &{" "}
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-500 transition-colors"
          >
            Tailwind CSS
          </a>{" "}
          构建
        </p>
      </div>
    </footer>
  );
}
