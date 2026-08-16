---
title: C++ 并发速查
date: 2026-08-17 05:00:00
categories:
  - 编程语言
tags:
  - 编程语言
  - C++
  - programming-language-cpp
  - cpp-concurrency
  - cheatsheet
description: 1:1 发布自知识库：基础语法/C++/C++ 并发速查.md
source_note: 基础语法/C++/C++ 并发速查.md
---
# C++ 并发速查

thread库

C++中的多线程同步机制用于协调多个线程对共享资源的访问，避免数据竞争和不一致。
常见的同步机制包括互斥锁（`std::mutex`）、条件变量（`std::condition_variable`）、原子操作（`std::atomic`）和信号量（`std::counting_semaphore`）。
互斥锁用于保护临界区，条件变量用于线程间通信，原子操作确保操作的不可分割性，信号量用于控制资源访问数量。

##  线程:

- **`std::thread`**: 创建新线程并运行指定函数。
- **`join()`**: 阻塞当前线程，直到被调用的线程完成。
- **`detach()`**: 将线程分离，使其在后台运行。
- **`emplace_back()`**: 向容器添加元素，直接在容器内构造对象。

## 锁:

- `mutex`，互斥锁：提供基本的线程同步机制，用于保护共享数据。
	- 当一个线程锁定了一个互斥量，其他尝试锁定同一个互斥量的线程将会阻塞，直到互斥量被解锁。
	- mutex`提供了`lock()`、`unlock()`和`try_lock()`方法来控制互斥量的状态。
- - `std::shared_mutex` 读写锁：允许多个线程读取共享数据，但只允许一个线程写入。

```cpp
// 互斥量
std::mutex mtx;

// 线程函数
void threadFunction(int id) {
    std::lock_guard<std::mutex> lock(mtx); // 自动加锁
    std::cout << "Thread ID: " << id << " is running." << std::endl;
}

int main() {
    std::vector<std::thread> threads;
    // 创建多个线程
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back(threadFunction, i); // 使用 emplace_back 添加线程
    }
    // 等待所有线程完成
    for (auto& t : threads) {
        t.join(); // join 函数：等待线程结束
    }
    return 0;
}
```

- - **线程局部存储**：`thread_local`关键字可以声明线程局部存储的变量，这些变量在每个线程中都有独立的实例，互不干扰。
## atomic&内存序
原子变量，可以保证变量的赋值，修改是原子性的，要不全部完成，要么完全不操作

| 顺序 | 含义 |
|---|---|
| `memory_order_relaxed` | 仅保证当前变量操作原子 |
| `memory_order_acquire` | 读屏障，阻止前方操作重排到后方 |
| `memory_order_release` | 写屏障，阻止后方操作重排到前方 |
| `memory_order_acq_rel` | acquire + release |
| `memory_order_seq_cst` | 顺序一致（默认，最安全也最贵） |

```cpp
std::atomic<uint64_t> seq{0};
seq.load(std::memory_order_acquire);
seq.store(new_val, std::memory_order_release);
```

## 条件变量

 `std::condition_variable`
 线程间同步原语，用于阻塞线程直到另一个线程通知条件成立。

| 操作               | 含义                                      |
| ---------------- | --------------------------------------- |
| `wait(lk, pred)` | 阻塞，解锁 mutex；被唤醒时重新加锁，pred 为 false 则继续阻塞 |
| `notify_one()`   | 唤醒一个等待中的线程                              |
| `notify_all()`   | 唤醒所有等待中的线程                              |

```cpp
std::mutex mtx;
std::condition_variable cv;
bool ready = false;
void wait_for_ready() {
    std::unique_lock<std::mutex> lock(mtx);
    cv.wait(lock, []{ return ready; });
    // 条件满足后继续执行
}
void set_ready() {
    std::lock_guard<std::mutex> lock(mtx);
    ready = true;
    cv.notify_all();
}

```

>为什么需要 condition_variable
`mutex` 只能互斥，不能让线程"等在那里等另一个线程做完某事"。轮询 `while(!flag)` 会导致 CPU 空转，cv 解决了这个问题。

### 虚假唤醒（spurious wakeup）
	
内核可能随机唤醒等待线程，即使条件并未改变。**必须用带 predicate 的 wait 循环**：

```cpp
// 等待方
std::unique_lock<std::mutex> lk(mtx);          // cv 必须配合 unique_lock
while (true) {
    cv.wait(lk, [&] { return ready; });        // pred 为 false 时继续睡，不会空转
}

// 通知方
{
    std::lock_guard<std::mutex> lg(mtx);
    ready = true;                               // 锁内修改共享变量
}
cv.notify_one();                                // 通知唤醒
```

### wait_for — 带超时的等待

```cpp
std::cv_status status = cv.wait_for(lk, 100ms, [&] { return ready; });
if (status == std::cv_status::timeout) {
    // 超时未收到通知
}
```

### **信号量（`std::counting_semaphore`）**：

- 信号量用于控制对共享资源的访问数量，允许多个线程同时访问有限数量的资源。
- 通过`acquire()`和`release()`方法控制资源的获取和释放。
- 示例：
```cpp
std::counting_semaphore<10> semaphore(10);
void access_resource() {
    semaphore.acquire();
    // 访问资源
    semaphore.release();
}
```

## `std::function`

类型擦除的可调用对象包装器。

```cpp
std::function<void()> fn = [] { std::cout << "hello"; };
fn(); // 调用

std::function<void()> task = [captured, vars]() { /*...*/ };
queue.push(std::move(task));
```

## 参考

- [[WIKI/基础语法/C++/index]]
- [[C++ 并发编程]]
