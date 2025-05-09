---
title: Ubuntu编译、调试、性能分析工具
date: 2024-01-10
categories:
  - 操作系统
  - 开发工具
tags:
  - Ubuntu
  - Linux
  - 性能分析
  - 调试工具
  - Docker
  - Git
  - Vim
---

## 编译、调试、性能分析工具


使用objdump查看反汇编：

```bash
objdump -d [executable] > [output]
```


### Coredump

程序由于各种异常或者bug导致在运行过程中异常退出或者中止（并且在满足一定条件下）会产生一个叫做core的文件。

core文件通常包含以下信息：
- 程序运行时的内存
- 寄存器状态
- 堆栈指针
- 内存管理信息
- 函数调用堆栈信息

查看core文件默认存储位置：

```bash
cat /proc/sys/kernel/core_pattern
```

使用GDB加载coredump：

```bash
gdb /path/to/your/program /data/coredump/core.your_program_name.pid
```

### perf
perf是一个Linux性能分析工具，用于收集和分析系统性能数据。它可以帮助开发人员了解程序在运行时的性能瓶颈，优化程序的性能。


perf常用命令：

```bash
perf record ./lower_bound
perf report
perf record -e cache-misses
```

**生成火焰图**
perf record -g -F 99
跑你要测试的程序

perf script -i perf.data > out1.perf 
../FlameGraph-master/stackcollapse-perf.pl out1.perf > out1.floded
../FlameGraph-master/flamegraph.pl out1.floded > out1.svg
