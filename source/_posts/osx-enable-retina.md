title: OS X 使用自定义分辨率开启 Retina（HiDPI）支持
categories: Geek
tags:
  - OS X
  - HiDPI
permalink: osx-enable-retina
date: 2016-03-16 10:50:45
---

有些电脑的显示器虽然是『高分辨率』，但像素的细腻程度仍然不及 Apple 的 Retina 显示器（用四个实际像素点渲染一个逻辑像素点）。比如我的显示器在 Ubuntu 下设置缩放 1.25 倍得到的体验最佳，但在黑苹果 OS X 系统中是不能开启非两倍的 HiDPI 的，一个解决方案是以较高的分辨率开启两倍 HiDPI，再让渲染时缩放回显示器的实际分辨率。

需要注意的是，这种解决方案并不完美 —— 这样会使字体失去一部分次像素渲染效果，不支持 Retina 的应用程序显示效果极差，并且图形性能有较大损失。

<!-- more -->

### 需要的工具
* Xcode 或其他 plist 编辑器

有人说需要 IORegExplorer、SwitchResX，其实都是在找麻烦 ……

### 获取硬件信息
获取显示器的 `DisplayVendorID`、`DisplayProductID`、`IODisplayEDID` 和 `IODisplayPrefsKey`：

```bash
ioreg -l | grep DisplayVendorID
#     | |   | |         "DisplayVendorID" = 1711
ioreg -l | grep DisplayProductID
#    | |   | |         "DisplayProductID" = 4413
ioreg -l | grep IODisplayEDID
#    | |   | |         "IODisplayEDID" = <00ffffffffffff0006af3d110000000003170104951f11780287e5a456509e260d505400000001010101010101010101010101010101143780b87038244010103e0035ad100000180000000f0000000000000000000000000020000000fe0041554f0a202020202020202020000000fe004231343048414e30312e31200a00a1>
ioreg -l | grep IODisplayPrefsKey
#    | |   | |         "IODisplayPrefsKey" = "IOService:/AppleACPIPlatformExpert/PCI0@0/AppleACPIPCI/GFX0@2/AppleIntelFramebuffer@0/display0/AppleDisplay-6af-113d"
```

记下这些数据，待会用得到。

### 创建配置文件
我的 `IODisplayPrefsKey` 最后一段是：

```plain
AppleDisplay-6af-113d
```

创建配置文件夹及文件：

```bash
mkdir DisplayVendorID-6af
nano DisplayVendorID-6af/DisplayProductID-113d.plist
```

把其中的 `6af` 和 `113d` 替换为你的 `IODisplayPrefsKey` 中的数字，并在 `nano` 中粘贴以下内容（我的模板）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>DisplayProductName</key>
	<string>Menci&apos;s Display &gt;_&lt;</string>
	<key>DisplayProductID</key>
	<integer>26609</integer>
	<key>DisplayVendorID</key>
	<integer>14499</integer>
	<key>IODisplayEDID</key>
	<data>AP///////wAGrz0RAAAAAAMXAQSVHxF4AoflpFZQniYNUFQAAAABAQEBAQEBAQEBAQEBAQEBFDeAuHA4JEAQED4ANa0QAAAYAAAADwAAAAAAAAAAAAAAAAAgAAAA/gBBVU8KICAgICAgICAgAAAA/gBCMTQwSEFOMDEuMSAKAKE=</data>
	<key>scale-resolutions</key>
	<array>
		<data>AAAKAAAABaAAAAAB</data>
		<data>AAAFVgAAAwAAAAAB</data>
		<data>AAAKrAAABgAAAAAB</data>
	</array>
</dict>
</plist>
```

`Control + O` 回车保存，`Control + X` 退出。

### 编辑配置文件
用 plist 编辑器打开 `DisplayProductID-XXXX.plist` 文件：

![plist 编辑](/Users/Menci/Hexo/source/_posts/osx-enable-retina/plist-edit.png)

把 `DisplayVendorID`、`DisplayProductID`、`IODisplayEDID` 修改为第一步记下的值，`DisplayProductName` 可以随意修改。

展开 `scale-resolutions`，这里面就是我们的自定义分辨率，格式如下（所有数字均为十六进制）：

```plain
<横向分辨率 纵向分辨率 1>
```

比如我要添加一个 `1366 × 768 (HiDPI)` 选项，则要先乘以二，得到 `2732 × 1536`，然后转换为十六进制（可以用系统自带的 `Calculator.app`）填入，即：

```plain
<00000aac 00000600 00000001>
```

填好后保存退出。

### 应用配置文件
将配置文件复制到系统目录下，并去掉 `.plist` 后缀：

```bash
cd DisplayVendorID-6af
mv DisplayProductID-113d.plist DisplayProductID-113d
sudo cp -r . /System/Library/Displays/Overrides/
```

开启系统分辨率缩放支持：

```bash
sudo defaults write /Library/Preferences/com.apple.windowserver DisplayResolutionEnabled -bool YES;
```

重启后在显示器设置中选择『缩放』，就可以看到自定义的分辨率了。
