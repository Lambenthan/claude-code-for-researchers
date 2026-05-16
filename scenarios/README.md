# scenarios · 看见 Claude Code 怎么干活

12 个 Claude Code harness 机制（agent loop、子会话、skill 加载、上下文压缩、任务系统、后台任务、并行 agent、worktree 隔离等），每个都用一段实证场景做入口，让你不用读 Python 就能感受到机制怎么工作。

读完一节，如果还想再深一层，每节末尾会指给你 `agents/` 里对应的那段 Python 最小复刻版，30 行到 200 行不等，看完上面的场景再读它，每一行的位置都能对得上。

## 怎么用这个目录

每一节是一个独立文件夹，含两份内容：

- `scenario.md` — 给你看的主内容，含真实运行节点的工具调用轮次、关键 output 摘要、决策点串联
- `replay.jsonl` — 机器可解析的对话回放，每行一个 step（含 role / tool / args / result / agent / 时间戳），用来在 web 端做可暂停的动画演示

直接阅读 `scenario.md` 就够了。`replay.jsonl` 跟 scenario.md 节点表完全一致，进入 [/zh/scenarios/<slug>](https://lambenthan.github.io/claude-code-for-researchers/zh/scenarios) 页面后顶部的 Replay 卡片会逐步播放它。

## 当前进度

本指南全部场景以一个完整跑通的实证项目"耐心资本对企业 ESG 表现的影响"作为贯穿案例，每个机制都嵌入了 2026-05-10 那次 do0–do10 实际跑出来的工具调用序列与关键数字（PC（A2 主） β=0.0004 不显著、PC（A1） β=0.0018***、IV1 β=0.0052**、PSM ATE 0.0032***、Placebo p_perm=0.000、表 10A 七套 PC 测度系数等），不是教学示意。

| 编号 | 机制 | 真实运行节点 | 文件 |
|:---|:---|:---|:---|
| 01 | Agent loop | 按 CLAUDE.md 第二节 14 词保护清单审计 docs/ 与 06_结果输出/tables_tsv/——9 轮循环 | [scenario](01-cross-chapter-term-unification/scenario.md) · [replay](01-cross-chapter-term-unification/replay.jsonl) |
| 02 | Tool dispatch | 02 字典 ↔ do4 构造代码 ↔ do6/do10 引用三方核对——Read / stata-mcp / Grep / Write 6 轮 | [scenario](02-claude-picks-tools/scenario.md) · [replay](02-claude-picks-tools/replay.jsonl) |
| 03 | TodoWrite | phase 1 do0_setup → do6_baseline 七脚本顺序推进，主面板 76305 → 26441 obs | [scenario](03-advisor-revisions-todo/scenario.md) · [replay](03-advisor-revisions-todo/replay.jsonl) |
| 05 | Skill loading | paper-backup-before-word 在 phase 2 合表入 docx 前命中加载，落 28.9KB 含 12 张原生三线表 | [scenario](05-skill-auto-backup/scenario.md) · [replay](05-skill-auto-backup/replay.jsonl) |
| 06 | Context compact | phase 1 三小时会话 17 万字压缩为 600 字摘要保留主口径决策与五张表系数 | [scenario](06-context-compact-third-chapter/scenario.md) · [replay](06-context-compact-third-chapter/replay.jsonl) |
| 07 | Task system | phase 2 任务图：do7 → do8/do9/do10 依赖关系，blocked_by 与 next_actionable() 演化 | [scenario](07-task-system-persistent-revisions/scenario.md) · [replay](07-task-system-persistent-revisions/replay.jsonl) |
| 08 | Background tasks | Placebo 500 次置换后台跑 7 分钟，主对话同时整理 do9 异质性 8 列汇总 | [scenario](08-background-latex-compile/scenario.md) · [replay](08-background-latex-compile/replay.jsonl) |
| 09 | Agent teams | 方法学 / 计量 / 写作 / 新意四审稿人针对 OLS 与 IV 系数差 10 倍的事实 7 条消息交叉评审 | [scenario](09-peer-review-rehearsal/scenario.md) · [replay](09-peer-review-rehearsal/replay.jsonl) |
| 10 | Subagent | 表 10A 七种 PC 测度并行：A2 主 / A1 / B2 / C / 仅股权 / 仅 Bank / 仅 Rdebt | [scenario](10-parallel-citation-audit/scenario.md) · [replay](10-parallel-citation-audit/replay.jsonl) |
| 11 | Autonomous agents | 夜间两个稳健性 runner 自治认领 18 条任务（表 10A 7 + 10B 6 + 10C 5），50 分钟跑完 | [scenario](11-autonomous-night-claim/scenario.md) · [replay](11-autonomous-night-claim/replay.jsonl) |
| 12 | Worktree isolation | pc-esg 主测度 0-1 / pc-esg-discrete 评级 1-9 / pc-esg-subscores E/S/G 三个 worktree 并行 | [scenario](12-worktree-multi-submission/scenario.md) · [replay](12-worktree-multi-submission/replay.jsonl) |

11 个场景全部完成。每节按"机制原理 → 一次真实运行的轮次串联 → 设计原因 → 容易踩的坑 → 知识地图"展开，约 100 到 180 行 markdown 配一份 15-24 行的 JSONL 回放，文字与回放节点一一对应。web 端 ReplayPlayer 支持播放 / 暂停 / 单步 / 0.5×–4× 速度调节。

读这些场景不用读 Python。但每节末尾会指向 `agents/` 里对应的最小复刻代码，30 到 800 行不等，看完场景再去读代码，每一行都能对得上。

## 写作纪律

每一节的文字按 `~/.claude/skills/book-writing-default/SKILL.md` 的红线与积极规则写。

新术语首次出现写"X，简称 Y"或"X，也就是 Y"，自然融入散文，不用全角括号注释。每段最多 1 个破折号。禁用"押注 / 保险绳 / 工具箱 / 地图 / 账本"这类隐喻动词。禁用"值得注意的是 / 综上所述 / 用一句话说"这类 AI 套话。章节标题走严谨陈述，不用"三句话讲完 X""一文读懂 Y"这类口语量词标题。每节末尾配一张知识地图四列表：核心概念 / 在这场景里做了什么 / 常见误解 / 为什么错。
