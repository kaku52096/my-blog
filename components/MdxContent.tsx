"use client";

import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";

const components = {
  // Custom MDX components can be added here
};

interface MdxContentProps {
  source: MDXRemoteSerializeResult;
}

export function MdxContent({ source }: MdxContentProps) {
  return <MDXRemote {...source} components={components} />;
}
