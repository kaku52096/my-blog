---
title: 用 Next.js 搭建个人博客的完整指南
date: 2026-02-15
summary: 详细介绍如何使用 Next.js 15、Tailwind CSS 和 MDX 搭建一个功能完整的个人博客，包含暗色模式、代码高亮、文章搜索等特性。
tags: [Next.js, React, 教程, 博客]
cover: /images/nextjs-blog.jpg
---

# 用 Next.js 搭建个人博客的完整指南

## 项目概述

本教程将带你从零搭建一个现代化的个人博客，具备以下特性：

- ✅ Markdown / MDX 支持
- ✅ 代码语法高亮（Shiki）
- ✅ 暗色模式
- ✅ 文章搜索（Fuse.js）
- ✅ 目录导航（TOC）
- ✅ 标签分类
- ✅ 静态导出（GitHub Pages 友好）

## 环境准备

首先确保你已安装：

- **Node.js** >= 18.17
- **npm** >= 9 或 **pnpm** >= 8

## 初始化项目

```bash
npx create-next-app@latest my-blog \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

## 安装依赖

```bash
npm install next-mdx-remote gray-matter reading-time \
  rehype-pretty-code rehype-slug rehype-autolink-headings \
  remark-gfm shiki date-fns next-themes fuse.js
```

## 核心文件结构

```
my-blog/
├── app/
│   ├── layout.tsx        # 根布局（Header、Footer、ThemeProvider）
│   ├── page.tsx          # 首页文章列表
│   ├── blog/[slug]/      # 文章详情页
│   ├── tags/             # 标签页
│   └── search/           # 搜索页
├── components/           # 可复用组件
├── lib/
│   ├── posts.ts          # 文章读取工具函数
│   ├── mdx.ts            # MDX 序列化 & TOC 提取
│   └── config.ts         # 站点配置
└── posts/                # Markdown 文章目录
```

## 文章 Frontmatter 规范

每篇文章的元数据通过 YAML frontmatter 定义：

```yaml
---
title: 文章标题
date: 2026-02-21
summary: 文章摘要，显示在列表页和 SEO 描述中
tags: [标签1, 标签2]
cover: /images/cover.jpg  # 可选封面图
---
```

## 部署到 GitHub Pages

1. 在 `next.config.ts` 中设置 `output: "export"`
2. 推送代码到 GitHub 仓库
3. 在仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支
4. GitHub Actions 会自动构建并部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

## 小结

通过本教程，你已经搭建了一个功能完整、样式现代的个人博客。接下来你可以：

1. 修改 `lib/config.ts` 中的站点信息
2. 在 `posts/` 目录下添加自己的文章
3. 推送到 GitHub，开启自动部署

Happy blogging! 🎉
