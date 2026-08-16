---
title: linux-用户管理
date: 2026-08-17 05:00:00
categories:
  - 操作系统
tags:
  - 操作系统
  - linux-用户管理
description: 1:1 发布自知识库：OS/linux-用户管理.md
source_note: OS/linux-用户管理.md
---
# 用户管理

### 创建用户

新建用户

```bash
sudo adduser lzq
```

设置 sudo 密码

```bash
sudo passwd
```
	
用户执行不了 sudo

> lzq is not in the sudoers file. This incident will be reported.

```
sudo usermod -aG sudo lzq
```

其他:

`users`

`who `

`ps -a`

### auditd 监控用户的修改

安装`auditd`（审计守护进程）

```
# 监控 /etc 目录下的文件，记录写操作 (w) 和属性修改 (a) 操作
sudo auditctl -w /etc/ -p wa -k system_config_change
```

为了确保系统重启后规则依然生效，你需要将这些规则添加到 `/etc/audit/rules.d/audit.rules` 文件中。打开文件并添加以下内容：

```bash
-w /etc/ -p wa -k system_config_change
```

**解释**：

- `-w /etc/`：监控 `/etc/` 目录下的所有文件。
- `-p wa`：监控写操作 (`w`) 和属性更改 (`a`) 操作。你还可以添加 `r` 来监控读取操作，或 `x` 监控执行操作。
- `-k system_config_change`：为这条规则指定一个关键字 `system_config_change`，方便后续查询。

**查看修改日志**：

当某人修改了这些配置文件后，你可以使用以下命令来查询日志，查看谁修改了配置文件：

```
sudo ausearch -k system_config_change
```

这条命令会列出所有触发了 `system_config_change` 关键字的审计事件，显示哪些用户进行了修改操作。

### head

> linux 输出结果太多了，怎么控制只显示输出结果的前 10 行?

在 Linux 终端中，你可以使用管道（pipe）和命令行工具来控制输出结果的显示数量。以下是几种常用的方法：

1. 使用 `head` 命令：`head` 命令用于显示文件或标准输入的开头部分，默认情况下显示前 10 行。你可以将输出结果通过管道传递给 `head` 命令来限制显示的行数。例如：

复制

```
你的命令 | head
```

将 "你的命令" 替换为你要执行的实际命令。

1. 使用带参数的 `head` 命令：如果你想要显示除前 10 行之外的更少行数，可以使用 `n` 参数指定行数。例如，要显示前 5 行：

复制

```
你的命令 | head -n 5
```

1. 使用 `grep` 命令：如果你只想显示输出结果中包含特定内容的前 10 行，可以结合使用 `grep` 和 `head` 命令。例如，要显示包含关键词 "keyword" 的前 10 行：

复制

```
你的命令 | grep "keyword" | head
```

这些方法可以帮助你在 Linux 终端中控制输出结果的显示数量，并根据需要进行调整。请根据你的具体需求选择适合的方法。

### 查看当前进程打开的文件

```
lsof -p [Process_ID]
```

```
strace -f -e trace=file -p [Process_ID]
```

### 查看目录创建时间

```bash
 #检查文件夹创建时间,发现waltz的头文件includ的确实是以前跑ROCKSDB的时候生成的
 stat -c '%w' /usr/local/include/rocksdb
```

### 代码审查

查看代码有效行数：=loccount

## 用户管理

创建用户

```bash
sudo adduser lzq
```

设置 sudo 密码

```bash
sudo passwd
```

用户执行不了 sudo

> lzq is not in the sudoers file. This incident will be reported.

```bash
sudo usermod -aG sudo lzq #	ubuntu
usermod -aG wheel lzq #	OpenEuler
```
填入公钥
```
echo "对方的公钥内容" | sudo tee /home/用户名/.ssh/authorized_keys
```

echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF0QiFtpbRgAc1pOOZerwI4R4k5lFQYROWKyFNdlA0RA yiboqin@hust.edu.cn" | sudo tee /home/qyb/.ssh/authorized_keys
其他相关:

`users`

`who `

`ps -a`

> 在 Ubuntu 系统中，你可以使用多个命令来查看最近登录的用户。以下是一些常用方法：

使用 `last` 命令

`last` 命令会显示最近登录的用户信息。它从 `/var/log/wtmp` 文件中读取数据。

```bash
last
```

输出示例：

```
user1    pts/0        192.168.1.100    Tue May 25 10:24   still logged in
user2    pts/1        192.168.1.101    Tue May 25 09:12 - 09:30  (00:18)
user1    pts/2        192.168.1.102    Tue May 25 08:30 - 09:10  (00:40)
```

- **user1** 和 **user2** 是用户名。
- **pts/0** 等是登录终端。
- **192.168.1.100** 等是用户登录时使用的 IP 地址。
- **时间信息** 显示了用户的登录时间和时长。

使用 `who` 命令

`who` 命令显示当前登录的用户信息。

```bash
who
```

输出示例：

```
user1    pts/0        2024-05-31 10:24 (192.168.1.100)
user2    pts/1        2024-05-31 09:12 (192.168.1.101)
```

- **user1** 和 **user2** 是当前登录的用户。
- **pts/0** 等是登录终端。
- **2024-05-31 10:24** 是用户的登录时间。
- **192.168.1.100** 是用户登录时使用的 IP 地址。

使用 `lastlog` 命令

`lastlog` 命令显示所有用户上次登录的信息。它从 `/var/log/lastlog` 文件中读取数据。

```bash
lastlog
```

输出示例：

```
Username         Port     From             Latest
root             tty1                      Sun May 30 11:54:42 +0000 2024
user1            pts/0    192.168.1.100    Tue May 25 10:24:00 +0000 2024
user2            pts/1    192.168.1.101    Tue May 25 09:12:00 +0000 2024
```

- **Username** 是用户名。
- **Port** 是登录终端。
- **From** 是登录时的 IP 地址。
- **Latest** 是上次登录时间。

使用 `journalctl` 命令查看日志

`journalctl` 命令可以查看系统日志，包括 SSH 登录记录。

```bash
journalctl -u ssh
```

或查看最近的日志条目：

```bash
journalctl -u ssh -n 50
```

- **-u ssh** 过滤与 SSH 服务相关的日志。
- **-n 50** 显示最近的 50 条日志。

hostnamectl 这个命令不仅会显示系统的主机名，还会显示操作系统的相关信息。

## 参考

- `RAW/Ubuntu.md`
