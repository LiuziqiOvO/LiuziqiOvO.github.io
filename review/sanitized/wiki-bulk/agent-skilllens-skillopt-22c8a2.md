---
title: SkillLens 与 SkillOpt
date: 2026-08-17 05:00:00
categories:
  - Agent
tags:
  - Agent
  - SkillLens 与 SkillOpt
  - agent-skills
  - agent-evaluation
  - paper
  - project-research
  - project-agent-tool
description: 1:1 发布自知识库：Agent相关/SkillLens 与 SkillOpt.md
source_note: Agent相关/SkillLens 与 SkillOpt.md
---
# SkillLens 与 SkillOpt

> [!summary]
> SkillLens 回答“model-generated skill 到底什么时候有用、什么时候会负迁移”；SkillOpt 回答“如何把自然语言 skill 文档当作 frozen agent 的外部可训练状态，用 rollout、反思、受限编辑和 validation gate 稳定优化”。

## 核心结论

- Agent skill 不能只当成一段静态 prompt；更准确地看，它是从经验生成、skill 提取、skill 消费到部署验证的一条生命周期链路。
- 自动生成 skill 平均有效，但不是无风险。SkillLens 的大规模实验显示，skill 在 75% 的 extractor-target 组合中提升表现，但 25% 出现 negative transfer；ALFWorld 等领域尤其脆弱。
- “谁会提取 skill”和“谁会消费 skill”是两种不同能力。强模型不必然是强 extractor，强 executor 也不必然能从 skill 中获益。
- 靠 LLM-as-judge 或人工肉眼读 skill 文本，不足以可靠判断一个 skill 是否会提升下游任务；真正需要的是目标模型、目标任务和 held-out 验证集上的行为评测。
- SkillOpt 的关键范式是：冻结目标模型，把自然语言 skill 文档作为唯一可训练状态；每轮根据带分数的 rollout 生成 add/delete/replace 编辑，只有验证集分数严格提升才接受。
- 对工程系统而言，skill 上线前应有黑名单、验证门禁和回滚机制；不要因为 skill 文本“看起来专业”就直接注入生产 agent。

## SkillLens：skill 生命周期拆解

SkillLens 把 model-generated domain-level skill 拆成三段：

1. 经验生成：目标 agent 在训练任务上执行，留下成功和失败轨迹。
2. 技能提取：extractor model 从轨迹池中蒸馏可复用的 domain-level skill 文档。
3. 技能消费：目标 agent 加载该 skill，在 held-out 任务上评估表现变化。

这个拆法的价值是把“skill 好不好”从单点文本质量问题，改成可实验验证的 pipeline 问题。一个 skill 是否有用，取决于经验池、提取器、目标模型、任务域、注入方式和验证集分布的共同作用。

## 指标：Delta、EE、TE

- `Delta`：加载 skill 后相对 no-skill baseline 的性能增益。`Delta > 0` 代表 skill 有帮助，`Delta < 0` 代表负迁移。
- `Extraction Efficacy, EE`：固定 extractor，看它给多个 target 生成的 skill 平均能带来多少提升。它衡量“老师会不会教”。
- `Target Evolvability, TE`：固定 target，看它从不同 extractor 生成的 skill 中平均能学到多少。它衡量“学生会不会用 skill 学”。

这两个指标避免把 skill 失败简单归因于“模型不够强”。实践中应同时记录 extractor、consumer、任务域和验证集，而不是只保存 `SKILL.md`。

## 为什么会负迁移

常见失败机制可以归为几类：

- 过度泛化：从少量轨迹总结出看似通用、实际只适用于训练分布的规则。
- 错误优先级：skill 把次要启发式写成强约束，覆盖模型原本可行的默认策略。
- 上下文污染：skill 增加了与当前任务无关的步骤、术语或输出格式，挤占注意力并诱导错误工具调用。
- 消费者不匹配：某个 target 不能稳定遵循 extractor 写出的抽象规则，或把规则解释成不同操作。
- 领域脆弱性：具身规划、多步工具调用等任务里，局部错误会沿执行链放大。

## 补救动作

- 对每个 skill 建立 no-skill / skill A/B 评测，不只看静态文档质量。
- 把 skill 绑定到目标模型、目标 harness、任务域和验证集，不要默认跨模型可迁移。
- 保存失败轨迹，让 extractor 或 optimizer 能明确看到 skill 导致的错误。
- 把强制性规则改成条件触发规则，减少“无脑套流程”。
- 对高风险动作使用 allowlist / denylist，并要求在执行前检查任务上下文。
- 对新 skill 设置 canary、回滚和版本号；验证失败时退回上一个 best skill。

## 高风险动作黑名单

这些内容不适合直接写成无条件 skill 规则：

- 无条件删除、覆盖、迁移、重命名用户文件。
- 自动执行 destructive shell 命令，例如 `rm -rf`、`git reset --hard`、强制 push。
- 未验证来源时安装依赖、执行远程脚本或加载未知插件。
- 在没有目标路径和回滚方案时批量格式化、批量替换或批量重构。
- 忽略现有 dirty worktree，擅自回滚用户改动。
- 把 LLM judge 的通过结果当作唯一上线依据。

## SkillOpt：把 skill 文档当作可训练状态

SkillOpt 的设定更接近优化算法：

- 目标模型 frozen，不改权重。
- 当前 skill 文档是 trainable state。
- 目标 agent 带着当前 skill 跑训练 batch，记录消息、工具调用、verifier feedback、任务 metadata 和最终分数。
- optimizer model 分别分析成功和失败 minibatch，提炼可复用经验。
- optimizer 生成受预算约束的 `add`、`delete`、`replace` 编辑。
- 候选 skill 只在 held-out validation 分数严格提升时被接受。
- 最终导出 `best_skill.md`，部署时不增加额外模型调用。

这个循环把 skill 从“人写一份文档然后祈祷泛化”变成“可复现、可回滚、可验证的文本空间训练”。

## SkillOpt 组件含义

- Rollout evidence：类似 forward pass，提供当前 skill 在真实执行中的成功/失败证据。
- Reflection：类似 language-level backward pass，从轨迹中定位可迁移策略和重复错误。
- Textual learning rate：用编辑预算限制每轮文本移动幅度，避免大改导致已有有效规则被覆盖。
- Rejected-edit buffer：记录被验证集拒绝的修改，减少重复犯错。
- Slow / meta update：在更长周期上总结 optimizer 自身经验，稳定后续编辑策略。
- Validation gate：只有 held-out 分数变好才接受候选 skill，是防止 overfit 和负迁移的关键。

## 对本地 skills 的启发

当前 [[Skills-study]] 中的 skill 设计偏“结构与加载语义”。结合 SkillLens / SkillOpt，应补上评测和训练视角：

- 每个重要 skill 应保存适用任务、目标工具、目标模型、负例和回滚版本。
- `description` 决定触发，但触发不等于安全；高风险 skill 需要额外门禁。
- 支持文件、脚本和资产不是越多越好，必须通过目标任务验证是否真的提升成功率。
- skill 修改应小步迭代，优先 add/delete/replace 可审查 diff，而不是整篇重写。
- 可以把常用工作流的 `SKILL.md` 当作外部可训练状态：收集失败案例，周期性用验证集优化。

## 参考

- [SkillLens 项目页](https://microsoft.github.io/SkillLens/)
- [SkillLens arXiv:2605.23899](https://arxiv.org/abs/2605.23899)
- [SkillLens 代码仓库](https://github.com/microsoft/SkillLens)
- [SkillOpt 项目页](https://microsoft.github.io/SkillOpt/)
- [SkillOpt arXiv:2605.23904](https://arxiv.org/abs/2605.23904)
- [SkillOpt 代码仓库](https://github.com/microsoft/SkillOpt)
- [[RAW/index]]
