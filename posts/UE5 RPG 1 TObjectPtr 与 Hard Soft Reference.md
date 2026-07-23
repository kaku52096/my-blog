---
title: UE5 RPG（一）TObjectPtr, Hard/Soft Reference
slug: UE-RPG-1
date: 2026-7-2
tags: [UE]
---
# TObjectPtr

```c++
UPROPERTY()
AActor* ActorPtr; 	// old
TObjectPtr<AActor> ActorPtr;
```

`TObjectPtr`是 UE5 推出的智能指针包装，取代传统 C++ 裸指针。它只作用于成员变量，用于函数输入参数和本地变量时会直接转化成原始指针（raw pointer）。目前对成员指针变量使用`TObjectPtr`已经成为一种硬性规范。`TObjectPtr`支持访问追踪（Access Tracking）和延迟解析（Lazy Loading）。

## 访问追踪

当在代码中通过 `TObjectPtr` 去读取或操作对象时，`TObjectPtr` 的内部拦截机制能够记录：

- **谁在什么时候访问了这个对象？**
- **这个对象在运行时是否真的被有效使用过？**

引擎可以精准得知渲染或逻辑流程中资产的实际访问顺序，从而在 Cook 打包时优化包体资源在磁盘上的排序（将按顺序访问的资产存放在紧邻的位置），大幅提升读取速度。UE5 引入了更高效的垃圾回收机制，`TObjectPtr` 可以协助记录对象的“可达性”（Reachability），防止被引用的对象被 GC 错误回收。也能找到没有使用过的冗余资产。

## 延迟解析

IDE（VS Code, Rider, Visual Studio）仅仅处理文本，这里代码没有运行，也就不会加载 UE 资产。Unreal Editor（虚幻编辑器）本身是一个庞大的 3D 实时渲染程序，引擎必须把场景、模型、材质等资产读取到内存（RAM）和显存（VRAM）中，并由 GPU 进行实时绘制。在 UE4 及之前的版本中，如果一个对象包含裸指针成员变量（`UPROPERTY() UStaticMesh* Mesh;`），当该对象在编辑器中被载入内存时，引用的 `Mesh` 资产往往需要同步被解析并加载进来。而在 UE5 的 `TObjectPtr` 中，指针内部存储的不一定是一个直接的内存地址，而可以是一个资产句柄（Handle/Object ID）。未访问时只保留引用信息，先不把真实的内存地址解析出来，也不触发不必要的急切加载（Eager Load）。第一次尝试解引用（例如调用 `Mesh->GetBounds()`）时，`TObjectPtr` 会重载 `operator->` 或 `operator*`，自动将句柄解析为真正的 `UObject*` 内存指针。

当构建项目时，`TObjectPtr`会自动转化成 raw pointer，因此它只作用于 Unreal Editor，提升开发体验，并不影响项目实际运行时的性能。与实际运行表现相关的是 Hard / Soft Reference。

# Hard Reference

## 什么时候产生 Hard Reference

<p align="center">
  <img src="figures/ue_rpg_1/cast.png" width="800px" />
</p>

<p align="center">
  <img src="figures/ue_rpg_1/ref.png" width="800px" />
</p>

<p align="center">
  <img src="figures/ue_rpg_1/sizemap.png" width="800px" />
</p>

在蓝图 TestActor 中 cast BP_ThirdPersonCharacter 时，BP_ThirdPersonCharacter 必须先加载以使用其函数和变量。此时打开 TestActor 的 size map 发现 BP_ThirdPersonCharacter 占据大部分内存。TestActor 加载时，BP_ThirdPersonCharacter 也会一并加载，无论是否被使用，类似情况就是 Hard Reference。每当加载一个资产时，它所依赖的所有资产也会加载到内存中，这会导致内存使用量迅速增加。

<p align="center">
  <img src="figures/ue_rpg_1/other.png" width="1200px" />
</p>


使用类引用 `TSubclassOf<>`、对象引用 `TObjectPtr<>` 或者向接口传递蓝图对象引用也会创建 Hard Reference，接口解决的是类型耦合（不必依赖具体 `UClass`），但引用强度取决于你怎么持有对象，而不是是否用了接口。如果父类拥有 Mesh, Textures，子类继承父类也会对父类的资产创建 Hard Reference。Hard Reference 的优点在于：引用简单，保证对象一定被加载。缺点是可能导致不必要的内存浪费。

## 如何避免 Hard Reference

- 在 BP parent class 中只写逻辑
- cast to native C++ 类或开销小的 BP parent class
- 避免在接口传递 BP 对象引用

# Soft Reference

Soft Reference 是指向运行时设置的资产、对象或类的一种间接指针。指针只保留路径，资源在被使用时才进行加载。Soft Reference 的访问速度通常比 Hard Reference 慢，因为它们需要在运行时进行额外查找才能找到资产、对象或类。在 UE 中使用 `TSoftObjectPtr`, `TSoftClassPtr`, `TSoftAssetPtr` 创建 Soft Reference。优点在于可以减少不必要的内存占用，缺点是可能因为资源未加载导致冲突，以及需要注意手动加载资源。

<p align="center">
  <img src="figures/ue_rpg_1/load.png" width="800px" />
</p>


如何使用 Hard Ref 还是 Soft Ref 取决于对象的性质。对于关键对象应该使用 Hard Ref 确保稳定加载，不是时刻必要的对象则可以使用 Soft Ref 节省运行时的内存开销。









