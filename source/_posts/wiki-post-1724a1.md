---
title: C++ 基础速查
date: 2026-08-17 05:00:00
categories:
  - 编程语言
tags:
  - 编程语言
  - C++
  - 基础
  - 语法
  - cpp
description: 1:1 发布自知识库：基础语法/C++/C++ 基础速查.md
source_note: 基础语法/C++/C++ 基础速查.md
---
# C++ 基础速查

## 类型转换

```cpp
static_cast<目标类型>(表达式)       // 常规、编译期可检查的转换
const_cast<目标类型>(表达式)        // 添加或移除 const / volatile
reinterpret_cast<目标类型>(表达式)  // 低层二进制解释，风险高
dynamic_cast<目标类型>(表达式)      // 多态类型运行时安全转换
```

## 字符串

常用转换：

| 函数 | 作用 |
| --- | --- |
| `to_string(x)` | 数字转 `std::string` |
| `stoi(s)` | 字符串转 `int` |
| `stol(s)` | 字符串转 `long` |
| `stoll(s)` | 字符串转 `long long` |
| `stof(s)` | 字符串转 `float` |
| `stod(s)` | 字符串转 `double` |

`std::string` 常用成员：

| 操作 | 作用 |
| --- | --- |
| `size()` / `length()` | 字符串长度 |
| `empty()` | 是否为空 |
| `clear()` | 清空 |
| `append()` | 追加 |
| `insert(pos, str)` | 插入 |
| `erase(pos, len)` | 删除子串 |
| `replace(pos, len, str)` | 替换子串 |
| `find(str)` / `rfind(str)` | 正向 / 反向查找 |
| `c_str()` | 获取 C 风格字符串 |

```cpp
std::string s1;
std::string s2("Hello");
std::string s3(s2);
std::string s4(10, 'a');
```

## `stringstream`

```cpp
#include <sstream>

std::string line;
std::stringstream ss(line);
```

`stringstream` 常用于把一行字符串按空白切成多个字段，或在字符串与数字之间做流式转换。

## 跨文件与特殊关键字

```cpp
extern int a;          // 声明变量在其他文件定义
static int x;          // 文件内全局变量，其他文件不可见
static void foo() {}   // 函数只在当前文件可见
{ static int y; }      // 局部静态变量，生命周期全局，作用域局部
```

```cpp
explicit A(int n);     // 禁止 A a = 1 这类隐式转换
void foo() noexcept;   // 承诺不抛异常，抛出会 terminate
inline int max(int a, int b) { return a > b ? a : b; }
```

## 文件读取

```cpp
#include <fstream>

std::ifstream infile(input_csv);
if (infile.is_open()) {
    // 读取文件内容
}
```

`std::ifstream` 是输入文件流，用于从文件中读取数据。

## 右值引用与移动语义

| 概念 | 速记 |
| --- | --- |
| 左值 | 有名字、可取地址，能放在赋值号左边 |
| 右值 | 临时值、通常不可取地址，不能放在赋值号左边 |
| 将亡值 | 即将被移动或销毁的值，常用于移动构造 / 移动赋值 |
| 左值引用 | 对左值起别名，必须绑定到可取地址对象 |
| 右值引用 | 绑定右值；可用 `std::move` 把左值显式转为右值引用语境 |

```cpp
auto b = std::move(a);  // 表示允许 b 窃取 a 的资源
```

移动语义可以理解为**转移所有权**。对拥有堆资源的对象，移动构造可避免深拷贝；对 `int`、`float` 这类基本类型通常没有收益。性能敏感路径中，`std::move` 只表达允许移动，具体收益还取决于类型是否实现移动构造 / 移动赋值，参见 [[高性能 C++ 编程#CPU 与对象开销]]。

## 完美转发

完美转发用于在模板函数中保留实参的左值 / 右值属性，再转发给目标函数。

```cpp
template <class T>
void wrapper(T&& x) {
    target(std::forward<T>(x));
}
```

## 参考

- [[WIKI/基础语法/C++/index]]
- [[高性能 C++ 编程]]
