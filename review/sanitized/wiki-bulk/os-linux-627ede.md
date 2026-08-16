---
title: linux-环境变量、守护进程
date: 2026-08-17 05:00:00
categories:
  - 操作系统
tags:
  - 操作系统
  - linux-环境变量、守护进程
description: 1:1 发布自知识库：OS/linux-环境变量、守护进程.md
source_note: OS/linux-环境变量、守护进程.md
---
# 环境变量、自启动脚本、守护进程

## 环境变量

（推荐） 修改用户主目录下的.bashrc 文件 （用了 zsh 就改.zshrc)

/etc/profile : 在登录时,操作系统定制用户环境时使用的第一个文件 ,此文件为系统的每个用户设置环境信息,当用户第一次登录时,该文件被执行。

/etc /environment : 在登录时操作系统使用的第二个文件, 系统在读取你自己的 profile 前,设置环境文件的环境变量。

~/.profile : 在登录时用到的第三个文件 是.profile 文件,每个用户都可使用该文件输入专用于自己使用的 shell 信息,当用户登录时,该文件仅仅执行一次!默认情况下,他设置一些环境变量,执行用户的.bashrc 文件。

/etc/bashrc : 为每一个运行 bash shell 的用户执行此文件.当 bash shell 被打开时,该文件被读取.

~/.bashrc : 该文件包含专用于你的 bash shell 的 bash 信息,当登录时以及每次打开新的 shell 时,该该文件被读取。

> 切换 sudo 以后，环境变量会变，解决：

这是因为在 `sudo` 的默认配置中，`secure_path` 设置会覆盖你的 `PATH` 环境变量。通过以下步骤禁用 `secure_path`，或将需要的环境变量路径添加到 `secure_path` 中。

修改 `sudoers` 文件：

```
sudo visudo
```

在文件中找到类似如下的行，注释掉

```
Defaults secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
```

## 开机自启脚本&service

开机自动挂载：`/etc/fstab`

开机启动脚本：`/etc/rc.local`

特殊的目录, 这个目录下的所有 .sh 脚本会在用户登录时自动被系统执行:

`/etc/profile.d/ `

创建一个新的 systemd 服务文件, 例如 `/etc/systemd/system/***.service`。

1. 在该文件中添加以下内容：

```
iniCopy code[Unit]
Description=Configure Hugepages

[Service]
Type=oneshot
ExecStart=/bin/bash -c "echo 5 > /sys/kernel/mm/hugepages/hugepages-1048576kB/nr_hugepages"

[Install]
WantedBy=multi-user.target
```

1. 重新加载 systemd 配置并启用服务：

```
bashCopy codesudo systemctl daemon-reload
sudo systemctl enable hugepages.service
sudo systemctl start hugepages.service
```

这样，在每次系统启动时，都会自动应用您的大页内存设置。

## 守护进程 daemon

当谈到守护进程（daemon）时，我们通常是指在后台运行的长期运行的系统服务或进程。它们通常不会与用户直接交互，而是在系统启动时启动，并持续运行以提供特定的功能或服务。下面是关于守护进程和普通进程的一些区别以及它们的作用：

## 参考

- `RAW/Ubuntu.md`
