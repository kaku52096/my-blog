import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { siteConfig } from "@/lib/config";
import { SearchButton } from "./SearchButton";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-5xl h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {siteConfig.name}
        </Link>

        <nav className="hidden sm:flex items-center gap-1 text-sm">
          <NavLink href="/">首页</NavLink>
          <NavLink href="/tags">标签</NavLink>
          <NavLink href="/search">搜索</NavLink>
        </nav>

        <div className="flex items-center gap-1">
          <SearchButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {children}
    </Link>
  );
}
