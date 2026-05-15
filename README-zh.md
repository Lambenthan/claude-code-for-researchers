[English](./README.md) | [中文](./README-zh.md)

# Learn Claude Code

写给做实证研究的研究生与青年学者的 Claude Code 指南。本指南所有示例统一围绕一个完整跑通的实证项目——**"耐心资本对企业 ESG 表现的影响"**——展开。11 个核心机制（agent 主循环、工具调度、待办清单、子会话、Skill 加载、上下文压缩、任务图、后台任务、多 agent 协作、团队治理协议、自治认领、工作树隔离）每个对应该项目里的一个具体节点：保护清单审计、do0–do10 顺序推进、8 种 PC 测度并行回归、phase 1 → phase 2 跨周任务图、Placebo 500 次置换后台跑、4 人评审小组讨论、稳健性矩阵 13 组夜间自治等。

每个机制都用大白话讲清楚——读 PDF、审计引用、跟进数据合并、用数据重绘图表、跑 Stata 与编 LaTeX 都是日常动作。Python 实现给愿意往下读一层的人备着，是可选的延伸阅读，不是入口。

本项目里 Claude Code 不为你写正文、不替你润色，全部场景都把它定位为自动化、审计和项目管理工具，论文的文字与结论由你自己决定。

---

## Agency 来自模型，Agent 产品 = 模型 + Harness

Agency 这件事——感知、推理、行动的能力——来自模型训练。外面这层代码不能赋予它，只能给它一个能干活的环境：可调用的工具、可拉取的知识、可读取的观察、可执行的动作、必须服从的权限。这一整套环境叫 harness。

一个能用的 agent 产品两件都要。模型是驾驶者，harness 是载具。这个仓库教你怎么读懂载具。

### Harness 里有什么

```
Harness = 工具 + 知识 + 观察 + 动作接口 + 权限

    工具:      文件读写、Shell、网络、数据库、浏览器
    知识:      产品文档、领域资料、风格指南
    观察:      git diff、错误日志、浏览器状态、传感器数据
    动作:      命令行、API 调用、UI 交互
    权限:      沙箱、审批流程、信任边界
```

模型做决策，harness 负责执行。harness 因领域而异：编程 agent 的 harness 是 IDE 和文件系统；农业 agent 的是传感器和灌溉系统；论文写作 agent 的是你的稿件、BibTeX、引用数据库、画图工具。模型本身跨领域通用。

### 为什么值得拆解 Claude Code

Claude Code 是目前能见到的最完整的 agent harness 之一。它不试图自己当 agent，不强加流程，也不用决策树替模型做判断。它只提供工具、知识、上下文管理、权限边界，然后让开。

把它剥到本质：

```
Claude Code = 一个 agent 主循环
            + 工具 (bash、read、write、edit、glob、grep、browser ...)
            + 按需加载的 skill
            + 上下文压缩
            + 子会话派单
            + 含依赖图的任务系统
            + 异步邮箱协作的队友
            + 工作树隔离的并行执行
            + 权限治理
```

这就是全部架构。agent 本身是 Claude——一个训练好的模型。Harness 给 Claude 装上手、眼睛、工作台。这个仓库把每个 harness 机制拆开，让你看清楚它在你论文项目里怎么工作。

---

## 通用 harness 模式

编程 agent 是一种应用。任何需要多步骤、需要判断力的工作领域都可以做 agent，前提是配上合适的 harness。

```
论文写作 agent      = 模型 + chapters/ + BibTeX + 画图工具
庄园管理 agent      = 模型 + 物业传感器 + 维护工具 + 租户沟通
农业 agent          = 模型 + 土壤数据 + 灌溉控制 + 作物知识
酒店运营 agent      = 模型 + 预订系统 + 客户渠道 + 设施 API
医学研究 agent      = 模型 + 文献检索 + 实验仪器 + 协议文档
制造业 agent        = 模型 + 产线传感器 + 质量控制 + 物流系统
```

主循环不变，工具变，知识变。模型本身跨领域通用。

---

## Agent 模式图

```
                AGENT 模式

用户 --> messages[] --> 模型 --> 响应
                                |
                      stop_reason == "tool_use" ？
                     /                          \
                    是                           否
                    |                            |
              执行工具                       返回文本
              结果回流
              下一轮 -----------------> messages[]


这是最小循环。每个 AI agent 都需要它。
模型决定何时调用工具、何时停下。
代码只是执行模型的请求。
本仓库教这个循环之外的 harness 机制。
```

12 个递进的课程。每个在循环上加一个机制。每个机制配一句格言。

| 课程 | 格言 |
|:--|:--|
| **s01** | 一个循环加一个工具就是 agent |
| **s02** | 加新工具就是加一个 handler |
| **s03** | 没有计划的 agent 会走散 |
| **s04** | 大任务拆小，每个小任务有干净的上下文 |
| **s05** | 用到什么知识，临时加载什么知识 |
| **s06** | 上下文总会满，要有办法腾空间 |
| **s07** | 大目标拆成小任务，排好顺序落盘 |
| **s08** | 慢操作丢后台，agent 继续想下一步 |
| **s09** | 任务太大一个干不完，分给队友 |
| **s10** | 队友之间要有统一的沟通规矩 |
| **s11** | 队友自己看任务板认领 |
| **s12** | 各干各的目录，互不打扰 |

---

## 核心模式

```python
def agent_loop(messages):
    while True:
        response = client.messages.create(
            model=MODEL, system=SYSTEM,
            messages=messages, tools=TOOLS,
        )
        messages.append({"role": "assistant",
                         "content": response.content})

        if response.stop_reason != "tool_use":
            return

        results = []
        for block in response.content:
            if block.type == "tool_use":
                output = TOOL_HANDLERS[block.name](**block.input)
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": output,
                })
        messages.append({"role": "user", "content": results})
```

每个课程在这个循环上叠加一个机制，循环本身一行都不动。循环属于 agent，机制属于 harness。

## 范围说明 (重要)

本仓库是一个 0→1 的学习项目，有意省略或简化了几类生产级机制：

- 完整的事件 / Hook 总线，例如 PreToolUse、SessionStart/End、ConfigChange。s12 只提供最小化的 append-only 生命周期事件流，仅供教学。
- 基于规则的权限治理与信任流程。
- 会话生命周期控制，例如 resume / fork，以及更完整的工作树生命周期。
- 完整的 MCP 运行时细节，例如 transport / OAuth / 资源订阅 / 轮询。

仓库里的 team JSONL 邮箱协议是教学实现，不是对任何特定生产内部实现的声明。

---

## 快速开始

打开 [scenarios/](scenarios/) 目录。每个子文件夹是一个 Claude Code 机制，用大白话讲清楚原理，再用一个论文写作场景作为锚点。任何顺序读都行，不需要 Python。

Web 平台把同样的内容做成交互式可视化与分步动画：

```sh
cd web
npm install
npm run dev   # http://localhost:3000
```

愿意往下读一层的，每个机制都配了 30 到 800 行的 Python 最小复刻，放在 `agents/` 下，跟场景对照着读：

```sh
git clone https://github.com/Lambenthan/claude-code-for-researchers
cd claude-code-for-researchers
pip install -r requirements.txt
cp .env.example .env   # 编辑 .env 填 ANTHROPIC_API_KEY

python agents/s01_agent_loop.py       # 从这里开始
python agents/s12_worktree_task_isolation.py  # 完整递进终点
python agents/s_full.py               # 总纲：全部机制合一
```

---

## 学习路径

```
第一阶段：循环                        第二阶段：规划与知识
==================                    ==============================
s01  Agent 主循环            [1]      s03  TodoWrite               [5]
     while + stop_reason                   TodoManager + 提醒
     |                                     |
     +-> s02  工具调度             [4]     s04  子会话                [5]
              工具名 → handler 字典           每个子任务新 messages[]
                                              |
                                         s05  Skill                 [5]
                                              SKILL.md 经 tool_result 注入
                                              |
                                         s06  上下文压缩             [5]
                                              三层压缩

第三阶段：持久化                      第四阶段：团队
==================                    =====================
s07  任务系统                [8]      s09  Agent 队友              [9]
     文件 CRUD + 依赖图                     队友 + JSONL 邮箱
     |                                     |
s08  后台任务                [6]      s10  团队协议                [12]
     守护线程 + 通知队列                    关机 + 方案审批 FSM
                                           |
                                      s11  自治 agent              [14]
                                           待命循环 + 自动认领
                                      |
                                      s12  工作树隔离              [16]
                                           任务协调 + 可选独立执行通道

                                      [N] = 工具数
```

## 项目结构

```
claude-code-for-researchers/
|
|-- scenarios/                     # 11 个论文写作场景，对应各机制
|-- agents/                        # Python 参考实现 (s01-s12 + s_full 总纲)
|-- docs/{en,zh}/                  # 心智模型优先的文档
|-- web/                           # 交互式学习平台 (Next.js)
|-- skills/                        # s05 用的 skill 文件
+-- .github/workflows/ci.yml       # CI: 类型检查 + 构建
```

## 文档

心智模型优先：问题 / 方案 / ASCII 图 / 最小代码。提供 [English](./docs/en/) 与 [中文](./docs/zh/)。

| 课程 | 主题 | 格言 |
|:--|:--|:--|
| [s01](./docs/zh/s01-the-agent-loop.md) | Agent 主循环 | *一个循环加一个工具就是 agent* |
| [s02](./docs/zh/s02-tool-use.md) | 工具调度 | *加新工具就是加一个 handler* |
| [s03](./docs/zh/s03-todo-write.md) | TodoWrite | *没有计划的 agent 会走散* |
| [s04](./docs/zh/s04-subagent.md) | 子会话 | *每个子任务有干净的上下文* |
| [s05](./docs/zh/s05-skill-loading.md) | Skill 加载 | *用到什么知识临时加载* |
| [s06](./docs/zh/s06-context-compact.md) | 上下文压缩 | *上下文满了腾空间* |
| [s07](./docs/zh/s07-task-system.md) | 任务系统 | *大目标拆成磁盘上的小任务* |
| [s08](./docs/zh/s08-background-tasks.md) | 后台任务 | *慢操作丢后台* |
| [s09](./docs/zh/s09-agent-teams.md) | Agent 队友 | *分给常驻队友处理* |
| [s10](./docs/zh/s10-team-protocols.md) | 团队协议 | *队友共享沟通规矩* |
| [s11](./docs/zh/s11-autonomous-agents.md) | 自治 agent | *队友自己看板认领* |
| [s12](./docs/zh/s12-worktree-task-isolation.md) | 工作树 + 任务隔离 | *各干各的目录* |

---

## 致谢

本指南改编自 **[shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code)**。`agents/` 下的 12 节 Python 教学和 `web/` 下的 Next.js 学习平台都来自上游，结构保持不动。本仓库的增量是实证研究方向的适配——贯穿案例（耐心资本 → ESG）、`scenarios/` 下的 11 节中文场景章、项目制 / CLAUDE.md 入门页，以及双语写作纪律。

上游团队还做了两个延伸方向的仓库，给想继续往后走的人：

- **[shareAI-lab/Kode-cli](https://github.com/shareAI-lab/Kode-cli)**：开源编程 agent CLI，含 skill 与 LSP 支持
- **[shareAI-lab/claw0](https://github.com/shareAI-lab/claw0)**：心跳 + 定时任务 + IM 通道机制，把按需会话变成常驻助手

## 许可证

MIT。原始版权 © 2024 shareAI Lab；实证研究方向适配 © 2026 Chanw。

---

**Agency 来自模型，harness 让 agency 落地。造好 harness，模型会做完剩下的。**
