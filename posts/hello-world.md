---
title: 你好，世界！
date: 2026-02-21
summary: 这是我的第一篇博客文章，记录我搭建这个博客的过程和初衷。
tags: [随笔, 博客]
---

# 你好，世界！

欢迎来到我的博客！这是第一篇文章，记录一下搭建博客的初衷。

## 为什么要写博客？

写博客有以下几个原因：

1. **记录学习过程** — 好记性不如烂笔头，记录下来方便以后回顾
2. **分享知识** — 将自己的经验分享给需要的人
3. **倒逼输出** — 要写清楚一件事，首先自己得理解透彻
4. **建立影响力** — 在技术社区留下自己的痕迹

## 博客技术栈

这个博客使用了以下技术：

- **Next.js 15** — React 框架，支持静态导出
- **Tailwind CSS** — 原子化 CSS 框架
- **MDX** — Markdown + JSX，支持在文章中嵌入 React 组件
- **Shiki** — 代码高亮，支持多种主题

### 代码示例

下面是一段 TypeScript 代码：

```typescript title="hello.ts"
interface Greeting {
  name: string;
  language?: string;
}

function greet({ name, language = "zh" }: Greeting): string {
  const greetings: Record<string, string> = {
    zh: "你好",
    en: "Hello",
    ja: "こんにちは",
  };
  return `${greetings[language] ?? "Hi"}, ${name}!`;
}

console.log(greet({ name: "世界" })); // 你好, 世界!
```

## 接下来的计划

- [ ] 写更多技术文章
- [ ] 分享读书笔记
- [ ] 记录生活随感

> 千里之行，始于足下。每天进步一点点，坚持下去就是胜利。

感谢你的阅读，欢迎常来！
