import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { basePath } from "@/lib/config";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** 将 posts/ 下的相对图片路径转为网站可访问的 /figures/... */
export function rewritePostAssetPaths(content: string): string {
  const prefix = basePath ? `${basePath}/figures/` : "/figures/";

  return content
    .replace(/\]\(\.\/figures\//g, `](${prefix}`)
    .replace(/\]\(figures\//g, `](${prefix}`)
    .replace(/src="\.\/figures\//g, `src="${prefix}`)
    .replace(/src="figures\//g, `src="${prefix}`);
}

export function getMdxOptions(): MDXRemoteProps["options"] {
  return {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: {
              className: ["anchor"],
              ariaLabel: "Link to section",
            },
          },
        ],
        [
          rehypePrettyCode,
          {
            theme: {
              dark: "github-dark",
              light: "github-light",
            },
            keepBackground: false,
            defaultLang: "plaintext",
          },
        ],
      ],
      format: "mdx",
    },
  };
}

export function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    toc.push({ id, text, level });
  }

  return toc;
}
