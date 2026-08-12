---
title: Tmux：把终端会话变成可恢复工作台
date: 2026-08-12 02:45:00
categories:
  - 开发工具
tags:
  - Tmux
  - Linux
  - 终端工具
description: 安装并配置 tmux、oh-my-tmux、会话恢复、快速切换和任务完成通知。
---

<!-- AUTO-GENERATED from WIKI/古法工具/Tmux.md sha256:f426f0c925597d6421f1c830c3897dedabaa1c2bda7e21c0efe3846bdc2d281c; edit the source note, not this file. -->

> 安装 tmux 和 oh-my-tmux 后，可用本页记录配置、快捷键、插件与多会话工作流。

有什么用？
1. SSH断开后可以保活，连接服务器使用Claude Code、Codex，PC和服务器断联不会打断会话。
2. 多开Claude Code，并且Agent能通过Tmux命令感知Tmux其他窗口。
3. 命令行多开，在服务器纯命令行环境。（比如你线下在机房挂一个窗口杀毒，再切走干别的）
## tmux的逻辑
  - **Server**：tmux 后台服务进程，启动 tmux 时自动运行。
  - **Session**：会话，一个 Server 可以包含多个 Session。
  - **Window**：窗口，类似标签页；一个 Session 可以包含多个 Window。
  - **Pane**：面板，一个 Window 可以切分成多个 Pane；Pane 是同屏分屏的最小单位。

  `prefix + w` 默认进入选择树，可以看到 Session 和 Window；展开后也能看到 Pane。

## oh-my-tmux

https://github.com/gpakosz/.tmux
### 安装：
```
curl -fsSL "https://github.com/gpakosz/.tmux/raw/refs/heads/master/install.sh#$(date +%s)" | bash
```
超时，手动（ clone 到 ~/.tmux）安装，
```bash
cd ~
git clone --single-branch https://github.com/gpakosz/.tmux.git
ln -s -f .tmux/.tmux.conf
cp .tmux/.tmux.conf.local .
```

>注意：
	**安装 oh-my-tmux** 后，它已经自带 TPM 机制。
	**添加插件** 时：
	**不要** 在配置文件里加这几行（oh-my-tmux 会报错或冲突）
	而是直接在 `~/.tmux.conf.local`里用 set -g @plugin '插件仓库' 语法添加插件。

### 配置:
直接拷贝：{% asset_link tmux.conf.local tmux.conf.local %}

>Prefix 按键默认是 Ctrl + B，我的配置加了"\`" 作为另一个prefix按键
```bash
Prefix +  r  # source config

Prefix + I (shift+i)  # 安装插件。
```

配置里包含了
1. 我的配置加了“·”作为另一个prefix按键
2. 启用滚轮
3. **启用鼠标点击**
4. 主题（注意要求tmux>3.2）
5. 一些插件让重启后tmux可以自动恢复（页面而不是进程本身）
6. OSC52 **剪贴板透传**
7. ...

修改 `~/.config/tmux/tmux.conf.local` 后热加载：

```bash
tmux source-file ~/.config/tmux/tmux.conf
```

## 常用按键

### Prefix 快捷键
`Ctrl + B` （或者你设置的prefix）进入命令模式：
- **c**（create）：新建一个窗口
- **d**（detach）：断开当前会话，保持会话继续运行
- **W:** 查看全局；
	- 选中 window 后按 `x` 删除该 window
- **数字键（1, 2, 3 等）**：切换到指定的窗口
- tab：切换上一窗口
- ，：重命名当前窗口（有时候ClaudeCode任务的名字会代替窗口显示出来）
- ：开始输入命令

## 一些插件（可不看）
### tmux-sessionx

`tmux-sessionx` 是 oh-my-tmux 下的 session 管理 / 切换插件，只负责搜索、切换、创建、重命名和删除 tmux session，不负责关机后恢复。当前本机配置已加载：

```tmux
set -g @plugin 'omerxx/tmux-sessionx'
```

默认入口是 `prefix + O`，注意是大写 `O`，不是数字 `0`。当前主 prefix 是 `Ctrl+b`，第二 prefix 是反引号 `` ` ``，因此可用：

```text
Ctrl+b  O
`       O
```

`prefix + o` 已被 oh-my-tmux 用作 pane 循环切换；若强行改成小写 `o`，需要在 `~/.config/tmux/tmux.conf.local` 中显式 `unbind o` 并设置 `@sessionx-bind 'o'`，否则建议保留默认大写 `O`。

sessionx 界面常用键：

| 按键                  | 作用                                       |
| ------------------- | ---------------------------------------- |
| `Enter`             | 切换选中 session；输入不存在的名字再 Enter 会新建 session |
| `Ctrl+n` / `Ctrl+p` | 上下选择                                     |
| `Ctrl+w`            | 切到 window 列表模式                           |
| `Ctrl+t`            | 显示 session / window 树预览                  |
| `Ctrl+x`            | 从 `~/.config` 路径选择目录                     |
| `Ctrl+e`            | 从当前目录的子目录创建 / 进入 session                 |
| `Ctrl+r`            | 重命名 session                              |
| `Alt+Backspace`     | 删除选中的 session                            |
| `Ctrl-u` / `Ctrl-d` | 预览区域上 / 下滚动                              |
| `?`                 | 开关预览                                     |
| `Esc`               | 退出                                       |

当前版本里 `Ctrl-d` 是向下滚动预览，不是删除 session；删除 session 是 `Alt+Backspace`。

### tmux-resurrect / tmux-continuum

session 持久化保存 / 恢复需要 `tmux-resurrect` 和 `tmux-continuum`：

```tmux
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'

set -g @continuum-restore 'on'
set -g @resurrect-capture-pane-contents 'on'
```

在 oh-my-tmux 的 `~/.config/tmux/tmux.conf.local` 中，这些插件配置通常已有预留注释，取消注释后用 `prefix + I` 安装 / 更新插件。

安装并加载后：

```text
prefix + Ctrl+s    手动保存 session
prefix + Ctrl+r    手动恢复 session
```

`tmux-resurrect` 主要恢复 session、window、pane 布局、pane 当前路径、部分可恢复命令和可选的 pane 屏幕内容；它不能完整恢复所有运行中进程的内存状态。`@resurrect-capture-pane-contents 'on'` 保存的是 pane 屏幕内容，不等同于恢复进程本身。

### tmux-notify

[`rickstaa/tmux-notify`](https://github.com/rickstaa/tmux-notify) 用于在 pane 中的任务结束后发送桌面通知。macOS 使用 `osascript`，Linux 使用 `notify-send`。

在 oh-my-tmux 的 `tmux.conf.local` 插件区加入：

```tmux
set -g @plugin 'rickstaa/tmux-notify'
set -g @tnotify-verbose 'on'
set -g @tnotify-custom-cmd ':'
```

使用 `prefix + I` 安装插件。任务开始后手动开启监控：

```text
prefix + m        监控当前 pane，结束时发送通知
prefix + Alt+m    通知后切回任务 pane
prefix + M        取消监控
```

插件不会自动监控所有命令，而是周期性检查 pane 是否重新出现 shell prompt。`prefix + m` 可能覆盖原有鼠标开关，安装后可用 `tmux list-keys -T prefix` 检查真实绑定。

### tmux-cssh

`tmux-cssh` 是把 ClusterSSH 的多主机同步输入模式搬到 tmux 里的脚本：为多个 host 创建 SSH pane，并依赖 tmux 的 `synchronize-panes` 把同一段输入广播到所有 pane。

适用场景：
- 临时进入多台同构机器，批量查看状态、执行只读诊断命令或做小范围一致性操作。
- 不想打开多个终端窗口，也不想引入 ClusterSSH 的 GUI。
- 已经习惯 tmux pane / window，并希望批量 SSH 仍保留在一个 tmux session 内。

- 高风险写操作：同步输入容易把误命令同时发到所有机器；执行 `rm`、重启、配置覆盖前应先关闭同步或逐台确认。

安装方式是把仓库里的 `tmux-cssh` 脚本放进 `$PATH`。常用调用：

```bash
tmux-cssh web{1..4}
tmux-cssh -o '-p 2222 -l my_user' web{1..4}
tmux-cssh -c -n cssh web1 web2 web3
```

可在 tmux 配置中加一个同步输入开关：

```tmux
bind-key = set-window-option synchronize-panes
```

判断：有用，但属于窄场景工具。它适合“我明确知道要对这一组机器输入同一批命令”的临时操作；如果操作需要回滚、状态收敛、权限审计或失败重试，就不该用它承担核心流程。

## 参考

- [oh-my-tmux](https://github.com/gpakosz/.tmux)
- [tmux-notify](https://github.com/rickstaa/tmux-notify)
- [tmux-cssh](https://github.com/peikk0/tmux-cssh) @ `099ac92cbc89a1090b57be1de8b85c942cc8abf2`
- `RAW/config/tmux.conf.local.md`
