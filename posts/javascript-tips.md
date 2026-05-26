---
title: JavaScript 实用技巧：让代码更优雅
date: 2026-02-10
summary: 分享 10 个提升 JavaScript 代码质量和开发效率的实用技巧，涵盖解构赋值、可选链、空值合并等现代语法。
tags: [JavaScript, 编程技巧, 前端]
---

# JavaScript 实用技巧：让代码更优雅

## 1. 解构赋值

解构让代码更简洁：

```javascript
// 对象解构
const { name, age, city = "北京" } = user;

// 数组解构
const [first, second, ...rest] = array;

// 函数参数解构
function greet({ name, age }) {
  return `${name}, ${age}岁`;
}

// 嵌套解构
const { address: { street, city } } = user;
```

## 2. 可选链 `?.`

避免因 `null` 或 `undefined` 导致的报错：

```javascript
// 旧写法
const city = user && user.address && user.address.city;

// 新写法
const city = user?.address?.city;

// 函数调用
const result = obj?.method?.();

// 数组访问
const first = arr?.[0];
```

## 3. 空值合并 `??`

只有在值为 `null` 或 `undefined` 时才使用默认值：

```javascript
// ?? 与 || 的区别
const count = 0;
console.log(count || 10);  // 10（0 被认为是假值）
console.log(count ?? 10);  // 0（0 不是 null/undefined）

const name = "" ;
console.log(name || "匿名");  // "匿名"
console.log(name ?? "匿名");  // ""（空字符串不是 null/undefined）
```

## 4. 逻辑赋值运算符

```javascript
// ||= 只在左侧为假值时赋值
user.name ||= "匿名用户";

// &&= 只在左侧为真值时赋值
user.profile &&= updateProfile(user.profile);

// ??= 只在左侧为 null/undefined 时赋值
user.settings ??= getDefaultSettings();
```

## 5. Promise 并行处理

```javascript
// 串行（慢）
const user = await fetchUser(id);
const posts = await fetchPosts(userId);

// 并行（快）
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(userId),
]);

// 处理部分失败
const results = await Promise.allSettled([
  fetchUser(id),
  fetchPosts(userId),
]);

results.forEach((result) => {
  if (result.status === "fulfilled") {
    console.log(result.value);
  } else {
    console.error(result.reason);
  }
});
```

## 6. 数组方法链式调用

```javascript
const result = users
  .filter((u) => u.age >= 18)
  .map((u) => ({ name: u.name, email: u.email }))
  .sort((a, b) => a.name.localeCompare(b.name))
  .slice(0, 10);
```

## 7. 对象简写语法

```javascript
const name = "Alice";
const age = 28;

// 属性简写
const user = { name, age };

// 方法简写
const obj = {
  greet() {
    return `Hello, ${this.name}`;
  },
  // 计算属性名
  [`key_${Date.now()}`]: "value",
};
```

## 8. 展开运算符的妙用

```javascript
// 合并数组
const merged = [...arr1, ...arr2];

// 浅拷贝对象
const copy = { ...original };

// 覆盖属性
const updated = { ...user, age: 30 };

// 函数参数
Math.max(...numbers);
```

## 9. Set 去重

```javascript
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)]; // [1, 2, 3, 4]

// 两数组的交集
const intersection = arr1.filter((x) => new Set(arr2).has(x));

// 两数组的差集
const difference = arr1.filter((x) => !new Set(arr2).has(x));
```

## 10. 函数式工具

```javascript
// 记忆化（缓存计算结果）
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const memoFib = memoize(function fib(n) {
  if (n <= 1) return n;
  return memoFib(n - 1) + memoFib(n - 2);
});
```

---

这些技巧都来自 ES2020+ 的现代 JavaScript 特性，在所有现代浏览器和 Node.js 中都有完整支持。希望对你的日常开发有所帮助！
