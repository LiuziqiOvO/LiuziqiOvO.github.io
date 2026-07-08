---
title: LSM-Tree 到 RocksDB：写路径、读放大与 Compaction 的工程取舍
date: 2026-06-25 10:00:00
categories:
  - 技术笔记
tags:
  - LSM-Tree
  - RocksDB
  - LevelDB
  - 存储系统
description: 从 LSM-Tree 的基本模型出发，整理 LevelDB 的 SSTable/Block 结构和 RocksDB 在写路径、读路径、compaction 上的工程取舍。
review_status: pending
---

## LSM-Tree 基本模型

LSM-Tree: Log-Structured Merge-Tree。

原文：[The Log-Structured Merge-Tree (LSM-Tree)](https://www.cs.umb.edu/~poneil/lsmtree.pdf)

LSM Tree 中的 $C_0$ 树存放在内存中，而 $C_1$ ~ $C_k$ 则存放在磁盘上。对于不频繁访问的数据，不断地从 $C_0$ 向 $C_k$ 移动。$C_i$ 有大小限制，数据溢出后，将数据归并到 $C_{i+1}$ 中。

**Five Minute Rule**

Jim Gray，Gianfranco Putzolu：对于随机访问频率不少于每五分钟一次的页面应该被缓存。五分钟只是一个意会，基于当时的内存与磁盘成本。

### 包含两个树结构的 LSM-Tree

LSM-Tree 可以包含两个或者更多树结构，下面以两个树结构为例。

因为 $C_0$ 树是在内存中的，不一定要使用 B 树结构，平衡二叉树也是可以的。$C_1$ 是放在磁盘中的，需要选择合适结构并优化。

$C_1$ 树相比于 B 树，对连续 I/O 操作进行了优化。在 $C_1$ 树的每一层中，邻近的节点在磁盘上的位置也是相邻的。

### 滚动合并

当一条日志被写入后，该条日志记录的索引项被插入到 $C_0$ 树中。如果 $C_0$ 树大小超过阈值，会进行 rolling merge。

先读取 $C_1$ 树最底层的索引项，这个缓存了多个页面索引项的合并区块称为 empty block。每次合并操作从已读取的多个索引项中取一个磁盘页面索引项，和 $C_0$ 中读取的一个最底层索引项合并；合并之后新生成的节点首先被写入到 filling block 缓冲区。当 filling block 填充满之后，所缓冲的 $C_1$ 新叶子节点被写入到磁盘上的空闲区域。

合并前的 block 并没有被覆盖，可用于故障恢复；合并过程中也会保存检查点，将缓存的信息强制写入磁盘。

### 查找与删除

数据按新旧程度存在于 $C_0$ ~ $C_i$，查操作从 $C_0$ 开始。因为查找了多个树，相比 B-tree 更耗时；但由于 $C_0$ 在内存中，最近一段时间内插入的数据无需查到磁盘。

对于 LSM 树的删除操作，也可以采用延迟与批量化的方式优化：可将删除操作推迟到 merge 时再执行。

### 多层 LSM-Tree 的并发冲突

在 LSM 中，以节点作为加锁的最小单元，分别有写模式锁和读模式锁。并行时可能出现三种冲突：

- 一个实际存储在 disk 中的节点查询操作，与涉及该节点的滚动合并不能并行执行。
- 针对 $C_0$ 的查找、插入操作不能与 $C_0$、$C_1$ 的合并并行执行。
- 小编号 $C_i$ 间的合并频率更高，相邻滚动合并有数据重叠，会发生阻塞。

在滚动合并过程中，$C_i$ 中将要插入的新节点会首先放到一个 multi-page block 缓冲区中，并且按照从左到右的顺序放置。对于 $C_i$ 中指向的节点，会在内存中被分成两个多页面块缓冲区：emptying block 是合并游标尚未到达的区域，filling block 是已经进行合并操作的位置。

## LevelDB 的基本读写路径

LevelDB 是基于 LSM-Tree 的嵌入式 KV 存储。写路径先写 WAL，再写内存中的 MemTable；读路径按 MemTable、Immutable MemTable、L0 到 Ln 的 SSTable 顺序查找，并用 table cache、block cache、index block 和 filter block 降低磁盘访问成本。

### 核心结构

| 结构 | 作用 | 关键点 |
| --- | --- | --- |
| MemTable | 当前写入的内存表。 | 通常用 skiplist，达到阈值后冻结。 |
| Immutable MemTable | 只读内存表。 | 后台 compaction 把它 flush 成 L0 SSTable。 |
| WAL / log | 写前日志。 | Put 先落 WAL，再更新 MemTable，用于崩溃恢复。 |
| SSTable | 有序不可变文件。 | 由 data block、filter block、index block、footer 等组成。 |
| Manifest | 版本编辑日志。 | 持续记录新增 / 删除 SST、compaction 指针、日志编号和 sequence number。 |
| Current | 当前 Manifest 指针。 | 启动时通过 Current 找到需要 replay 的 Manifest。 |
| Version | 某一时刻的 LSM 文件视图。 | 每层 SST 元数据集合，包含文件号、文件大小、key 范围。 |

### 写入流程

1. `DBImpl::Write` 追加 WAL。
2. 写入当前 MemTable。
3. MemTable 达到阈值后被冻结为 Immutable MemTable，新写入切到新 MemTable 和新 WAL。
4. 后台 compaction 把 Immutable MemTable flush 成 L0 SSTable。
5. 当某层大小或文件数量超过阈值时，选出 SST 与下一层重叠 SST 归并，生成下一层新 SST。

### 读取流程

1. 查 MemTable。
2. 查 Immutable MemTable。
3. 查 L0：L0 文件 key 范围可能重叠，通常需要检查多个文件。
4. 查 L1 及更深层：每层 SST key 范围不重叠，可根据文件 key range 二分定位候选文件。
5. 打开候选 SST 后先读 index block 和 filter block。
6. Bloom filter 排除不可能命中的 key；命中候选时再读 data block。
7. 在 data block 内二分或迭代查找目标 internal key。

### 读写放大

- 写放大：同一个 key-value 可能随 compaction 多次从上层写到下层。
- 读放大：一次 Get 可能需要检查多个层级和多个 SST，尤其是 L0 文件重叠时。
- 空间放大：compaction 过程中旧 SST 与新 SST 会短暂共存。
- LevelDB 通过 Bloom filter、block cache、table cache、leveled compaction 和每层不重叠 key range 降低放大。

## LevelDB SSTable 与 Block

LevelDB 的 SSTable 是只读有序文件，核心由 data block、meta block、filter block、index block 和 footer 组成。读 key 时，LevelDB 先用 table cache 找到 SST，再用 index block 定位 data block，并用 filter block 避免不必要的 data block 读取。

```text
SSTable
├── data block ...
├── meta block / filter block
├── metaindex block
├── index block
└── footer
```

| 部分 | 作用 |
| --- | --- |
| data block | 保存有序 key-value entry，内部使用前缀压缩。 |
| filter block | 通常保存 Bloom filter，用于快速判断某个 key 是否不在 block / file 中。 |
| index block | 保存 data block 的分界 key 与 `BlockHandle`。 |
| metaindex block | 指向 filter block 等元数据块。 |
| footer | 保存 metaindex block 和 index block 的 `BlockHandle`。 |

### Data block

Data block 内部利用 shared prefix 压缩相邻 key：

```text
shared_bytes | unshared_bytes | value_length | key_delta | value
```

每隔若干条记录会写一个 restart point。restart point 处不共享前缀，便于在 block 内做二分查找：

1. 先在 restart point 数组上二分，定位可能包含目标 key 的 restart 区间。
2. 从该 restart point 顺序解码 entry。
3. 用前缀恢复完整 key 后比较。

### Index block 与 BlockHandle

`BlockHandle` 保存一个 block 在 SSTable 文件中的位置：

| 字段 | 含义 |
| --- | --- |
| `offset` | block 在文件中的起始偏移。 |
| `size` | block 的字节长度。 |

Index block 的 value 是 data block 的 `BlockHandle`。其 key 通常是某个 data block 的最大 key 与下一个 block 起始 key 之间的 separator，用来减少索引 key 长度。

### Filter block

Filter block 保存按 block range 构建的 Bloom filter。读 key 时：

1. 先根据 data block offset 找到对应 filter。
2. 如果 Bloom filter 判断 key 一定不存在，直接跳过 data block 读取。
3. 如果可能存在，再读取 data block 并做精确查找。

Bloom filter 只会产生假阳性，不会产生假阴性；因此它能减少磁盘 I/O，但不能替代最终查找。

### Cache

LevelDB 主要有两类 cache：

| Cache | 内容 | 作用 |
| --- | --- | --- |
| block cache | 解压后的 data block。 | 热点 key 重复查询时避免重复磁盘读取和解压。 |
| table cache | 已打开的 SSTable reader、文件描述符、index / meta 信息。 | 避免频繁打开 SST 文件，并复用表级元数据。 |

默认 cache 实现是 `ShardedLRUCache`：把 LRUCache 按 hash shard 拆分，降低多线程访问同一个 LRU 链表和哈希表的锁竞争。

### Varint 编码

LevelDB 使用 varint 保存长度、offset、size 等无符号整数。小整数占更少字节：

```text
0xxxxxxx                    # 1 byte
1xxxxxxx 0xxxxxxx           # 2 bytes
1xxxxxxx 1xxxxxxx 0xxxxxxx  # 3 bytes
```

每个字节最高位表示后续是否还有字节，低 7 位保存数据。varint 适合 block 内大量小数字编码，但随机访问时需要从当前位置顺序解码。

## RocksDB 为什么选择 LSM-Tree

RocksDB 的核心设计不是“让所有操作都快”，而是把前台随机写改造成可批量、可顺序化、可后台整理的写入模型。它用 WAL 保障崩溃恢复，用 MemTable 吸收随机更新，用 SST 固化有序数据，用 compaction 延迟处理旧版本、删除标记和层级重叠。

LSM-Tree 适合写多读少、写入吞吐优先、数据规模大于内存的 KV 场景。

| 设计点 | 解决的问题 | 付出的代价 |
| --- | --- | --- |
| WAL 追加写 | 把崩溃恢复从随机页修复变成日志重放。 | 多写一份日志，增加写放大。 |
| MemTable | 把大量随机 key 更新先留在内存有序结构里。 | 需要内存管理、冻结和 flush 调度。 |
| SST 不可变 | 磁盘文件顺序生成，避免原地随机更新。 | 更新和删除会变成多版本堆积。 |
| Compaction | 后台归并多版本、清理 tombstone、维持层级有序。 | 消耗后台 I/O 和 CPU，引入写放大与尾延迟。 |
| Bloom Filter / Block Cache | 降低多层 SST 查找带来的读放大。 | 消耗内存，并需要按 workload 调参。 |

B+Tree 更偏向原地维护页结构，点查稳定、范围扫描自然，但随机写会修改离散页。LSM-Tree 把修改追加到新结构，牺牲读路径简单性和后台整理成本，换取更高写入吞吐。

### 为什么先写 WAL 再写 MemTable

WAL 先于 MemTable 是 Write-Ahead Logging 的一致性约束：只要写请求返回成功，崩溃后就必须能恢复该写入。MemTable 在内存里，进程崩溃后会丢失；WAL 是持久化重放依据。

```text
正确顺序：WAL durable -> MemTable visible -> ack
错误顺序：MemTable visible -> ack -> WAL later
```

如果先写 MemTable 并返回成功，WAL 尚未持久化时崩溃会导致已确认写入丢失。RocksDB 可以通过 group commit、pipelined write、异步 WAL、`sync=false` 等配置改变延迟和持久化强度，但不改变“需要 WAL 作为恢复来源”的基本设计。

### 为什么 L0 可以重叠

L0 SST 来自 MemTable flush。每个 MemTable 都覆盖一段时间内的写入，而不是一个互不重叠的 key range。直接 flush 成 L0 SST 可以让前台写入尽快释放内存，不必在 flush 阶段等待全局重分区。

代价是 L0 同层文件 key range 可能重叠，读某个 key 时可能要检查多个 L0 文件。L0 是写路径和读路径之间的缓冲层：它降低 flush 成本，但把整理成本推给后续 compaction。

### 为什么 L1 及以下要求尽量不重叠

L1+ 同层 SST key range 不重叠后，每层最多定位一个候选 SST，点查路径从“查很多文件”变成“每层查一个文件”。

```text
L0：同层可能重叠 -> 一个 key 可能查多个文件
L1+：同层不重叠 -> 一个 key 每层通常查一个文件
```

这个设计把读放大控制在“L0 若干文件 + 每层一个文件”的级别。代价是 compaction 需要把上层文件与下层重叠文件一起归并，产生额外读写 I/O。

### 为什么删除用 tombstone

SST 是不可变文件，不能原地删除旧 value。删除操作写入 tombstone，表示“从这个 sequence number 开始该 key 不存在”。读路径遇到最新 tombstone 后返回 NotFound；compaction 确认 tombstone 覆盖范围内没有更老版本需要保留时，才物理丢弃旧 value 和 tombstone。

Tombstone 的好处是删除也能走追加写路径；坏处是删除密集或覆盖范围大时会污染读路径和空间，直到 compaction 才能回收。

### 为什么 compaction 是核心矛盾

RocksDB 的性能问题经常不是单次 `Put` 或 `Get` 的代码复杂，而是 compaction 的节奏是否匹配 workload。

| 问题 | Compaction 相关原因 | 典型影响 |
| --- | --- | --- |
| 读放大高 | L0 文件堆积、层数多、Bloom Filter 配置不足。 | 点查延迟上升。 |
| 写放大高 | 数据被多层反复归并，大 value 随 key 一起重写。 | SSD 写入量和后台 I/O 增大。 |
| 空间放大高 | 旧版本、tombstone、新旧 SST 共存时间长。 | 磁盘空间占用膨胀。 |
| 尾延迟抖动 | 后台 compaction 与前台读写争抢 CPU/I/O。 | p99/p999 延迟变差。 |

回答 RocksDB 调优问题时，应先判断瓶颈属于读放大、写放大、空间放大还是尾延迟，再落到 L0、层级大小、Bloom Filter、Block Cache、compaction 并发和限速。

### log-on-log issue

`log-on-log issue` 指多个系统层级都用日志追加式写入，导致每层各自看似顺序写，端到端却出现叠加写放大和后台整理。例如应用写 WAL，存储引擎写 WAL / LSM，文件系统或 SSD FTL 又用日志式映射；每层都会触发 flush、compaction、GC 或空间回收。

典型影响：

- 同一份逻辑数据在多层日志中重复写入，放大 SSD 写入量。
- Compaction、GC、刷盘等后台任务叠加，挤占前台 I/O。
- p99 / p999 尾延迟变差，单看某一层指标却可能仍像正常顺序写。
- 问题定位困难，需要跨应用、存储引擎、文件系统和设备层联合观测。

缓解方向不是简单关闭某一层日志，而是明确哪一层负责持久化和空间回收，避免重复 durable 路径；让上层感知下层写入特性；并对 compaction / GC / flush 做节奏控制和 I/O 限速。

## RocksDB 写路径工程点

RocksDB 的工程实现围绕三个目标展开：前台写入尽量短、读路径尽量少碰磁盘、后台 compaction 尽量不把前台延迟拖垮。工程 trick 通常不是改变 LSM-Tree 模型，而是在 WAL、MemTable、SST、缓存和后台线程之间移动成本。

```text
WriteBatch
  -> 写线程排队 / group commit
  -> WAL append
  -> MemTable insert
  -> flush / compaction schedule
```

### WriteBatch 与 group commit

多个小写请求可以合并为一个批次，减少 WAL 写系统调用和同步落盘次数。Leader 线程收集一组 follower 写请求后，统一写 WAL，再把 batch apply 到 MemTable。

收益：

- 降低小写请求的系统调用开销。
- 把多个 `fsync` 合并成一次，降低持久化延迟。
- 提高顺序追加吞吐。

代价：

- Leader 可能成为并发写瓶颈。
- 等待组批会增加单个请求排队时间。
- sync 写和非 sync 写混合时需要谨慎维护确认语义。

### Pipelined write

写路径可以拆成 WAL 阶段和 MemTable 阶段，让一批写在写 MemTable 时，下一批写先进入 WAL 阶段。这样提高流水线并行度，减少单个全局写锁覆盖的范围。

```text
Batch A: WAL done -> MemTable insert
Batch B: WAL append
Batch C: wait queue
```

该设计适合 WAL 与 MemTable 写入都不完全成为绝对瓶颈的场景；如果底层 WAL 同步极慢，流水线仍会被持久化阶段限制。

### WAL sync 策略

`sync=true` 更接近“返回成功即日志落盘”，延迟更高但崩溃语义更强。`sync=false` 通常只保证写入 OS page cache，吞吐更高，但机器断电可能丢失最近已确认写入。

应区分：

- 进程崩溃：OS page cache 仍在，WAL 可能可恢复。
- 机器断电：未 flush 到设备的 WAL 可能丢失。
- 业务确认语义：是否允许丢最近几毫秒写入决定 sync 策略。

## RocksDB 读路径调优点

```text
Get
  -> MemTable / Immutable MemTable
  -> Version metadata
  -> L0 files newest to oldest
  -> L1+ candidate SST
  -> Filter / Index / Data block
  -> Block Cache
```

### Bloom Filter

Bloom Filter 适合点查和大量 miss 场景。它不能证明 key 一定存在，只能证明 key 一定不存在或可能存在。

适合加大 Bloom Filter 投入的场景：

- 大量不存在 key 的点查。
- LSM 层数多，miss 会穿透多层。
- Block Cache 命中率不足，磁盘随机读昂贵。

不明显受益的场景：

- 大范围顺序扫描。
- 几乎全部命中的热 key，且数据已经在 Block Cache 中。
- CPU 比 I/O 更紧张，filter 计算成为额外负担。

### Block Cache

Block Cache 缓存 data block、index/filter 元数据等读路径热点。`Put` 通常不直接污染 Block Cache；数据先写 MemTable，flush 后成为 SST，后续读 miss 才加载相关 block。

调优判断：

- 点查热点明显：增大 Block Cache 通常有效。
- 大扫描污染缓存：需要考虑 scan 不填充缓存或使用独立策略。
- index/filter 频繁读取：可考虑优先缓存元数据，避免每次打开 SST 后重复读索引。

### L0 文件数

L0 文件数是 RocksDB 读写状态的关键健康指标。L0 文件越多，读路径越可能检查多个重叠 SST；后台 compaction 跟不上时，还会触发写限速或写停顿。

常见信号：

- L0 文件持续增长：flush 速度大于 L0->L1 compaction 能力。
- 写入 p99 抖动：后台 compaction 与前台争抢 I/O，或写限速开始介入。
- 读 miss 变慢：L0 重叠文件过多，Bloom Filter 和元数据检查次数增加。

## Compaction 工程点

Compaction 是 RocksDB 的后台主战场。它把上层文件和下层重叠文件归并，生成新 SST 并删除旧 SST。

### Leveled compaction

Leveled compaction 让 L1+ 同层 SST key range 尽量不重叠，适合点查和读放大敏感场景。

优点：

- 每层候选文件数少。
- 读路径更可控。
- 空间放大相对可控。

缺点：

- 写放大较高。
- 热 key 或大 value 会被多层反复重写。
- 后台 I/O 压力大时影响尾延迟。

### Universal / size-tiered 思路

Size-tiered / universal 更倾向把大小相近的文件批量合并，减少单条数据被反复下推的次数，适合写放大敏感或写入吞吐优先场景。

代价是同层或同阶段可能保留更多重叠文件，点查读放大和空间放大可能上升。

## 大 value 与 KV 分离

LSM compaction 会反复重写 value。value 越大，写放大越严重。大 value 场景常见优化是 KV 分离：LSM 只保存 key 到 value 位置的索引，大 value 放到独立 value log 或 blob 文件。

收益：

- compaction 主要重写小索引，减少大 value 反复搬迁。
- 降低写放大和 compaction I/O。

代价：

- 读 value 需要额外一次间接读取。
- value log / blob 文件需要独立 GC。
- 崩溃恢复和空间回收逻辑更复杂。

## ZNS / ZenFS / WAL 并发优化

ZNS SSD 要求 Zone 内顺序写，不能覆盖写。RocksDB 通过 ZenFS 等 FileSystem 插件适配 ZNS，把 SST、WAL 等文件映射到 Zone 管理模型。

高并发 WAL 写入的典型瓶颈是单 Leader 或单 append 路径串行化。面向 ZNS 的并发 WAL 方案可以利用 Zone Append 的原子性，让多个线程并发提交 append，由设备返回实际写入位置；记录内部携带 LSN 和 checksum，恢复时按 LSN 顺序重放。

关键点：

- CAS 推进活跃 Zone 的逻辑分配偏移或 pending 队列指针。
- 每条 record 携带 LSN、length、checksum。
- 物理落盘顺序可以和逻辑 LSN 顺序不同。
- 恢复时扫描 WAL zone，过滤部分写和 checksum 错误记录，再按连续 LSN 重放。

该类优化解决的是 WAL 并发追加瓶颈，不改变 RocksDB 上层“WAL 先于 MemTable 可恢复”的语义。

## 排查 checklist

| 现象 | 优先检查 |
| --- | --- |
| 写入吞吐低 | WAL sync、group commit、写线程排队、MemTable flush 速度。 |
| 写入 p99 抖动 | compaction 是否抢占 I/O、L0 文件数、写限速/写停顿。 |
| 点查 miss 慢 | Bloom Filter、L0 文件数、层数、index/filter 是否缓存。 |
| 热点读慢 | Block Cache 容量、cache shard、data block size、压缩开销。 |
| 磁盘空间涨 | tombstone 堆积、旧版本未清理、compaction backlog。 |
| SSD 写入量大 | leveled compaction 写放大、大 value 反复重写、flush 太频繁。 |

## 参考

- [The Log-Structured Merge-Tree (LSM-Tree)](https://www.cs.umb.edu/~poneil/lsmtree.pdf)
- [LevelDB GitHub](https://github.com/google/leveldb)
- [LevelDB table format](https://github.com/google/leveldb/blob/main/doc/table_format.md)
- [LevelDB Handbook](https://leveldb-handbook.readthedocs.io/)
- [facebook/rocksdb](https://github.com/facebook/rocksdb)
