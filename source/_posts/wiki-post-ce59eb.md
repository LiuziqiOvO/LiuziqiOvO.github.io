---
title: C++ 并发编程
date: 2026-08-17 05:00:00
categories:
  - 编程语言
tags:
  - 编程语言
  - C++
  - programming-language-cpp
  - concurrency
description: 1:1 发布自知识库：基础语法/C++/C++ 并发编程.md
source_note: 基础语法/C++/C++ 并发编程.md
---
# C++ 并发编程

C++11 是现代 C++ 标准并发编程的起点：它把线程、原子操作、互斥同步、条件同步和异步结果传递纳入标准库，让多线程代码不再完全依赖 Pthread、Windows Thread 等平台 API。

该中文教程仓库把 C++ 并发主题拆为 11 章和一个 C++11 标准附录：前半部分覆盖线程、互斥量、条件变量、future 和 atomic，后半部分继续进入内存模型、高级线程管理、并发数据结构与应用。目录页可见仓库约 5.5k stars / 1.5k forks，但当前目录页未直接显示许可证信息。

## 章节导航

仓库目录页显示中文内容按章节组织，另含 `appendix C++11 standards` 标准附录；具体技术结论仍以各章节正文为准。

| 章节 | 主题 | 当前处理状态 |
| --- | --- | --- |
| [Chapter 1 Introduction](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter1-Introduction) | C++11 并发库入口、核心头文件、`std::thread` 最小示例和 Linux/GCC 编译参数。 | 已提炼到本页。 |
| [Chapter 2 Thread Libraries](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter2-Thread-Libraries) | Pthread、Windows 多线程库、多线程库对比。 | 目录存在，但 2.1 / 2.2 / 2.3 当前为 GitHub 空文件，只记录为占位来源。 |
| [Chapter 3 Thread](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter3-Thread) | `std::thread` 线程对象和生命周期。 | 已补充 `std::thread` / `std::this_thread` 速记。 |
| [Chapter 4 Mutex](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter4-Mutex) | 互斥量和锁。 | 已补充 mutex 家族、RAII 锁和空文件占位。 |
| [Chapter 5 Condition Variable](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter5-Condition-Variable) | 条件变量等待 / 通知。 | 已补充最小速记。 |
| [Chapter 6 Future](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter6-Future) | future / promise / async 异步结果。 | 已补充最小速记。 |
| [Chapter 7 Atomic](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter7-Atomic) | 原子操作。 | 已补充最小速记。 |
| [Chapter 8 Memory Model](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter8-Memory-Model) | C++ 内存模型。 | 已补充最小速记。 |
| [Chapter 9 Advanced Thread Management](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter9-Advanced-Thread-Management) | 高级线程管理。 | 已补充最小速记。 |
| [Chapter 10 Concurrent Data Structure](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter10-Concurrent-Data-Structure) | 并发数据结构。 | 已补充最小速记。 |
| [Chapter 11 Application](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/chapter11-Application) | 并发编程应用。 | 已补充最小速记。 |

| [Appendix C++11 standards](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh/appendix%20C%2B%2B11%20standards) | C++11 标准附录。 | 目录存在，待需要时核验。 |

## 核心头文件

第 1 章把 C++11 并发库定位为从平台线程库走向标准库线程模型的入口，重点是可移植的线程、同步、原子和异步结果抽象。

| 头文件                    | 关键类型 / 函数                                                                           | 作用                      |
| ---------------------- | ----------------------------------------------------------------------------------- | ----------------------- |
| `<thread>`             | `std::thread`、`std::this_thread`                                                    | 创建和管理线程，表达当前线程相关操作。     |
| `<atomic>`             | `std::atomic<T>`                                                                    | 对共享变量做原子读写和更新，避免普通数据竞争。 |
| `<mutex>`              | `std::mutex`、`std::lock_guard`、`std::unique_lock`                                   | 保护临界区，管理锁的获取和释放。        |
| `<condition_variable>` | `std::condition_variable`                                                           | 在线程之间做等待 / 通知，避免无意义忙等。  |
| `<future>`             | `std::future`、`std::shared_future`、`std::promise`、`std::packaged_task`、`std::async` | 表达异步任务结果和跨线程结果传递。       |

## 最小线程模型

`std::thread` 的基本流程是：把可调用对象交给线程执行，主线程在合适位置 `join()` 等待它结束。

```cpp
#include <iostream>
#include <thread>

void hello() {
  std::cout << "hello from worker\n";
}

int main() {
  std::thread worker(hello);
  worker.join();
  return 0;
}
```

需要注意：线程创建只是开始；并发程序的主要复杂度在生命周期、共享数据同步和异常路径收束。已经启动且仍处于 joinable 状态的 `std::thread`，必须在对象析构前 `join()` 或 `detach()`，否则会触发 `std::terminate()`。

## `std::thread` 线程对象

`std::thread` 定义在 `<thread>` 中，表示一个 C++ 标准线程对象；它封装的是线程所有权，而不是一个可复制的普通句柄。

关键规则：

- 默认构造的 `std::thread` 是空对象，不代表实际线程。
- 用函数、函数对象或 lambda 构造 `std::thread` 时，会启动新线程执行该可调用对象。
- `std::thread` 禁止拷贝，只能移动；移动表示线程所有权转移。
- 对仍然 `joinable()` 的目标对象做移动赋值会导致 `std::terminate()`。
- 仍处于 `joinable()` 的线程对象在析构前必须被 `join()` 或 `detach()` 处理。

| 操作                       | 含义                              | 注意点                                   |
| ------------------------ | ------------------------------- | ------------------------------------- |
| `joinable()`             | 判断线程对象是否关联了可汇合线程。               | 线程函数已执行完但未 `join()` 时，通常仍是 joinable。  |
| `join()`                 | 当前线程阻塞等待目标线程结束。                 | 常用于主线程收束 worker 生命周期。                 |
| `detach()`               | 让线程和 `std::thread` 对象分离，后台独立运行。 | 分离后无法再用原对象等待线程结束。                     |
| `get_id()`               | 获取线程 ID。                        | `detach()` 后返回默认 `std::thread::id()`。 |
| `swap()`                 | 交换两个线程对象关联的底层线程。                | 交换的是所有权 / 句柄关系。                       |
| `native_handle()`        | 取平台相关原生线程句柄。                    | 可与 pthread 等平台 API 配合，但会降低可移植性。       |
| `hardware_concurrency()` | 返回实现建议的并发线程数。                   | 只是提示值，不是性能或资源保证。                      |

把引用传给线程函数时，通常要用 `std::ref()` 显式保留引用语义；否则参数会按线程构造规则复制或移动到新线程上下文。

## `std::this_thread`

`std::this_thread` 是 `<thread>` 提供的当前线程辅助命名空间：

| 函数 | 用途 | 备注 |
| --- | --- | --- |
| `get_id()` | 获取当前线程 ID。 | 常用于日志和调试。 |
| `yield()` | 主动让出执行机会。 | 只是给调度器的提示，不保证立刻切换。 |
| `sleep_for(duration)` | 休眠一段时长。 | 实际休眠可能因调度更长。 |
| `sleep_until(time_point)` | 休眠到指定时间点。 | 适合按绝对时间等待。 |

## mutex 家族

`<mutex>` 提供互斥量类型、RAII 锁管理器、锁策略标签，以及 `call_once` 等一次性调用工具。互斥量本身负责“互斥访问”，锁对象负责“用生命周期管理加锁和解锁”。

| 类型 | 定位 | 关键点 |
| --- | --- | --- |
| `std::mutex` | 基础独占互斥量。 | 支持 `lock()` / `try_lock()` / `unlock()`；同一线程重复加锁可能死锁。 |
| `std::recursive_mutex` | 允许同一线程重复加锁的互斥量。 | 每次成功加锁都要对应一次 `unlock()`，计数归零才真正释放。 |
| `std::timed_mutex` | 支持超时尝试加锁的互斥量。 | 增加 `try_lock_for(duration)`、`try_lock_until(time_point)`。 |
| `std::recursive_timed_mutex` | 递归 + 定时能力组合。 | 同时注意递归解锁次数和超时加锁失败路径。 |

注意点：

- `std::mutex` 默认未加锁，不能复制或移动。
- `try_lock()` 成功后仍需要释放锁；不要因为“try”就忘记 unlock。
- 普通临界区优先用 RAII 锁对象，少手写 `lock()` / `unlock()`。
- `recursive_mutex` 能绕过“同一线程重复加锁”的限制，但也可能掩盖设计问题，应谨慎使用。

## RAII 锁管理

`std::lock_guard` 和 `std::unique_lock` 都把锁的释放绑定到对象析构，核心价值是让异常、早返回等路径也能释放互斥量。

| 维度 | `std::lock_guard` | `std::unique_lock` |
| --- | --- | --- |
| 定位 | 简单作用域锁。 | 灵活锁管理器。 |
| 构造时加锁 | 默认立即加锁。 | 支持立即、延迟、尝试、接管已有锁。 |
| 手动 `lock()` / `unlock()` | 不支持。 | 支持。 |
| 是否可移动 | 不可移动。 | 可移动，不可复制。 |
| 是否能查询持锁 | 不支持。 | 支持 `owns_lock()` / `operator bool()`。 |
| 典型场景 | 整个作用域都需要持锁的短临界区。 | 条件变量、延迟加锁、多个 mutex 同时加锁、提前释放锁。 |

常用策略标签：

| 标签 | 含义 | 风险 |
| --- | --- | --- |
| `std::adopt_lock` | 当前线程已经持锁，锁对象只接管释放责任。 | 未持锁时使用会出错。 |
| `std::defer_lock` | 构造锁对象但先不加锁。 | 后续进入临界区前必须确认已加锁。 |
| `std::try_to_lock` | 构造时尝试加锁，不阻塞。 | 可能失败，必须检查是否持锁。 |

多个互斥量需要同时加锁时，可先构造 `std::unique_lock<std::mutex>(m, std::defer_lock)`，再交给 `std::lock(l1, l2)` 统一加锁，以降低死锁风险。

## mutex 辅助函数占位

C++ 并发编程指南第 4 章列出 `4.4 Auxiliary-function.md` 和 `4.5 Mutex vs pthread.md`，但当前 GitHub 页面没有可用正文，因此本页只记录占位，不从空文件推导 `std::lock`、`std::try_lock`、`std::call_once`、`once_flag` 或 `pthread_mutex_t` 对比结论。后续补这些主题时应另找可靠来源。

## Linux 编译速记

Linux / GCC 下编译 C++11 线程程序通常同时需要 C++ 标准参数和 pthread 链接参数：

```bash
g++ main.cpp -Wall -std=c++11 -ggdb -pthread -o main
```

其中 `-std=c++11` 打开 C++11 标准库接口，`-pthread` 同时影响编译和链接阶段的线程支持。第 1 章提示：Linux / GCC 4.6 环境下如果漏掉 `-pthread`，运行线程程序可能抛出 `std::system_error` 并提示 `Operation not permitted`。

旧 GCC 版本若不支持 `-std=c++11`，可能需要使用历史兼容写法 `-std=c++0x`；新项目应优先使用当前编译器和更新的 C++ 标准。

## 线程库章节占位

C++ 并发编程指南第 2 章列出了 Pthread、Windows multithreading 和多线程库对比三个文件，但当前 GitHub 页面均显示 `0 lines (0 loc) · 0 Bytes`。因此本页只记录“章节存在但没有可引用正文”，不从这些空文件推导技术结论。

后续如果补充 Pthread / Windows Thread 对比，应另外核验可靠来源；常见对比维度包括：平台可移植性、线程创建 API、线程结束 / join 语义、同步原语、错误处理方式、与 C++11 `std::thread` 的抽象层级差异。

## 学习顺序

1. 用 `std::thread` 理解线程创建、`join()`、`detach()` 和线程生命周期。
2. 用 `std::mutex` / RAII lock 保护共享状态，先避免数据竞争。
3. 学 `std::condition_variable`，把轮询等待改为事件式等待。
4. 学 `std::atomic`，理解原子性、内存序和适合无锁化的场景。
5. 学 `std::future` / `std::promise` / `std::async`，把“启动任务”和“取得结果”解耦。

## `std::condition_variable`

条件变量解决的是“线程暂时不能继续执行，但也不想忙等”的问题。它通常和 `std::mutex`、`std::unique_lock`、共享状态变量一起使用：生产者在状态变化后 `notify_one()` / `notify_all()`，消费者在条件不满足时 `wait()`。

关键点：

- 等待前必须先持有互斥量，典型写法是 `std::unique_lock<std::mutex> lock(m);`。
- 优先使用带谓词的 `wait(lock, pred)`，把“检查条件”和“睡眠等待”放进同一个模式里。
- 被唤醒不代表条件一定满足，可能有虚假唤醒，因此应始终围绕共享状态写循环或谓词。

```cpp
std::mutex m;
std::condition_variable cv;
bool ready = false;

void consumer() {
  std::unique_lock<std::mutex> lock(m);
  cv.wait(lock, [] { return ready; });
}
```

## `std::future` / `std::promise` / `std::async`

这一组抽象把“任务执行”和“结果获取”拆开了：

- `std::promise<T>`：某个线程负责把结果或异常写进去。
- `std::future<T>`：另一个线程之后再来取结果。
- `std::async`：标准库帮你启动异步任务，并返回 `future`。

常见用法：

- 跨线程单次结果传递，适合 `promise + future`。
- 简单并行任务，适合 `std::async`。
- 需要多个消费者读取同一结果时，转成 `std::shared_future`。

注意点：

- `future.get()` 只能消费一次；`shared_future.get()` 可以多次读取。
- `promise` 没写结果就销毁，会让对端在 `future.get()` 时收到异常。
- `std::async` 的调度策略可能是立刻异步执行，也可能延迟到 `get()` / `wait()` 时才执行，应按 launch policy 明确控制。

## `std::atomic`

`std::atomic<T>` 适用于简单共享状态的原子读写更新，例如计数器、标志位、无锁队列中的某些指针或索引。它解决的是单个变量级别的原子性，不自动替代复杂临界区。

常见操作：

- `load()` / `store()`
- `fetch_add()` / `fetch_sub()`
- `exchange()`
- `compare_exchange_weak()` / `compare_exchange_strong()`

使用边界：

- 如果不变量跨多个字段，仍通常需要 mutex。
- 无锁不等于更快；高竞争下 CAS 自旋也可能很贵。
- 原子类型避免数据竞争，但程序是否“按预期顺序被别的线程看见”还取决于内存序。

## 内存模型速记

C++ 内存模型定义了多线程里“一个线程的写，另一个线程何时、以什么顺序可见”。理解它的核心不是背术语，而是分清三件事：

- 原子性：单次读写会不会被撕裂。
- 可见性：一个线程的写，另一个线程什么时候能看到。
- 有序性：编译器和 CPU 能否重排操作。

最常见的同步口径是：

- mutex 加锁 / 解锁天然建立同步关系。
- 条件变量等待 / 通知和 mutex 组合使用，依赖共享状态建立可见性。
- 原子操作可用不同 memory order 表达更细粒度的同步。

工程上默认先用 mutex 和条件变量拿到正确性；只有确认共享状态很小、竞争模式明确时，再考虑原子和更细粒度的内存序优化。

## 高级线程管理

“高级线程管理”通常讨论的是如何让线程生命周期和资源调度更可控，而不是只会 `std::thread t(...); t.join();`。

常见主题：

- 用线程池而不是每个任务都新建线程，避免频繁创建 / 销毁成本。
- 用任务队列把“生产任务”和“执行任务”的节奏解耦。
- 用取消标记、停止条件或退出协议让 worker 能有序停机。
- 管理 `join()`、`detach()`、异常传播和 shutdown 顺序，避免后台线程泄漏。

如果代码已经开始讨论“线程数量怎么设”“任务怎么排队”“程序退出时怎么收尾”，说明问题已经从线程 API 进入线程管理层。

## 并发数据结构

并发数据结构关注的是“多个线程同时访问同一个逻辑容器时，如何保证正确性和吞吐”。典型对象包括线程安全队列、无锁栈、读多写少缓存、分段锁哈希表等。

常见取舍：

- 粗粒度锁：实现简单，正确性容易保证，但竞争时吞吐差。
- 细粒度锁：并发度更高，但更容易死锁或出错。
- 无锁结构：依赖原子和 CAS，性能潜力高，但 ABA、内存回收、调试复杂度都更高。

学习顺序通常是先写出“锁住整个容器”的正确版本，再考虑是否需要细化锁粒度或转向无锁设计。

## 并发编程应用

并发的真正难点通常不在 API，而在把业务问题改写成合适的并发模型。常见应用模式包括：

- 生产者 - 消费者：日志、消息队列、任务分发。
- reader / writer：配置读取、缓存查询、索引访问。
- pipeline：多个阶段串联，每阶段各自并行。
- fork / join：把一个大任务切成多个子任务并行执行，再汇总结果。

做业务代码时，优先先回答三个问题：

1. 哪些状态是共享的。
2. 共享状态是否真的需要并发访问。
3. 正确性和可解释性是否比“理论最高吞吐”更重要。

## 参考

- [C++ 并发编程指南仓库目录](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/tree/master/zh)
- [C++ 并发编程 introduction](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/blob/master/zh/chapter1-Introduction/Cplusplus-Concurrency-Introduction.md)
- [Chapter 3 Introduction-to-Thread](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/blob/master/zh/chapter3-Thread/Introduction-to-Thread.md)
- [4.1 Mutex-header-synopsis](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/blob/master/zh/chapter4-Mutex/4.1%20Mutex-header-synopsis.md)
- [4.2 Mutex-tutorial](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/blob/master/zh/chapter4-Mutex/4.2%20Mutex-tutorial.md)
- [4.3 Lock-tutorial](https://github.com/forhappy/Cplusplus-Concurrency-In-Practice/blob/master/zh/chapter4-Mutex/4.3%20Lock-tutorial.md)
