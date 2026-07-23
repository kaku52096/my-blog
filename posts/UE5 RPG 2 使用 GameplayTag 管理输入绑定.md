---
title: UE5 RPG（二）使用 GameplayTag 管理输入绑定
slug: UE-RPG-2
date: 2026-7-6
tags: [UE, GameplayTag, Input Binding]
---
# TestMap & PlayerCharacter

创建一个空的 UE C++ 工程，在 Content 中加入 Third Person Pack，使用 Maps 文件夹中的地图作为开发的测试场景。在 Project Settings / Maps & Modes / Default Maps 中将 Editor Startup Map 和 Game Default Map 两项设置为该地图，之后我们会在这个场景中测试开发内容。

<p align="center">
  <img src="figures/ue_rpg_2/testmap.png" width="800px" />
</p>
准备好测试场景之后，需要先设置 Game Mode 里的 Character 和 Controller 两项。

## Game Mode

继承 Game Mode Base 创建 WarriorBaseGameMode，GameMode 负责的是游戏规则和关卡流程，下面要修改的是其中 `DefaultPawnClass`, `PlayerControllerClass` 两个属性。当玩家加入游戏、重生，或调用 `RestartPlayer()` 时，GameMode 会按 `DefaultPawnClass` 生成一个 Pawn。玩家连接后，GameMode 会为该玩家生成一个 PlayerController，负责接收输入（键鼠、手柄），控制 Pawn。基于 WarriorBaseGameMode 创建蓝图 BP_GameModeBase，在 ProjectSetting / Maps & Modes 中将 Default GameMode 设置为 BP_GameModeBase。同时注意在 World Settings 中 GameMode 一栏将 GameMode Override 设置为 None，不然会覆盖 ProjectSettings 中的设置。

## Controller

继承 PlayerController 创建 WarriorHeroController，暂不修改，直接创建蓝图 BP_HeroController。在 BP_GameModeBase 中将 `PlayerControllerClass` 设为 BP_HeroController。

## Character

继承 Character 创建 WarriorBaseCharacter，在构造函数中进行一些优化。`PrimaryActorTick` 是 UE 里 Actor 自己的 Tick 调度器，Tick 用于处理每帧逻辑。 `PrimaryActorTick` 决定这个 Actor 的 Tick 要不要跑、多久跑一遍、一开始是否启用。对于 Character 而言，移动主要由 `UCharacterMovementComponent` 负责，输入一般由 `PlayerController` 处理，再传给 Character / MovementComponent。动画主要更新在 `UAnimInstance`, `SkeletalMeshComponent`。这些核心功能不依赖 Character 自身的 Tick，都由各个组件完成，因此这里设置 `bCanEverTick` 关闭 Tick 以节省性能。设置 `bReceivesDecals` 关闭在 Character 的 Mesh 上渲染贴花，节省 Decal 渲染，避免贴花在角色身上变形。

```c++
// Characters/WarriorBaseCharacter.h
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "WarriorBaseCharacter.generated.h"

UCLASS()
class WARRIOR_API AWarriorBaseCharacter : public ACharacter
{
	GENERATED_BODY()
public:
	AWarriorBaseCharacter();
};

// WarriorBaseCharacter.cpp
AWarriorBaseCharacter::AWarriorBaseCharacter()
{
    PrimaryActorTick.bCanEverTick = false;
    PrimaryActorTick.bStartWithTickEnabled = false;
    GetMesh()->bReceivesDecals = false;
}
```

继承 WarriorBaseCharacter 创建 WarriorHeroCharacter，这是我们的主控角色，使用第三人称视角。在构造函数中创建 `SpringArmComponent`, `CameraComponent` 两个组件。`SpringArmComponent` 组件使用弹簧臂控制相机位置和距离 player 的距离，将其挂载到根节点，将相机挂载到弹簧臂上，通过 `SocketOffset` 修改相机相对弹簧臂的挂载位置。玩家输入由 `Controller` 组件处理，在第三人称视角中，可以使用鼠标移动输入改变相机观察的视角，但是角色并不随之转动，因此将 `bUseControllerRotationPitch`, `bUseControllerRotationRoll`, `bUseControllerRotationYaw` 三个属性设置为 false，修改弹簧臂 `bUsePawnControlRotation` 属性，使弹簧臂接收 `Controller` 的旋转输入。相机是弹簧臂的子节点，当弹簧臂旋转时，相机旋转也会随之改变。当角色与相机之间有物体遮挡时，弹簧臂会伸缩距离，使相机移动到遮挡物体之前以避免遮蔽。使用 `GetCharacterMovement()` 调整一些移动参数，让 Character 始终转向移动方向，`RotationRate` 控制转速，`MaxWalkSpeed` 控制移速， `BrakingDecelerationWalking` 控制移动停止时角色移速归零的速度。

<p align="center">
  <img src="figures/ue_rpg_2/camera.png" width="800px" />
</p>



```c++
// Characters/WarriorHeroCharacter.h
#pragma once
#include "CoreMinimal.h"
#include "Characters/WarriorBaseCharacter.h"
#include "WarriorHeroCharacter.generated.h"

class USpringArmComponent;
class UCameraComponent;

UCLASS()
class WARRIOR_API AWarriorHeroCharacter : public AWarriorBaseCharacter
{
	GENERATED_BODY()
public:
	AWarriorHeroCharacter();
private:
#pragma region Components
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<USpringArmComponent> CameraBoom;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UCameraComponent> FollowCamera;
#pragma endregion
};

// WarriorHeroCharacter.cpp
#include "Characters/WarriorHeroCharacter.h"
#include "Components/CapsuleComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/CharacterMovementComponent.h"

AWarriorHeroCharacter::AWarriorHeroCharacter()
{
    GetCapsuleComponent()->InitCapsuleSize(42.f, 96.f);

    bUseControllerRotationPitch = false;
    bUseControllerRotationRoll = false;
    bUseControllerRotationYaw = false;

    CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
    CameraBoom->SetupAttachment(GetRootComponent());
    CameraBoom->TargetArmLength = 200.f;
    CameraBoom->SocketOffset = FVector(0.f, 55.f, 65.f);
    CameraBoom->bUsePawnControlRotation = true;

    FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
    FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
    FollowCamera->bUsePawnControlRotation = false;

    GetCharacterMovement()->bOrientRotationToMovement = true;
    GetCharacterMovement()->RotationRate = FRotator(0.f, 500.f, 0.f);
    GetCharacterMovement()->MaxWalkSpeed = 400.f;
    GetCharacterMovement()->BrakingDecelerationWalking = 2000.f;
}
```

C++本身没有反射系统，UE 为了运行时获得类和属性的信息，实现了一套反射系统。上面代码中 `UCLASS()` 将该类暴露给 UE，`GENERATED_BODY()` 是一个添加反射代码的宏。`UPROPERTY() / UFUNCTION()` 决定属性/函数在蓝图、UE 编辑器中是否可见、可修改，以及分类等等。编译时会检查 C++ public / protected / private 访问属性与编辑器、蓝图可见性之间的冲突，这里两个组件写在 private 中，但是 `VisibleAnywhere` 说明要在 UE Detail 面板中展示这个组件，`BlueprintReadOnly` 说明可以在蓝图中读取这个组件，如果不用 `meta = (AllowPrivateAccess = "true")` 编译会报错。

UE C++ 有强制命名规范，Actor 类型命名必须以 A 开头，如 `AWarriorBaseCharacter`，表示这是场景中的一个对象。组件命名以 U 开头，表示这是组件，如 `USpringArmComponent`；枚举以 E 开头，基础类型以 F 开头，如 `FVector2D`。对于使用指针表示的组件，可以在 header file 中使用前置声明 `class USpringArmComponent;` 然后在 cpp 文件中 include 对应的头文件，避免循环引用。但如果不是指针，编译时必须知道类型的 byte size，就要在头文件中添加引用。UE 项目由多个模块构成，在模块化构建下，多数模块会各自编译成动态库 .dll，每个模块有自己的模块名_API 宏（由构建系统根据 `IMPLEMENT_MODULE` / 模块名生成），这里 `WARRIOR_API` 就是一个模块宏。编译定义该符号的模块时，宏变成导出 `dllexport` ；编译依赖该符号的模块时，宏变为导入 `dllimport`，使这个类型/函数可以跨模块链接使用。

基于 WarriorHeroCharacter 创建蓝图 BP_HeroCharacter。然后在 BP_GameModeBase 中将  `DefaultPawnClass` 设置为 BP_HeroCharacter。

<p align="center">
  <img src="figures/ue_rpg_2/setup.png" width="800px" />
</p>
# Input GameplayTag

在完成测试场景和角色设置后开始处理用户输入。UE 使用 Input Action 来抽象用户的输入意图，Input Action 并不代表具体的按键输入，而是一种操作，例如 `IA_Look`, `IA_Move`。在 Input Action 文件中可以设置输入的 `ValueType`。然后在 Input Mapping Context（IMC）中将 Input Action 绑定到具体的按键输入，使用 modifiers 修改输入值。在 WarriorHeroCharcter 中获取 `UEnhancedInputLocalPlayerSubsystem` ，选择 IMC 文件，并为 Input Action 绑定一个用于处理用户输入的函数。当用户进行输入时，Character 根据 IMC 文件中定义的按键触发与相应 Input Action 绑定的函数。

如果项目中有很多 Input Action，很容易发生混淆，难以管理，类似的还有角色的状态、属性等。在没有 GameplayTag 时，通常使用 bool 或 Enum 枚举判断一个角色的状态或属性，bool 会产生复杂的 if-else 嵌套，而枚举难以表达同时存在多个状态。使用 GameplayTag 可以给命名提供一个层级逻辑关系，类似 `InputTag.Move`, `InputTag.Look`，游戏开发中的许多复杂逻辑都会变得更清晰。这种层级关系意味着你可以轻松做粗粒度或细粒度的筛选，查找 `InputTag` 会匹配所有的输入标签，查找 `InputTag.Move` 可以匹配到具体的 Input Action。UE 底层将 GameplayTag 映射为了 `FName`。在运行时，标签匹配是高效的整数/散列值对比，不是昂贵的字符串比较。引入 GameplayTag 本质上在 Input Action 资产与绑定函数之间加了一层抽象，让 C++ 中不用硬编码资产，直接在编辑器中修改数据配置文件即可。

新建一个空的 C++ 文件 WarriorGameplayTags，删去所有代码。在命名空间 WarriorGameplayTags 中声明和实现 InputTag。GamePlayTag 使用 “.” 来表示层级关系， `UE_DEFINE_GAMEPLAY_TAG` 的第二个参数就是在编辑器中看到的 Tag 名称。在 ProjectSettings / GameplayTags / Manage GameplayTags 中可以看到刚才添加的 InputTag。

```c++
// WarriorGameplayTags.h
#pragma once
#include "NativeGameplayTags.h"
namespace WarriorGameplayTags 
{
    /** Input Tags **/
    WARRIOR_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(InputTag_Move);
    WARRIOR_API UE_DECLARE_GAMEPLAY_TAG_EXTERN(InputTag_Look);
}

// WarriorGameplayTags.cpp
#include "WarriorGameplayTags.h"
namespace WarriorGameplayTags
{
    /** Input Tags **/
    UE_DEFINE_GAMEPLAY_TAG(InputTag_Move, "InputTag.Move");
    UE_DEFINE_GAMEPLAY_TAG(InputTag_Look, "InputTag.Look");
}
```

<p align="center">
  <img src="figures/ue_rpg_2/input_tag.png" width="800px" />
</p>
# DataAsset InputConfig

目前我们定义了两个 InputTag，还没有和相应的 Input Action 关联。UE 中使用 `DataAsset` 存储游戏配置数据，将“数据”与“逻辑（蓝图/C++类）”彻底分离。继承 Data Asset 创建 DataAsset_InputConfig。这个类只负责配置 IMC 文件，以及 Tag 和 Input Action 之间的对应关系。使用一个结构体 `FWarriorInputActionConfig` 关联 Tag 和 Input Action，并提供一个根据 Tag 查找 Input Action 的函数 `(UInputAction*)FindNativeInputActionByTag(const FGameplayTag&)`。

```c++
// DataAssets/Input/DataAsset_InputConfig.h
#pragma once
#include "CoreMinimal.h"
#include "Engine/DataAsset.h"
#include "GameplayTagContainer.h"
#include "DataAsset_InputConfig.generated.h"

class UInputAction;
class UInputMappingContext;

USTRUCT(BlueprintType)
struct FWarriorInputActionConfig
{
	GENERATED_BODY()
public:
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, meta = (Categories = "InputTag"))
	FGameplayTag InputTag;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
	TObjectPtr<UInputAction> InputAction;
};

UCLASS()
class WARRIOR_API UDataAsset_InputConfig : public UDataAsset
{
	GENERATED_BODY()
public:
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
	TObjectPtr<UInputMappingContext> DefaultMappingContext;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, meta = (TitleProperty = "InputAction"))
	TArray<FWarriorInputActionConfig> NativeInputActions;

	UInputAction* FindNativeInputActionByTag(const FGameplayTag& InInputTag) const;
};

// DataAsset_InputConfig.cpp
#include "DataAssets/Input/DataAsset_InputConfig.h"
UInputAction* UDataAsset_InputConfig::FindNativeInputActionByTag(const FGameplayTag& InInputTag) const
{
    for (const FWarriorInputActionConfig& InputActionConfig : NativeInputActions)
    {
        if (InputActionConfig.InputTag == InInputTag && InputActionConfig.InputAction)
        {
            return InputActionConfig.InputAction;
        }
    }
    return nullptr;
}
```

在编辑器中基于 DataAsset_InputConfig 创建一个 Data Asset 并配置 IMC，关联 IA 和 InputTag。这里 IA, IMC 使用之前添加的 Third Pack 中已有的文件。
<p align="center">
  <img src="figures/ue_rpg_2/inputconfig.png" width="1200px" />
</p>

# Input Binding

目前我们已经自定义了 InputTags，创建 DataAsset_InputConfig 配置 IMC 文件，与 Tag 对应的 IA 文件。我们希望使用一个专门处理输入绑定的组件将绑定逻辑从 Hero Character 中分离，它应该提供一个实现输入绑定的函数让 Character 调用。

继承 `EnhancedInputComponent` 创建 WarriorInputComponent。使用模板函数 `BindNativeInputAction` 在输入参数 InputConfig 中查找与 Tag 对应的 Input Action，并与提供的 Callback Function 绑定。这里使用模板是因为与 IA 绑定的输入处理函数具有不同的输入输出类型，因此函数签名不同。`TriggerEvent` 指定了输入的触发方式，`ContextObject` 指向调用这个函数的对象实例，调用时一般用 this 指针。

在 UE Enhanced Input System（增强输入系统）底层，绑定输入事件需要知道两件事：

- **要执行哪个函数？**（CallbackFunc Func）
- **在哪个具体的对象实例上执行这个函数？**（UserObject* ContextObject）

通过模板在编译时自动推导出 `CallbackFunc `，`UserObject` 的类型，可以让不同的使用者调用不同的函数。

```c++
// Component/Input/WarriorInputComponent.h
#pragma once
#include "CoreMinimal.h"
#include "EnhancedInputComponent.h"
#include "DataAssets/Input/DataAsset_InputConfig.h"
#include "WarriorInputComponent.generated.h"

UCLASS()
class WARRIOR_API UWarriorInputComponent : public UEnhancedInputComponent
{
	GENERATED_BODY()
public:
	template<class UserObject, typename CallbackFunc>
	void BindNativeInputAction(const UDataAsset_InputConfig* InInputConfig, const FGameplayTag& InInputTag, ETriggerEvent TriggerEvent, UserObject* ContextObject, CallbackFunc Func);
};

template<class UserObject, typename CallbackFunc>
inline void UWarriorInputComponent::BindNativeInputAction(const UDataAsset_InputConfig* InInputConfig, const FGameplayTag& InInputTag, ETriggerEvent TriggerEvent, UserObject* ContextObject, CallbackFunc Func)
{
	checkf(InInputConfig, TEXT("Input config data asset is null, can not proceed with binding"));
	if (UInputAction* FoundAction = InInputConfig->FindNativeInputActionByTag(InInputTag))
	{
		BindAction(FoundAction, TriggerEvent, ContextObject, Func);
	}
}
```

在 Editor ProjectSettings / Input 中将 Default Input Component Class 从 `EnhancedInputComponent` 修改为 `WarriorInputComponent`。子类对象可以 cast 成父类指针，父类对象不一定能 cast 成子类指针，这里 `UWarriorInputComponent` 继承自 `UEnhancedInputComponent`，如果默认为角色创建 `EnhancedInputComponent` ，下面 WarriorHeroCharacter 类在 SetupPlayerInputComponent 函数中对输入参数 InputComponent 进行 cast 转换时会失败。

<p align="center">
  <img src="figures/ue_rpg_2/inputcomponent.png" width="1200px" />
</p>
# Callback Function & SetupPlayerInputComponent

`SetupPlayerInputComponent` 是 `APawn` 提供的一个核心虚函数。当游戏开始或玩家切换控制角色时，PlayerController 执行 `Possess(Pawn)` 控制相应的 Pawn/Character，引擎底层为该 Pawn 创建/初始化 UInputComponent 组件，自动调用 Pawn->SetupPlayerInputComponent(InputComponent)。在这个函数中完成输入绑定的逻辑。

重载 `SetupPlayerInputComponent` 函数，使用 `LocalPlayer` 获取 `UEnhancedInputLocalPlayerSubsystem`，为当前角色绑定 IMC，将 `PlayerInputComponent` 转换成我们刚才创建的 `WarriorInputComponent` 类型，调用 `BindNativeInputAction` 函数绑定 Tag 和输入处理函数。

在 UE 中，网络架构是“客户端-服务器（Client-Server）”模式，`APlayerController` 是逻辑上的控制器。一个服务器上可以有 100 个 `APlayerController` 实例，代表 100 个玩家的控制权。`ULocalPlayer`（本地玩家）代表本地硬件层面的玩家实体，它直接管理屏幕 viewport（视口）、音频输出、本地输入设备（键盘、鼠标、手柄）以及本地玩家的配置。因此需要通过 `ULocalPlayer` 获取 `UEnhancedInputLocalPlayerSubsystem`，然后绑定 IMC 映射。`AddMappingContext` 的第二个参数是权重，可以绑定多个权重不同的 IMC 文件，当按键映射冲突时，权重越大则优先覆盖。

在 WarriorHeroCharacter 中实现处理用户输入的 `Input_Look`，`Input_Move` 回调函数。`FInputActionValue` 是用户输入的默认类型，通过 `Get<FVector2D>` 提取特定的类型。在 `Input_Move` 中，我们只需要角色的水平方向 `MovementRotation(0.f, Controller->GetControlRotation().Yaw, 0.f)` ，然后取前向 `FVector::ForwardVector` 和右向 `FVector::RightVector` 分别作为 2D 输入 `Y-X` 的方向。

```c++
// Characters/WarriorHeroCharacter.h
// ......
class UDataAsset_InputConfig;
struct FInputActionValue;

UCLASS()
class WARRIOR_API AWarriorHeroCharacter : public AWarriorBaseCharacter
{
	GENERATED_BODY()
public:
	AWarriorHeroCharacter();
protected:
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;
    
//...... 
#pragma region Input
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "CharacterData", meta = (AllowPrivateAccess = "true"))
	TObjectPtr<UDataAsset_InputConfig> InputConfigDataAsset;
	void Input_Move(const FInputActionValue& InputActionValue);
	void Input_Look(const FInputActionValue& InputActionValue);
#pragma endregion
};

// WarriorHeroCharacter.cpp
// ......
void AWarriorHeroCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);
    checkf(InputConfigDataAsset, TEXT("Forget to assign a valid data asset as input config"));
    
    ULocalPlayer* LocalPlayer = GetController<APlayerController>()->GetLocalPlayer();
    UEnhancedInputLocalPlayerSubsystem* Subsystem = ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(LocalPlayer);
    check(Subsystem);
    Subsystem->AddMappingContext(InputConfigDataAsset->DefaultMappingContext, 0);
    
    UWarriorInputComponent* WarriorInputComponent = CastChecked<UWarriorInputComponent>(PlayerInputComponent);
    WarriorInputComponent->BindNativeInputAction(InputConfigDataAsset, WarriorGameplayTags::InputTag_Move, ETriggerEvent::Triggered, this, &ThisClass::Input_Move);
    WarriorInputComponent->BindNativeInputAction(InputConfigDataAsset, WarriorGameplayTags::InputTag_Look, ETriggerEvent::Triggered, this, &ThisClass::Input_Look);
}

void AWarriorHeroCharacter::Input_Move(const FInputActionValue& InputActionValue)
{
    const FVector2D MovementVector = InputActionValue.Get<FVector2D>();
    const FRotator MovementRotation(0.f, Controller->GetControlRotation().Yaw, 0.f);
    if (MovementVector.Y != 0.f)
    {
        const FVector ForwardDirection = MovementRotation.RotateVector(FVector::ForwardVector);
        AddMovementInput(ForwardDirection, MovementVector.Y);
    }
    if (MovementVector.X != 0.f)
    {
        const FVector RightDirection = MovementRotation.RotateVector(FVector::RightVector);
        AddMovementInput(RightDirection, MovementVector.X);
    }
}

void AWarriorHeroCharacter::Input_Look(const FInputActionValue& InputActionValue)
{
    const FVector2D LookAxisVector = InputActionValue.Get<FVector2D>();
    if (LookAxisVector.X != 0.f)
    {
        AddControllerYawInput(LookAxisVector.X);
    }
    if (LookAxisVector.Y != 0.f)
    {
        AddControllerPitchInput(LookAxisVector.Y);
    }
}
```

这里使用自定义的输入组件 `WarriorInputComponent` 将输入绑定逻辑从 Character 中分离，Character 只需要持有数据文件 `InputConfigDataAsset`，保持了架构的整洁。
