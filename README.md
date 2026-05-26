# 我的博客

基于 Next.js 15 + Tailwind CSS + MDX 构建的个人博客。

## 功能特性

- 📝 Markdown / MDX 支持
- 🎨 代码语法高亮（Shiki，亮/暗双主题）
- 🌙 暗色模式切换
- 🔍 全文搜索（Fuse.js 模糊搜索）
- 📑 文章目录导航（TOC）
- 🏷️ 标签分类
- 📱 响应式设计
- ⚡ 静态导出，支持 GitHub Pages 部署

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

打开 http://localhost:3000 查看效果。

### 3. 写文章

在 `posts/` 目录下创建 `.md` 或 `.mdx` 文件：

```markdown
---
title: 文章标题
date: 2026-02-21
summary: 文章摘要
tags: [标签1, 标签2]
---

# 正文内容

支持所有 Markdown 语法...
```

## 自定义配置

编辑 `lib/config.ts` 修改站点信息：

```typescript
export const siteConfig = {
  name: "我的博客",          // 博客名称
  description: "...",        // 博客描述
  author: "博主",            // 作者名
  url: "https://...",        // 部署 URL
  github: "https://...",     // GitHub 主页
  email: "your@email.com",   // 邮箱
};
```

## 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 进入仓库 **Settings → Pages**
3. Source 选择 **GitHub Actions**
4. 推送代码后会自动触发构建和部署

> **注意**：如果博客部署在子路径下（如 `username.github.io/repo-name`），需要在 `next.config.ts` 中添加 `basePath: "/repo-name"`。

## 项目结构

```
my-blog/
├── app/                  # Next.js App Router 页面
│   ├── blog/[slug]/      # 文章详情页
│   ├── tags/             # 标签浏览页
│   ├── search/           # 搜索页
│   └── layout.tsx        # 全局布局
├── components/           # React 组件
├── lib/                  # 工具函数
│   ├── posts.ts          # 文章读取
│   ├── mdx.ts            # MDX 处理
│   └── config.ts         # 站点配置 ← 修改这里
└── posts/                # ← 在这里写文章！
```
