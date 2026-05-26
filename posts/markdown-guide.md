---
title: Markdown 完整语法指南
date: 2026-02-18
summary: 这篇文章介绍 Markdown 的常用语法，包括标题、列表、代码块、表格、引用等，是写作的必备参考。
tags: [Markdown, 教程, 写作]
---

# Markdown 完整语法指南

Markdown 是一种轻量级标记语言，用简洁的语法让你专注于内容本身。

## 基础语法

### 标题

使用 `#` 号定义标题，`#` 越多，标题级别越小：

```markdown
# 一级标题
## 二级标题
### 三级标题
```

### 文字样式

| 语法 | 效果 |
|------|------|
| `**粗体**` | **粗体** |
| `*斜体*` | *斜体* |
| `~~删除线~~` | ~~删除线~~ |
| `` `行内代码` `` | `行内代码` |

### 链接与图片

```markdown
[链接文字](https://example.com)
![图片描述](image.jpg)
```

## 列表

### 无序列表

- 苹果
- 香蕉
- 橙子
  - 脐橙
  - 血橙

### 有序列表

1. 第一步：安装依赖
2. 第二步：配置环境
3. 第三步：启动服务

### 任务列表

- [x] 已完成的任务
- [ ] 待完成的任务
- [ ] 另一个待完成的任务

## 代码

### 行内代码

使用 `npm install` 安装依赖。

### 代码块

支持语言语法高亮：

```javascript
const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

console.log(fibonacci(10)); // 55
```

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
```

## 引用

> 这是一段引用文字。
>
> 可以包含多个段落。

## 表格

| 姓名 | 年龄 | 职业 |
|:-----|:----:|-----:|
| 张三 | 28 | 工程师 |
| 李四 | 32 | 设计师 |
| 王五 | 25 | 产品经理 |

（左对齐 | 居中 | 右对齐）

## 分割线

---

## 转义字符

使用反斜杠 `\` 转义特殊字符：`\*` `\_` `\#` `\[` `\]`

---

掌握这些基础语法，你就能写出结构清晰、格式美观的 Markdown 文章了！
