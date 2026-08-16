---
title: Oh My Zsh
date: 2026-08-17 05:00:00
categories:
  - 开发工具
tags:
  - 开发工具
  - Oh-my-zsh
  - tooling-shell
description: 1:1 发布自知识库：古法工具/Oh-my-zsh.md
source_note: 古法工具/Oh-my-zsh.md
---
# Oh My Zsh

Oh My Zsh 是 zsh 的配置框架，常用于管理主题、插件、补全、历史搜索和 shell 启动配置。本页整理安装、常用插件和本机 `.zshrc` 配置来源边界。

## 安装

前置依赖：

```bash
sudo apt-get install vim git curl zsh
```

安装 Oh My Zsh：

```bash
sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

卸载时可使用 Oh My Zsh 自带 `uninstall.sh`。

如果 `raw.githubusercontent.com` 连接失败，可临时核验解析结果后修改 `/etc/hosts`，例如：

```bash
sudo vim /etc/hosts
# 151.101.76.133 raw.githubusercontent.com
```

hosts IP 会变化，使用前应重新核验；不要把临时 hosts 规则当作长期稳定配置。

## 插件安装

常用插件下载命令：

```bash
# 语法高亮
 git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# 命令自动建议
 git clone https://github.com/zsh-users/zsh-autosuggestions \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# z 目录跳转
 git clone https://github.com/rupa/z.git \
  ~/.oh-my-zsh/custom/plugins/z

# 历史命令前缀搜索
 git clone https://github.com/zsh-users/zsh-history-substring-search \
  ~/.oh-my-zsh/custom/plugins/zsh-history-substring-search

# 自动更新 Oh My Zsh 插件
 git clone https://github.com/TamCore/autoupdate-oh-my-zsh-plugins \
  ~/.oh-my-zsh/custom/plugins/autoupdate

# fzf 模糊查找
 git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install
```

注意：历史原文中 `zsh-history-substring-search>` 和 `autoupdate-oh-my-zsh-plugins>` 的 `>` 是误写的重定向符，稳定命令应删除。

非 Oh My Zsh 插件但常一起安装的工具：

```bash
pip install thefuck
cargo install navi
```

## `.zshrc` 关键配置

```zsh
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="ys"
plugins=(
  git
  sudo
  zsh-autosuggestions
  zsh-syntax-highlighting
  autoupdate
  last-working-dir
  z
  extract
  history-substring-search
  pip
  docker
)
source $ZSH/oh-my-zsh.sh
```

PATH 配置中包含 Go、Cargo、Node.js、Clash for Linux 和 Python local bin；这些属于本机环境路径，迁移到其他机器前需要逐项核验目录是否存在。

## 插件速查

| 插件名 | 功能 | 用法示例 |
| --- | --- | --- |
| `git` | Git 快捷命令。 | `gst`、`gaa`。 |
| `sudo` | 快速在当前命令前加 `sudo`。 | 按两次 `Esc`。 |
| `zsh-autosuggestions` | 命令自动建议。 | 按 `→` 接受建议。 |
| `zsh-syntax-highlighting` | 命令语法高亮。 | 错误命令显示红色。 |
| `autoupdate` | 自动更新 Oh My Zsh 插件。 | 定期检查更新。 |
| `last-working-dir` | 记住上次目录。 | 打开终端自动跳转。 |
| `z` | 基于历史记录快速跳目录。 | `z <目录名>`。 |
| `extract` | 解压任意文件。 | `x <文件名>`。 |
| `history-substring-search` | 按输入前缀搜索历史命令。 | 输入前缀后按 `↑` / `↓`。 |
| `fzf` | 模糊搜索历史命令和文件。 | `Ctrl+R`、`Ctrl+T`。 |
| `pip` | Python pip 补全。 | `pip ins<Tab>`。 |
| `docker` | Docker 快捷命令。 | `dc`、`dps`。 |

## 参考

- `RAW/zshrc.md`
- `RAW/config/zsh配置.md`
- [[WIKI/古法工具/README]]
- [Oh My Zsh](https://ohmyz.sh/)
- [zsh-users/zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting)
- [zsh-users/zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions)
- [zsh-users/zsh-history-substring-search](https://github.com/zsh-users/zsh-history-substring-search)
- [rupa/z](https://github.com/rupa/z)
- [junegunn/fzf](https://github.com/junegunn/fzf)
