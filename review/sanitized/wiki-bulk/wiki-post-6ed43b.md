---
title: IO测试工具
date: 2026-08-17 05:00:00
categories:
  - 开发工具
tags:
  - 开发工具
  - IO测试工具
description: 1:1 发布自知识库：古法工具/IO测试工具.md
source_note: 古法工具/IO测试工具.md
---
# IO测试工具

[[IO测试工具]]偏性能 workload 构造与观测；若目标是校验写入后数据内容、LBA / offset 位置语义、静默错误或条带映射一致性，使用 [[LBA 存储稳定性测试工具]] 和 [[存储稳定性测试]] 路线。

## FIO 参数解析

#### numjobs（Jobs）
- **定义**：numjobs 指定运行的 **作业（job）数量**，每个作业是一个独立的 I/O 工作负载。FIO 会为每个作业创建一个独立的进程或线程（具体取决于 thread 设置）。
#### thread
- **定义**：thread 控制 FIO 是否使用 **线程**（而非进程）来运行作业。
- **你的配置**：thread=1
    - 表示 FIO 为每个作业创建一个 **线程**，而不是独立的进程。
#### iodepth（I/O Depth）
- **定义**：iodepth 指定每个作业的 **I/O 队列深度**，即同时提交到存储设备的未完成 I/O 请求数。

fio输出子文件 \_lat.log 的参数含义:

|              |              |                |                    |
| ------------ | ------------ | -------------- | ------------------ |
| runtime      | 测试运行时间（秒）    | 设置为更大值（如 60）   | 增加测试时长，生成更多日志      |
| log_avg_msec | 日志平均时间窗口（毫秒） | 设置为更小值（如 1000） | 增加日志分辨率，但文件大小增加    |
| read_iolog   | 重放的 trace 文件 | 选择更大的 trace 文件 | 增加 I/O 操作数量，延长测试时长 |

FIO报告中各种latency（xlat）的具体含义 

## iostat

### I/O 观察

实时观察：htop

### iostat\_观察 io 开销

https://zhuanlan.zhihu.com/p/649946956

```bash
iostat -d -k 1 10         #查看TPS和吞吐量信息(磁盘读写速度单位为KB)，每1s收集1次数据，共收集10次
iostat -d -m 2            #查看TPS和吞吐量信息(磁盘读写速度单位为MB)，每2s收集1次数据
iostat -d -x -k 1 10      #查看设备使用率（%util）、响应时间（await）等详细数据， 每1s收集1次数据，总共收集10次
iostat -c 1 10            #查看cpu状态，每1s收集1次数据，总共收集10次
```

iostat 输出内容分析

在 linux 命令行中输入 iostat，通常将会出现下面的输出：

```text
[root@localhost ~]# iostat
Linux 5.14.0-284.11.1.el9_2.x86_64 (localhost.localdomain)      08/07/2023      _x86_64_        (4 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.31    0.01    0.44    0.02    0.00   99.22

Device             tps    kB_read/s    kB_wrtn/s    kB_dscd/s    kB_read    kB_wrtn    kB_dscd
dm-0              3.19        72.63        35.90         0.00     202007      99835          0
dm-1              0.04         0.84         0.00         0.00       2348          0          0
nvme0n1           3.36        93.22        36.64         0.00     259264     101903          0
sr0               0.02         0.75         0.00         0.00       2096          0          0
```

首先第一行：

```text
Linux 5.14.0-284.11.1.el9_2.x86_64 (localhost.localdomain)      08/07/2023      _x86_64_        (4 CPU)
```

Linux 5.14.0-284.11.1.el9*2.x86_64 是内核的版本号，localhost.localdomain 则是主机的名字， `08/07/2023`当前的日期， \_x86_64*是 CPU 的架构， (4 CPU)显示了当前系统的 CPU 的数量。

接着看第二部分，这部分是 CPU 的相关信息，其实和**top 命令**的输出是类似的。

```text
avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.31    0.01    0.44    0.02    0.00   99.22
```

cpu 属性值说明：

- %user：CPU 处在用户模式下的时间百分比。
- %nice：CPU 处在带 NICE 值的用户模式下的时间百分比。
- %system：CPU 处在系统模式下的时间百分比。
- %iowait：CPU 等待输入输出完成时间的百分比。
- %steal：管理程序维护另一个虚拟处理器时，虚拟 CPU 的无意识等待时间百分比。
- %idle：CPU 空闲时间百分比。

iowait 这个指标有点说法。

## 参考

- `RAW/Ubuntu.md`
- [[LBA 存储稳定性测试工具]]
