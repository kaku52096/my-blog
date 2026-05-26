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

export function getAllPostSlugs(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""));
}

export function getAllPosts(): PostMeta[] {
  const slugs = getAllPostSlugs();
  const posts = slugs.map((slug) => getPostMeta(slug));
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostMeta(slug: string): PostMeta {
  const fullPath = resolvePostPath(slug);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    summary: data.summary ?? data.description ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: stats.text,
    cover: data.cover,
  };
}

export function getPost(slug: string): Post {
  const fullPath = resolvePostPath(slug);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    summary: data.summary ?? data.description ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: stats.text,
    cover: data.cover,
    content,
  };
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

function resolvePostPath(slug: string): string {
  const mdPath = path.join(postsDirectory, `${slug}.md`);
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
  if (fs.existsSync(mdxPath)) return mdxPath;
  return mdPath;
}
