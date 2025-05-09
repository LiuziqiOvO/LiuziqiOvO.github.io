## 仓库结构说明

本仓库用于代码练习，主要包含以下内容：

.
├── docs/ # 存放所有题解文档
│ ├── array/ # 数组类题目
│ ├── linked-list/ # 链表类题目  
│ ├── tree/ # 树类题目
│ ├── string/ # 字符串类题目
│ ├── dp/ # 动态规划类题目
│ └── graph/ # 图论类题目
│—— books/ # 存放所有书籍
│ └── C++ Primer plus / # C++ Primer 书籍
│
├── code/ # 存放所有代码实现
│ ├── array/ # 与 docs 保持相同结构
│ ├── linked-list/
│ ├── tree/
│ ├── string/
│ ├──
│ └── graph/
│
└── INDEX.md # 题目索引文件，

灵神题单: https://huxulm.github.io/lc-rating/list/slide_window
# 数据结构
## 常用枚举
## 前缀和
## 差分
## 栈
## 队列
## 堆（优先队列）
## 字典树

## 并查集
并查集是一种树形的数据结构，用于处理一些不相交集合（Disjoint Sets）的合并及查询问题。主要支持两种操作：
- 查找(Find)：查询某个元素属于哪个集合
- 合并(Union)：把两个不相交的集合合并为一个集合
参考：https://leetcode.cn/problems/maximum-segment-sum-after-removals/solutions/1763638/by-endlesscheng-p61j/
[[并查集]]


## 树状数组和线段树

# 滑动窗口

https://leetcode.cn/discuss/post/3578981/

## 定长

## 不定长

## 单序列双指针

# 二分查找

https://leetcode.cn/discuss/post/3579164/
注意规范定义，并严格遵循：左闭右开区间。

单调栈：
https://leetcode.cn/discuss/post/3579480/ti-dan-dan-diao-zhan-ju-xing-xi-lie-zi-d-u3hk/

位运算：
https://leetcode.cn/discuss/post/3580371/fen-xiang-gun-ti-dan-wei-yun-suan-ji-chu-nth4/

# 3. 网格图

https://leetcode.cn/discuss/post/3580195/fen-xiang-gun-ti-dan-wang-ge-tu-dfsbfszo-l3pa/
（DFS/BFS/综合应用）

## 3.1 网格图 DFS

DFS 是一个递归的“插旗”标记的过程。

1. 统计网格中有多少个独立的连通块（如岛屿数量）
2. 计算每个连通块的大小（如最大岛屿面积）
3. 标记或修改连通块中的所有元素（如填充封闭区域）
   部分题目也可以用 BFS 或并查集解决。

```cpp
    //* 递归统计面积的DFS函数写法：
        auto dfs = [&](auto&& dfs, int i, int j) -> int {
            if (i < 0 || i >= m || j < 0 || j >= n || land[i][j] != 0) return 0;
            land[i][j] = 2;
            return 1 + dfs(dfs, i+1, j) + dfs(dfs, i-1, j) + dfs(dfs, i, j+1) + dfs(dfs, i, j-1);
        };

```

> **Lambda 表达式解析**:
>
> - `[&]`: 捕获列表，通过引用捕获所有外部变量（如 m、n、land）
> - `(auto&& dfs, int i, int j)`: 参数列表
>   - Lambda 要递归调用自己，必须把自己作为参数传入，但不能直接在 Lambda 内部使用自己的名字（dfs），因为定义还没完成
>   - `auto`:
>     - Lambda 的实际类型很复杂，用 auto 让编译器自动推导类型
>   - `&&`:
>     - && 是通用引用（universal reference）通用引用能完美转发，保持原始类型的所有属性，保持其值类别避免不必要的拷贝

## 3.2 网格图 BFS

适用于需要计算最短距离（最短路）的题目。
BFS 维护一个队列进行层层扩散（树的层序遍历）。

> 把队列换成栈就是 DFS，换成优先队列就是 A\*

```cpp
        // 将所有的 0 添加到队列中，并设置初始距离为 0
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (mat[i][j] == 0) {
                    dist[i][j] = 0;
                    q.push({i, j});
                }
            }
        }

        // BFS
        while (!q.empty()) {
            // 获取队列首元素
            int row = q.front().first;
            int col = q.front().second;
            q.pop();

            // 也可以先获取上一层级的宽度：q.size(), 扩展q.size()次，这样可以记录层数（步数）。

            for (const auto& dir : dirs) {  // 向四个方向扩展
                int newRow = row + dir[0];
                int newCol = col + dir[1];

                if (newRow >= 0 && newRow < m && newCol >= 0 && newCol < n) {
                    if (dist[newRow][newCol] > dist[row][col] + 1) {
                        dist[newRow][newCol] = dist[row][col] + 1;
                        q.push({newRow, newCol}); // 可以扩散加入队列
                    }
                }
            }
        }

        return dist;
```

# 4. 动态规划

https://leetcode.cn/discuss/post/3581838/fen-xiang-gun-ti-dan-dong-tai-gui-hua-ru-007o/
掌握动态规划（DP）是没有捷径的，咱们唯一能做的，就是投入时间猛猛刷题。

1. 定义 DP 数组的含义
   记忆化搜索 = DP 数组 = python 里的 @cache。 其实就是开一个数组，记录递归函数的结果，避免重复计算。
2. 写状态转移方程
   **「选或不选」** 和 **「枚举选哪个」** 两种基本思考方式。
   通过对 DP 数组的 for 循环我们可以去掉递归中的「递」，只保留「归」的部分，即自底向上计算。
3. 找边界条件，得到结果
4. 优化，滚动数组
   观察状态转移方程（是否依赖前一个状态），判断是否可以优化为一维数组。
   dp[i-1][j] 可以理解为旧的 dp[i][j]
   把遍历顺序换位倒序即可（防止覆盖）

## 4.1 入门 DP

### 4.1.1 爬楼梯

### 4.1.2 打家劫舍

> https://leetcode.cn/problems/climbing-stairs/solutions/2560716/jiao-ni-yi-bu-bu-si-kao-dong-tai-gui-hua-7zm1/

### 4.1.3 最大子数组

## 4.2 网格图 DP

## 4.3 0-1 背包

每个物品只能选一次。
\*2915

## 4.4 完全背包

物品可以重复选，无个数限制。
**问**：关于完全背包，有两种写法，一种是外层循环枚举物品，内层循环枚举体积；另一种是外层循环枚举体积，内层循环枚举物品。如何评价这两种写法的优劣？
**答**：两种写法都可以，但更推荐前者。外层循环枚举物品的写法，只会遍历物品数组一次；而内层循环枚举物品的写法，会遍历物品数组多次。从 cache 的角度分析，多次遍历数组会导致额外的 cache miss，带来额外的开销。所以虽然这两种写法的时间空间复杂度是一样的，但外层循环枚举物品的写法常数更小。
\*2606

# 5 图论

图论算法（DFS/BFS/拓扑排序/最短路/最小生成树/二分图/基环树/欧拉路径）
https://leetcode.cn/discuss/post/3581143/fen-xiang-gun-ti-dan-tu-lun-suan-fa-dfsb-qyux/

## 一、基础遍历

DFS，BFS。对于有向无环图，邻接矩阵可以直接保证不重复访问，代码写起来比网格图更简单了。

## 二、拓扑排序

把拓扑排序想象成一个黑盒，给它一堆杂乱的先修课约束，它会给你一个井井有条的课程学习安排。
这一种在图上的「排序」，可以把杂乱的点排列一排。
前提条件是图中无环，从而保证每条边是从排在前面的点，指向排在后面的点。

**Kahn's Algorithm (基于入度的算法):**
- 初始化：一个队列，加入所有入度为0的顶点
- 当队列不为空时，执行以下步骤：
    - 从队列中取出一个顶点 `u`，并将其添加到拓扑排序的结果列表中。
    - 对于顶点 `u` 的所有邻接顶点 `v`（即存在边 `(u, v)`），将 `v` 的入度减1。
    - 如果顶点 `v` 的入度变为0，则将 `v` 加入队列。
- 如果最终拓扑排序结果列表中的顶点数量等于图的顶点数量，则拓扑排序成功。否则，图中存在环。
  
**一句话：** 统计入度，入度为 0 的节点入队，然后遍历所有后继节点，减少入度，如果入度为 0，则入队。

```cpp
*拓扑排序模板题

210. 课程表 II
中等
相关标签
相关企业
提示
现在你总共有 numCourses 门课需要选，记为 0 到 numCourses - 1。给你一个数组 prerequisites ，其中 prerequisites[i] = [ai, bi] ，表示在选修课程 ai 前 必须 先选修 bi 。

例如，想要学习课程 0 ，你需要先完成课程 1 ，我们用一个匹配来表示：[0,1] 。
返回你为了学完所有课程所安排的学习顺序。可能会有多个正确的顺序，你只要返回 任意一种 就可以了。如果不可能完成所有课程，返回 一个空数组 。

*/
class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>> &prerequisites) { //节点数，单向边
        vector<vector<int>> graph(numCourses);                                  //邻接表
        vector<int>         inDeg(numCourses);                                  // 节点入度
        for (auto &edge : prerequisites) {
            graph[edge[1]].push_back(edge[0]);
            inDeg[edge[0]]++;
        }
    
        // 1. init start node
        queue<int> q;
        for (int i = 0; i < numCourses; i++) {
            if (inDeg[i] == 0) q.push(i);
        }

        vector<int> ans;
        while (!q.empty()) {
            int t = q.front();
            q.pop();
            ans.push_back(t);

            // 2. 遍历当前节点的所有后继节点
            for (auto next : graph[t])
                if (--inDeg[next] == 0) //*减少后继节点的入度，如果入度变为0
                    q.push(next);       // 将入度为0的节点加入队列
        }

	    // ans
        return ans.size() == numCourses ? ans : vector<int>{}; // 如果所有课程都被排序，返回结果；否则返回空数组
    }
};
```
## 三、最短路

### 单源最短路：Dijkstra 算法

https://leetcode.cn/problems/network-delay-time/solutions/2668220/liang-chong-dijkstra-xie-fa-fu-ti-dan-py-ooe8/
要求：加权图，边权不能为负数
- 使用**最小堆 + 邻接表**：`O((V + E) * log V)`
- 使用**邻接矩阵**：`O(V^2)`，适合稠密图


### 全源最短路：Floyd 算法
https://leetcode.cn/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/solutions/2525946/dai-ni-fa-ming-floyd-suan-fa-cong-ji-yi-m8s51/


## 七、 二分图染色（二分图的最大匹配）

> "四色定理"(Four Color Theorem)。但是这个定理有一个重要的限制条件：
> 四色定理只适用于平面图（可以在平面上画出且边不相交的图）
> 而我们这道题中的图不一定是平面图，比如示例中的图就包含了 K4（4 个顶点的完全图）
> 对于一般的图：
> 可能需要比 4 更多的颜色
> 最少需要的颜色数等于图的色数(chromatic number)
> 一个完全图 Kn 需要 n 种颜色

**DSATUR (Degree of Saturation) 贪心图着色算法。**
DSATUR 算法的主要策略是：
1. 选择着色点：优先选择饱和度最高的未着色顶点： （饱和度指的是一个顶点的相邻顶点中已使用的不同颜色的数量。）在饱和度相同的情况下，选择度数最大的顶点
2. 染色：遍历邻节点，找到最小的不同颜色
3. 更新该点的未染色邻节点的饱和度

```cpp
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
/*
n
m
*/
int main() {
    int n, m; // n个节点， m边
    cin >> n, m;
    vector<vector<bool>> graph(n + 1, vector<bool>(n + 1, false));
    vector<int>          deg(n + 1, 0); // 入度
    for (int i = 0; i < m; i++) {
        int a, b;
        cin >> a >> b;
        graph[a][b] = true;
        graph[b][a] = true;
        deg[a]++;
        deg[b]++;
    }

    vector<int> colors(n + 1, 0); //记录节点颜色
    vecotr<set> satur(n + 1, 0); //每个节点相邻节点使用的颜色集合(饱和度, Saturation)

    // DSATUR算法
    for (int colored = 0; colored < n; colored++) {
        // 1. 找到未着色的饱和度最大的节点(饱和度表示相邻节点使用的颜色集合的大小)
        int maxSat = -1;
        int maxDeg = -1;
        int node   = -1; //current node
        for (int i = 1; i <= n; i++) {
            if (colors[i] == 0) { // 未着色
                if (satur[i].size > maxSat || (satur[i].size() == maxSat && deg > maxDeg)) {
                    //饱和度最大的节点 || 饱和度=max，度数最大的节点
                    maxSat = satur[i].size();
                    maxDeg = deg[i];
                    node   = i;
                }
            }
        }
        // 2. 染色：遍历邻节点，找到最小的不同颜色
        int color = 1;
        while (satur[node].count(color)) { color++; }
        colors[node] = color;
        // 3. 更新该点的未染色邻节点的饱和度
        for (int i = 1; i <= n; i++) {
            if (graph[node][i] && colors[i] == 0) { satur[i].insert(color); }
        }
    }

    // ans
    int maxColor = 0;
    for (int i = 1; i <= n; i++) { maxColor = max(maxColor, colors[i]); }
    cout << maxColor << endl;
    return 0;
}
```

# 常用数据结构

https://leetcode.cn/discuss/post/3583665/

## 7、并查集

7.5 区间并查集
7.6 边权并查集

## 8、树状数组和线段树

# 灵神题单进度：

{
  "53": "AC",
  "62": "AC",
  "63": "AC",
  "64": "AC",
  "70": "AC",
  "120": "AC",
  "198": "AC",
  "200": "AC",
  "210": "AC",
  "279": "AC",
  "310": "REVIEW_NEEDED",
  "322": "AC",
  "377": "AC",
  "416": "AC",
  "463": "AC",
  "474": "AC",
  "494": "AC",
  "518": "AC",
  "542": "AC",
  "547": "AC",
  "643": "AC",
  "695": "AC",
  "740": "REVIEW_NEEDED",
  "746": "AC",
  "797": "AC",
  "841": "AC",
  "851": "AC",
  "994": "AC",
  "1034": "AC",
  "1052": "AC",
  "1091": "AC",
  "1129": "AC",
  "1162": "AC",
  "1311": "AC",
  "1343": "AC",
  "1456": "AC",
  "1462": "AC",
  "1749": "AC",
  "1926": "AC",
  "1971": "AC",
  "2090": "AC",
  "2115": "REVIEW_NEEDED",
  "2379": "AC",
  "2461": "AC",
  "2466": "AC",
  "2606": "AC",
  "2658": "AC",
  "2787": "AC",
  "2841": "AC",
  "2915": "AC",
  "3180": "REVIEW_NEEDED",
  "3243": "REVIEW_NEEDED",
  "LCS 03": "REVIEW_NEEDED",
  "面试题 16.19": "AC"
}

# 其他

> for 循环里的循环变量：
> 要 修改 → 用&
> 大对象/复杂类型只读 → 用 const &
> 小对象且只读 → 可不用&
