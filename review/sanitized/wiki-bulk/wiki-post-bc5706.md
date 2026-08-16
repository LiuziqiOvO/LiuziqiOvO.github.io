---
title: 工具杂项
date: 2026-08-17 05:00:00
categories:
  - 开发工具
tags:
  - 开发工具
  - Tool
  - tooling
description: 1:1 发布自知识库：古法工具/Tool.md
source_note: 古法工具/Tool.md
---
# 工具杂项

本页保留尚未拆成独立页面的工具使用记录。稳定的 Git、Docker、Vim、调试、Prompt 与编辑器配置分别维护在 [[Git]]、[[Docker]]、[[Vim]]、[[调试与性能分析工具]]、[[Prompt]]、[[编码工具&&配置]]。

## Obsidian

Obsidian 可以替换 Typora，但在大型 vault 中性能可能较差。插件和配置跟随 vault 存放在 `.obsidian/` 下；粘贴纯文本可用 `Ctrl + Shift + V`。

### Obsidian 绘图

Mermaid 插件报 `mermaid is not defined` 时，优先检查插件启用状态、代码块语言标识和当前主题 / 插件冲突。

## Draw.io

### drawpyo

Drawpyo 是用于程序化生成 draw.io 图表的 Python 库，适合需要自动化文档或根据代码结构生成图表的场景。它可以创建图表对象、设置样式和位置，并导出为 draw.io XML 文件。

- 支持手动创建对象和边，例如类、函数和调用关系。
- 支持树状图等自动布局，适合表达层级结构。
- 比直接拼 XML 更结构化，出错面更小。

## Typora

### 常用操作

- `$$` + 回车：创建公式块。
- `` ``` `` + 语种 + 回车：创建代码块，也可用 `Ctrl + Shift + K`。
- 主题可以直接复制现有主题文件夹。

### 格式控制

间隔：`\quad`，例如 $A \quad B$。

![image-20220718165120407](../../image/Tool.assets/image-20220718165120407.png)

公式左对齐使用 `&` 作为对齐点，`\\` 作为换行：

```latex
\begin{align*}
    & \\
    & \\
\end{align*}
```

$$
\begin{align*}
  & X(0) = x(0)W_{N}^{0\cdot0} + x(1)W_{N}^{0\cdot1} + \cdots + x(N-1)W_{N}^{0\cdot(N-1)}\\
  & X(1) = x(0)W_{N}^{1\cdot0} + x(1)W_{N}^{1\cdot1} + \cdots + x(N-1)W_{N}^{1\cdot(N-1)} \\
  & \cdots \\
  & X(N-1) = x(0)W_{N}^{(N-1)\cdot0} + x(1)W_{N}^{(N-1)\cdot1} + \cdots + x(N-1)W_{N}^{(N-1)\cdot(N-1)} \\
\end{align*}
$$

### 角标与数学符号

- `_`：右下角。
- `^`：左上角。
- `\limits` 配合 `_` / `^` 控制上下标位置。

$opt(i,l)=\bigcup\limits _{1 \leq j \leq l} \{opt(i,l-j) \times opt(l-j+i,j)\}$

| 符号 | 含义 | LaTeX |
| --- | --- | --- |
| $\oplus$ | 异或 | `\oplus` |
| $\bar S$ | 均值 / bar | `\bar` |
| $\neg$ | 非 | `\neg` |
| $\vee$ | 析取 | `\vee` |
| $\wedge$ | 合取 | `\wedge` |
| $\rightarrow$ | 若 p 则 q | `\rightarrow` |
| $\leftrightarrow$ | 等价 | `\leftrightarrow` |

常用写法：

- 点乘：`\cdot`，例如 $a \cdot b$。
- 叉乘：`\times`，例如 $a \times b$。
- 除以：`\div`，例如 $a \div b$。
- 大于等于：`\geq`，例如 $\geq$。
- 小于等于：`\leq`，例如 $\leq$。
- 分式：`\frac{分子}{分母}`，例如 $\frac{分子}{分母}$。
- 无穷：`\infty`，例如 $\infty$。

### 希腊字母与花括号

![image-20211227152615893](../../image/Tool.assets/image-20211227152615893.png)

花括号示例：

```latex
opt(i,1) =\left\{
\begin{aligned}
x & = & \cos(t) \\
y & = & \sin(t) \\
z & = & \frac xy
\end{aligned}
\right.
```

$opt(i,1) =\left\{  \begin{aligned}AC \\B\end{aligned}\right.$

## MarkItDown

MarkItDown 可将多种文件转换为 Markdown，适合把 PDF、Office 文档或网页资料先转为可进入 vault 的文本材料。

## EasyN2N

EasyN2N 可用于虚拟局域网。Windows 端使用 EasyN2N 客户端；服务器端可安装 n2n 并配置 supernode。

```bash
vim /etc/n2n/supernode.conf # -p=7777 设置端口号
sudo systemctl start supernode
sudo systemctl enable supernode
```

## Syncthing

Syncthing 是文件 P2P 同步器。

GUI 远程访问：

```bash
syncthing serve --gui-address=0.0.0.0:8384
ufw allow 8384
```

隐藏运行：

```bash
nohup syncthing --gui-address=0.0.0.0:8384 &> /dev/null &
```

自启动：

```bash
systemctl enable syncthing@root.service
systemctl start syncthing@root.service
```

## 工具需求：Markdown 代码链接更新

需求：实现一个 Markdown 中代码链接批量更新工具，最好以 VS Code 插件形式提供。该需求尚未拆成独立项目页；后续若要实现，应先明确输入路径、目标仓库、链接格式和 dry-run / rollback 规则。

## Clash-for-linux

Clash-for-linux 可提供本地代理端口和浏览器 Dashboard。

访问浏览器管理界面：

```text
http://<ip>:9090/ui
```

在 `API Base URL` 中输入：

```text
http://<ip>:9090
```

默认代理端口：

```text
http_proxy=http://127.0.0.1:7890
https_proxy=http://127.0.0.1:7890
```

Dashboard 当前使用 yacd。

## Marker

Marker 是 PDF to Markdown 工具，可利用本地显卡将 PDF 识别并转换成 Markdown。

## 参考

- [[WIKI/古法工具/README]]
- [[编码工具&&配置]]
- [Mousewheel Image Zoom 插件教程](https://coffeetea.top/zh/community-plugins/mousewheel-image-zoom.html)
- [Drawpyo GitHub](https://github.com/MerrimanInd/drawpyo)
- [Drawpyo Documentation](https://merrimanind.github.io/drawpyo/)
- [MarkItDown](https://github.com/microsoft/markitdown)
- [Syncthing apt repository](https://apt.syncthing.net/)
- [Syncthing 配置教程](https://www.cnblogs.com/HaiJaine/p/18339629)
- [CSDN Syncthing 配置教程](https://blog.csdn.net/weixin_42951763/article/details/140421699)
- [Clash-for-linux backup](https://github.com/Elegycloud/clash-for-linux-backup)
- [yacd](https://github.com/haishanh/yacd)
