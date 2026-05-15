# scenarios · 看见 Claude Code 怎么干活

12 个 Claude Code harness 机制（agent loop、子会话、skill 加载、上下文压缩、任务系统、后台任务、并行 agent、worktree 隔离等），每个都用一段实证场景做入口，让你不用读 Python 就能感受到机制怎么工作。

读完一节，如果还想再深一层，每节末尾会指给你 `agents/` 里对应的那段 Python 最小复刻版，30 行到 200 行不等，看完上面的场景再读它，每一行的位置都能对得上。

## 怎么用这个目录

每一节是一个独立文件夹，里面至少有一份 `scenario.md`。这一份是给你看的主内容。如果配了 `replay.jsonl`，那是 Claude Code 跑这个任务时的对话回放，将来 web/ 平台会把它做成可暂停的动画演示。

直接阅读 `scenario.md` 就够了。

## 当前进度

本指南全部场景以一个完整跑通的实证项目"耐心资本对企业 ESG 表现的影响"作为贯穿案例，11 个机制每个对应该项目里的一个具体节点：

| 编号 | 机制 | 场景 | 文件 |
|:---|:---|:---|:---|
| 01 | Agent loop | 按 CLAUDE.md 保护清单审计论文术语 | [scenario](01-cross-chapter-term-unification/scenario.md) · [replay](01-cross-chapter-term-unification/replay.jsonl) |
| 02 | Tool dispatch | 变量字典与 Stata 字段一致性核对 | [scenario](02-claude-picks-tools/scenario.md) · [replay](02-claude-picks-tools/replay.jsonl) |
| 03 | TodoWrite | do0–do6 七个脚本按依赖顺序推进 | [scenario](03-advisor-revisions-todo/scenario.md) · [replay](03-advisor-revisions-todo/replay.jsonl) |
| 05 | Skill loading | paper-protect-terminology 跨文件加载 | [scenario](05-skill-auto-backup/scenario.md) · [replay](05-skill-auto-backup/replay.jsonl) |
| 06 | Context compact | phase 1 长会话压缩，保留 PC_A2 主测度等关键决定 | [scenario](06-context-compact-third-chapter/scenario.md) · [replay](06-context-compact-third-chapter/replay.jsonl) |
| 07 | Task system | phase 2 任务图跨会话保留 | [scenario](07-task-system-persistent-revisions/scenario.md) · [replay](07-task-system-persistent-revisions/replay.jsonl) |
| 08 | Background tasks | Placebo 500 次置换 + Bootstrap 中介后台跑 | [scenario](08-background-latex-compile/scenario.md) · [replay](08-background-latex-compile/replay.jsonl) |
| 09 | Agent teams | 4 人评审小组讨论 main.tex v2 | [scenario](09-peer-review-rehearsal/scenario.md) · [replay](09-peer-review-rehearsal/replay.jsonl) |
| 10 | Subagent | 8 种 PC 测度并行回归 | [scenario](10-parallel-citation-audit/scenario.md) · [replay](10-parallel-citation-audit/replay.jsonl) |
| 11 | Autonomous agents | 夜间自治跑稳健性矩阵 13 组 | [scenario](11-autonomous-night-claim/scenario.md) · [replay](11-autonomous-night-claim/replay.jsonl) |
| 12 | Worktree isolation | 主测度版 / 离散评级版 / 三分项版 三个 worktree | [scenario](12-worktree-multi-submission/scenario.md) · [replay](12-worktree-multi-submission/replay.jsonl) |

11 个场景全部完成。每节按"起因 → 屏幕上看见的过程 → 内部状态 → 设计原因 → 自己试一次 → 知识地图"六节展开，约 100 到 150 行 markdown，配一份 10 到 25 行的 JSONL 对话回放。

读这些场景不用读 Python。但每节末尾会指向 `agents/` 里对应的最小复刻代码，30 到 800 行不等，看完场景再去读代码，每一行都能对得上。

## 写作纪律

每一节的文字按 `~/.claude/skills/book-writing-default/SKILL.md` 的红线与积极规则写。

新术语首次出现写"X，简称 Y"或"X，也就是 Y"，自然融入散文，不用全角括号注释。每段最多 1 个破折号。禁用"押注 / 保险绳 / 工具箱 / 地图 / 账本"这类隐喻动词。禁用"值得注意的是 / 综上所述 / 用一句话说"这类 AI 套话。章节标题走严谨陈述，不用"三句话讲完 X""一文读懂 Y"这类口语量词标题。每节末尾配一张知识地图四列表：核心概念 / 在这场景里做了什么 / 常见误解 / 为什么错。
