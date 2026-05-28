import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** 将 posts/ 下的相对图片路径转为网站可访问的 /figures/... */
export function rewritePostAssetPaths(content: string): string {
  return content
    .replace(/\]\(\.\/figures\//g, "](/figures/")
    .replace(/\]\(figures\//g, "](/figures/")
    .replace(/src="\.\/figures\//g, 'src="/figures/')
    .replace(/src="figures\//g, 'src="/figures/');
}

export async function serializeMdx(
  content: string
): Promise<MDXRemoteSerializeResult> {
  return serialize(rewritePostAssetPaths(content), {
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
  });
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
