import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  readingTime: string;
  cover?: string;
}

export interface Post extends PostMeta {
  content: string;
}

export function decodePostSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function getAllPostFileSlugs(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""));
}

function resolvePostPath(fileSlug: string): string {
  const mdPath = path.join(postsDirectory, `${fileSlug}.md`);
  const mdxPath = path.join(postsDirectory, `${fileSlug}.mdx`);
  if (fs.existsSync(mdxPath)) return mdxPath;
  return mdPath;
}

function parsePost(fileSlug: string): Post {
  const fullPath = resolvePostPath(fileSlug);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);
  const slug =
    typeof data.slug === "string" && data.slug.trim()
      ? data.slug.trim()
      : fileSlug;

  return {
    slug,
    title: data.title ?? fileSlug,
    date: data.date
      ? new Date(data.date).toISOString()
      : new Date().toISOString(),
    summary: data.summary ?? data.description ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: stats.text,
    cover: data.cover,
    content,
  };
}

function getAllPostsUnsorted(): Post[] {
  return getAllPostFileSlugs().map((fileSlug) => parsePost(fileSlug));
}

function findPost(slug: string): Post | undefined {
  const decodedSlug = decodePostSlug(slug);
  return getAllPostsUnsorted().find((post) => post.slug === decodedSlug);
}

export function getAllPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

export function getAllPosts(): PostMeta[] {
  return getAllPostsUnsorted()
    .map(({ content: _content, ...meta }) => meta)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function getPostMeta(slug: string): PostMeta {
  const post = findPost(slug);
  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }
  const { content: _content, ...meta } = post;
  return meta;
}

export function getPost(slug: string): Post {
  const post = findPost(slug);
  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }
  return post;
}

export function getAllTags(): Record<string, number> {
  const posts = getAllPosts();
  const tagCount: Record<string, number> = {};
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] ?? 0) + 1;
    });
  });
  return tagCount;
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}
