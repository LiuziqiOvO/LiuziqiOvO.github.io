# MD 仓库文章筛选记录

来源仓库：`/Users/bytedance/Proj/md`

目标：从现有 Markdown 中筛选适合博客发布的高价值材料。这里不生成新观点文章，只做评分、主题归并、拼接建议和敏感性判断。发布前仍需人工审核。

## 评分标准

| 维度 | 权重 | 说明 |
| --- | ---: | --- |
| 内容密度 | 30 | 是否有足够技术细节，而不是列表化空话。 |
| 结构完整度 | 20 | 是否有清晰标题、表格、流程、取舍、checklist。 |
| 可发布性 | 25 | 是否主要是公开技术知识，是否避开公司、项目和个人隐私。 |
| 博客适配度 | 15 | 是否能独立成文，是否适合当前技术博客定位。 |
| 改动成本 | 10 | 是否只需拼接、删内部引用、转普通链接，不需要重写关键内容。 |

## 候选评分

| 主题 | 候选文件 | 分数 | 判断 |
| --- | --- | ---: | --- |
| LSM-Tree / LevelDB / RocksDB | `WIKI/Storage/LSM-Tree/LSM-Tree.md`; `WIKI/Storage/LSM-Tree/LevelDB.md`; `WIKI/Storage/LSM-Tree/LevelDB Table 与 Block.md`; `WIKI/Storage/LSM-Tree/RocksDB 设计取舍.md`; `WIKI/Storage/LSM-Tree/RocksDB 工程实现与调优.md` | 90 | 内容密度高，公开技术主题，能拼成一篇从模型到工程调优的文章。需删除面试/找工内链和少量 Obsidian 内链。 |
| Redis / Memcached / Valkey | `WIKI/Storage/Redis 常用数据结构与接口.md`; `WIKI/Storage/Memcached.md`; `WIKI/Storage/Valkey.md` | 82 | 适合整理成缓存系统对比或 KV 系统速查。公开性高，但 Redis 文件偏命令手册，博客化需要更强主题选择。 |
| Linux OS 基础 | `WIKI/OS/linux-IO.md`; `WIKI/OS/linux-文件、磁盘、分区.md`; `WIKI/OS/linux-内存.md`; `WIKI/OS/linux-网络工具.md` | 78 | 公共技术内容多，适合拆成系列。部分文件较长，容易变成手册，需要再挑主线。 |
| Agent / AI 工具 | `WIKI/Agent相关/Claude Code-study/*`; `WIKI/Agent相关/git worktree 与多 Agent 协作.md`; `WIKI/Agent相关/MCP.md` | 70 | 和当前博客方向匹配，但需要避开字节 recoCli 子目录；公开项目分析可保留，内部项目相关不可发布。 |
| 推荐系统相关 | `WIKI/推荐系统相关/*`; `推荐系统大架构综述（飞书）.md` | 35 | 技术价值可能高，但含抖音、飞书、推荐业务上下文，发布风险高，本轮不选。 |
| AICache / Flink / SPDK OCF 项目材料 | `4_Proj-AICache/*` | 30 | 与具体项目强相关，容易泄露项目细节。本轮不选，除非后续人工指定并逐段脱敏。 |
| 找工 / 简历 / 公司调研 | `3_找工/*` | 10 | 个人隐私、面试和公司信息较多，不适合直接博客化。 |
| 字节 recoCli | `WIKI/Agent相关/字节recoCli/*` | 0 | 明确与字节项目强相关，不选，不发布。 |

## 本轮选题

选题：`LSM-Tree 到 RocksDB：写路径、读放大与 Compaction 的工程取舍`

采用来源：

- `/Users/bytedance/Proj/md/WIKI/Storage/LSM-Tree/LSM-Tree.md`
- `/Users/bytedance/Proj/md/WIKI/Storage/LSM-Tree/LevelDB.md`
- `/Users/bytedance/Proj/md/WIKI/Storage/LSM-Tree/LevelDB Table 与 Block.md`
- `/Users/bytedance/Proj/md/WIKI/Storage/LSM-Tree/RocksDB 设计取舍.md`
- `/Users/bytedance/Proj/md/WIKI/Storage/LSM-Tree/RocksDB 工程实现与调优.md`

处理原则：

- 保留原文关键技术内容和判断，不重新发明观点。
- 删除或改写不适合发布的 Obsidian 内链、找工/面试引用、仓库内部路径。
- 不引用公司内部项目、字节、华为、抖音、飞书、AICache/Flink 等材料。
- 输出到 `review/sanitized/`，不进入 `source/_posts/`。
