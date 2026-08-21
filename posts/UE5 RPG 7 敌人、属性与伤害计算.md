---
title: UE5 RPG（七）属性与伤害计算
slug: UE-RPG-7
date: 2026-8-21
tags: [UE, GameplayAbilitySystem]
---

# 需求分析

上一节完成了攻击动作，但动作还不会影响目标。本节要补全一条最小伤害链路：

- 输入：主角正在播放攻击动画，武器与敌人发生接触。
- 输出：系统确认一次有效命中，计算伤害，并减少敌人的当前生命值。

这条链路拆成四个环节：

1. 让敌人成为可以持有 GAS 属性和能力的战斗单位。
2. 用动画时间窗控制武器何时可以命中。
3. 把命中转换成带上下文的伤害 GameplayEffect。
4. 计算伤害，并把结果安全地写入生命值。

UI 最终应该监听生命值变化。本节先用屏幕日志验证数值，正式 UI 留到后续实现。

# 实现拆分

## 1. 建立敌人战斗单位

`AWarriorEnemyCharacter` 继承 `AWarriorBaseCharacter`。因此主角和敌人都拥有 ASC 和 `UWarriorAttributeSet`，可以进入同一套 GAS 计算。

敌人设置 `AutoPossessAI = PlacedInWorldOrSpawned`。无论敌人是关卡中预先放置，还是运行时生成，引擎都会创建 AI Controller 并 Possess 它。`PossessedBy` 随后初始化 ASC，并异步加载敌人的 StartUpData。

StartUpData 使用 `TSoftObjectPtr`。软引用只保存资产路径，不要求角色加载时立即加载数据。敌人可能批量生成，因此使用异步加载可以减少集中卡顿。

### 概念解析：Pawn、Controller 与 Movement

角色存在三套方向：

- Actor Rotation：角色身体朝向。
- Control Rotation：Controller 的观察或瞄准方向。
- Movement Direction：移动组件收到的移动方向。

`bOrientRotationToMovement` 只让身体朝向移动方向。它不会修改 Controller。敌人可以一边看向玩家，一边沿寻路方向移动。

### 概念解析：共用 AttributeSet

主角和敌人共用的是 AttributeSet 的**定义**，不是同一份数据。每个角色都有自己的 AttributeSet 实例。

统一属性名后，伤害公式可以稳定地读取 Source 的 `AttackPower` 和 Target 的 `DefensePower`。角色之间的差异由初始化 GE 写入不同数值，不需要复制计算代码。

## 2. 用动画控制命中窗口

武器碰撞盒平时是 `NoCollision`。攻击 Montage 中的 ANS 只在刀刃可能接触目标的时间段把它改成 `QueryOnly`，结束时再关闭。

ANS 只能从 Mesh 得到 Owner Actor。它通过 `IPawnCombatInterface` 取得 `UPawnCombatComponent`，再开关当前武器。这样 ANS 不依赖 Hero 或 Enemy 的具体类型，也不需要遍历组件。

武器构造时已经把两个回调绑定到碰撞盒：

- `BeginOverlap` 表示武器进入目标碰撞体。
- `EndOverlap` 表示武器离开目标碰撞体。

武器先过滤非 Pawn 和自身 Instigator，再执行 `OnWeaponHitTarget`。CombatComponent 负责同一次攻击去重，并把有效命中转换成 `Shared.Event.MeleeHit`。

### 概念解析：碰撞的三项配置

UE 碰撞要同时看三项：

- Collision Enabled：是否参与查询或物理。
- Object Type：这个组件是什么。
- Response：它如何回应另一种 Object Type。

近战只需要查询，不需要物理推挤，因此使用 `QueryOnly + Overlap`。两边的 Response 取较弱结果：Ignore 会取消接触；Block 与 Overlap 合并为 Overlap；只有双方都是 Block 才会阻挡。

### 概念解析：Instigator

武器的 Instigator 表示这把武器由哪个 Pawn 主使。它在 Spawn 武器时设置。Overlap 用它排除持有者自己。

Owner 表示对象归谁所有，Instigator 表示行为责任归谁，EffectCauser 表示具体由什么造成效果。近战时三者可能分别是角色、角色和武器。

## 3. 构造并施加伤害 GE

攻击 Ability 等待 `Shared.Event.MeleeHit`。事件 Payload 提供 Instigator 和 Target。命中后，攻击方 ASC 创建伤害 Spec，并把本次攻击的数据写进去：

- 武器基础伤害。
- 轻击或重击类型。
- 当前连段次数。

这些数据不是 GE 资产的固定配置，因此使用 `SetSetByCallerMagnitude`。Tag 是变量名，float 是这次攻击的值。同一张伤害 GE 可以服务不同武器和连段。

Spec 创建完成后，Source ASC 调用 `ApplyGameplayEffectSpecToTarget`，把它应用到 Target ASC。

### 概念解析：CDO、Spec 与 Context

GE 类的 CDO 是固定配方。Spec 是这次施加的运行时数据，包含等级、Context 和 SetByCaller。

Context 记录效果来源，不决定目标。目标由 Apply API 决定：

- `ApplyGameplayEffectToSelf` 把初始化 GE 用在自己身上。
- `ApplyGameplayEffectSpecToTarget` 把伤害 Spec 用在敌人身上。

`AddInstigator(Instigator, EffectCauser)` 分别记录逻辑主使和具体造成效果的对象。它用于归属、GameplayCue 和后续查询，不负责选择 Target。

## 4. 计算并结算伤害

`UGEExecCalc_DamageTaken` 负责纯伤害公式。它读取：

- Source 的 `AttackPower`。
- Target 的 `DefensePower`。
- Spec 中 SetByCaller 的基础伤害和连段。

`RelevantAttributesToCapture` 声明 Execution 需要读取哪些 Attribute。`AttemptCalculateCapturedAttributeMagnitude` 根据 Capture 定义取得聚合值。`EvaluateParameters` 提供 Source 和 Target 的 Tag，用于判断带 Tag 条件的 Modifier 是否生效。没有 Tag 时，仍然可以读取普通的 AttackPower 和 DefensePower。

计算结果不直接写 `CurrentHealth`，而是输出到 Meta Attribute `DamageTaken`。`PostGameplayEffectExecute` 收到它后再执行：

```c++
NewHealth = Clamp(CurrentHealth - DamageTaken, 0.f, MaxHealth);
```

`DamageTaken` 表示一次伤害事件，不是需要长期保存的角色状态。`CurrentHealth` 才是 UI 和其他系统应该监听的属性。

### 概念解析：Modifier、Execution 与 Duration

简单的单属性修改使用 Modifier。需要同时读取攻击方、目标和本次攻击参数时，使用 Execution。

伤害 GE 使用 Instant。扣掉的生命值必须保留。如果把伤害做成有时限的临时 Modifier，效果结束后生命值会恢复。

# 设计动机与取舍

## 将命中和伤害分开

碰撞层只回答「打中了谁」。GAS 层回答「造成多少伤害」。这样以后把 Box Overlap 换成 Trace，不需要修改伤害公式；调整攻防公式，也不需要修改动画和碰撞。

代价是调用链更长。调试时应按顺序检查：ANS 是否开窗、Overlap 是否触发、Gameplay Event 是否发送、Spec 是否有效、Target ASC 是否存在。

## 用接口获取 CombatComponent

ANS 通过 `IPawnCombatInterface` 获取组件，而不是 Cast 到具体 Character，也不是每次遍历组件。收益是 Hero、Enemy 和后续 Pawn 都能复用同一 ANS。

接口适合表达「这个 Actor 能提供战斗组件」。如果只有一个固定角色且永不扩展，直接引用会更简单，但会增加具体类型耦合。

## 用 DamageTaken 作为中间属性

Execution 只计算伤害，AttributeSet 统一处理扣血、Clamp，以及后续的护盾、死亡和受击反应。所有伤害来源都向 `DamageTaken` 投递，不必重复生命值规则。

代价是多一个 Meta Attribute 和一次 Post 处理。若项目只有一种极简单伤害，直接修改 `CurrentHealth` 更短；当存在治疗、护盾、免伤或多种伤害来源时，Meta Attribute 更容易维护。

## 共用 AttributeSet

共用 AttributeSet 让主角和敌人使用相同的 Capture 和 GE。代价是敌人可能持有暂时不用的 Rage 属性。只有当双方属性体系和公式出现明显分化时，才值得拆成不同 AttributeSet。

## 判断标准

- 永久伤害使用 Instant，不使用会到期还原的临时 Modifier。
- SetByCaller 的 Tag 必须在 Apply 前写入，否则计算会得到 0。
- 武器需要在 Spawn 时设置 Instigator，否则无法可靠排除自身。
- 异步加载回调应保护 Actor 生命周期，不能默认 `[this]` 一直有效。
- UI 监听 `CurrentHealth`，不要监听只表示一次输入的 `DamageTaken`。
