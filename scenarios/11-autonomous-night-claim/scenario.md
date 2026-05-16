# 11 · 队友自主认领任务

**Python 复刻**：[agents/s11_autonomous_agents.py](../../agents/s11_autonomous_agents.py)

队友 agent 在没事干时进入"待命"状态，每隔 30 秒自动看一眼共享任务板，发现自己能做的任务就主动认领开始干。不需要你做指挥官——队友们自己看板自己接活。

> 本节贯穿示例：耐心资本对企业 ESG 表现的实证项目 do10 稳健性矩阵要跑 A 面板（替换 PC 测度 × 7 套）+ B 面板（替换设定 × 6 套：ESG 评级版、PC 滞后 1 期、PC 滞后 2 期、行业+年份 FE、企业 FE+行业×年份 FE、双重聚类）+ C 面板（子样本 × 5 套：剔 2015、剔疫情、仅制造业、剔北上广、2013-2023）共 18 组回归。把这 18 组放上任务板，夜里两个稳健性回归队友自主认领跑完，早上回来直接拿 06_结果输出/tables_tsv/table10A_pc_swap.csv、table10B_alt_specs.csv、table10C_subsamples.csv 三份汇总。

---

## 11.1 待命与认领

队友的工作有两种状态。处理任务时是"正在工作"，按你或其他队友的指令推进。没事干时进入"待命"状态，进程仍然驻留。待命时它每隔 30 秒巡检一次共享任务板和自己的邮箱，看有没有自己能做的任务或者新消息。都没动静就再等 30 秒。

待命状态下不会调用模型，只读几个本地文件。所以待命时几乎不消耗 token、几乎不花钱。一个队友持续待命 8 个小时的成本接近零。

"认领"是从待办切到自己名下的动作。队友发现任务板上有一条状态为 pending、依赖全都做完、自己有能力做的任务，就尝试把这条任务的状态改成 in_progress、负责人填自己的名字。一旦认领成功，这条任务进入它的工作流，其他队友看到状态已是 in_progress 自动跳过。

## 11.2 一次真实运行里两个队友的认领序列

那次夜间自治启动前，主会话用 spawn_agent 拉起两个稳健性回归队友：

* `.team/robust-runner-1/identity.md`："稳健性回归专员。擅长：按指定 PC 测度替换主回归 PC，跑 reghdfe esg_score \<PC\> \$ctrls, absorb(firmid year) cluster(firmid)，输出 β/SE/t/p/obs 与 adj R²，把行落到 06_结果输出/tables_tsv/ 下指定 csv 的指定列。"
* `.team/robust-runner-2/identity.md`："稳健性子样本回归专员。擅长：按指定子样本筛选条件（drop if year==2015, drop if inlist(year, 2020, 2021, 2022) 等）跑 firm+year FE 基准回归。"

任务板里 18 条任务，节选关键几条：

```json
{ "id": "tk-r10a-01", "title": "表 10A 第 1 列：PC=PC（A2 主）", "owner_pool": "robust-runner-*", "state": "pending" }
{ "id": "tk-r10a-02", "title": "表 10A 第 2 列：PC=PC_A1", "owner_pool": "robust-runner-*", "state": "pending" }
{ "id": "tk-r10a-07", "title": "表 10A 第 7 列：PC=Rdebt_A1", "owner_pool": "robust-runner-*", "state": "pending" }
{ "id": "tk-r10b-01", "title": "表 10B 第 1 列：LHS=esg_grade_num 离散评级", "owner_pool": "robust-runner-1", "state": "pending" }
{ "id": "tk-r10b-02", "title": "表 10B 第 2 列：PC 滞后 1 期 L.PC", "owner_pool": "robust-runner-1", "state": "pending" }
{ "id": "tk-r10c-01", "title": "表 10C 第 1 列：drop if year==2015", "owner_pool": "robust-runner-2", "state": "pending" }
{ "id": "tk-r10c-04", "title": "表 10C 第 4 列：drop if 城市 in (北京 上海 广州 深圳)", "owner_pool": "robust-runner-2", "state": "pending" }
{ "id": "tk-decision-A2-vs-A1", "title": "决策：A2 主口径不显著是否切到 A1", "owner_pool": "user", "state": "blocked", "blocked_by": [] }
```

晚上 23:14 主会话退场。两个队友开始巡检。

**23:14:32**：robust-runner-1 巡检 → 看到 tk-r10a-01（A2 主测度），owner_pool 是 robust-runner-*，自己匹配。改名 pending-tk-r10a-01.json → in_progress-tk-r10a-01.json，文件系统改名是原子的，认领成功。同一时刻 robust-runner-2 也巡检，看到 tk-r10a-01 已 in_progress，跳过；它看 tk-r10c-01，owner_pool 是 robust-runner-2，认领。

**23:14:48**：robust-runner-1 调 mcp__stata-mcp__stata_do 跑 A2 主回归。完成约 30 秒。落 row 到 06_结果输出/tables_tsv/table10A_pc_swap.csv 第 1 列：β=0.0004 SE=0.0003。任务状态改 done。回到待命。

**23:15:32**：下一轮巡检。robust-runner-1 看 tk-r10a-02（A1）— 认领，跑，β=0.0018*** SE=0.0004，落 row。

**00:05:00 一小时内**：两个队友陆续吞掉 18 条任务。robust-runner-1 跑完表 10A 7 列 + 表 10B 6 列共 13 条；robust-runner-2 跑完表 10C 5 列共 5 条。每条任务从认领到落 row 约 30-60 秒，全部 18 条约 50 分钟跑完。

**00:54:00**：所有 18 条任务状态都是 done。两个队友再巡检，任务板没有可做任务，只剩 tk-decision-A2-vs-A1 是 owner_pool=user 不属于自己。两个队友进入低频待命，每 30 秒巡检一次，几乎不消耗 token。

**08:30:00**：你早晨打开 Claude Code 看见三份 csv 已经齐整。table10A_pc_swap.csv 7 列 + table10B_alt_specs.csv 6 列 + table10C_subsamples.csv 5 列。table10B 第 1 列显示 ESG 评级版 PC β=0.0120*（与主口径 0-1 标准化下的 0.0004 形成对比、规模差 30 倍），第 2/3 列 PC 滞后 1 期 β=0.0010***、滞后 2 期 β=0.0008**（耐心资本对 ESG 是延迟效应的强证据）。table10C 5 个子样本 β 都稳定在 0.0004–0.0005、方向一致。

整夜你没起来管，两个队友各自看板各自接活、互不抢任务、各自做完落 row 回到待命。早上回来直接看汇总。

## 11.3 怎么判断能不能做

每个队友在自己的 identity.md 里声明自己擅长哪类任务，同时任务板上每条任务带 owner_pool 字段说明候选队友。robust-runner-1 看 tk-r10a-01 时先比对 owner_pool="robust-runner-*"——通配符匹配，自己合格；再比对自己的能力描述与任务标题，"按指定 PC 测度替换主回归"匹配，决定尝试认领。

多个队友同时看到同一条任务时怎么避免重复认领？靠文件改名这件事在文件系统层是"不可被打断的"。把任务文件从 pending-tk-r10a-01.json 改名成 in_progress-tk-r10a-01.json，谁先把改名指令送到文件系统谁就成功，后到的看到文件已经被改走了，知道任务已被领走、放弃。这是单台电脑上天然提供的协调机制，不需要再加额外的锁。上面那个 23:14:32 时刻 robust-runner-1 跟 robust-runner-2 都看到了 tk-r10a-01，runner-1 抢到改名，runner-2 看到改名失败就翻下一条 tk-r10c-01。

成功认领后队友进入正常工作流处理任务，跑完把任务状态改成 done 或 blocked，被阻挡时附一段说明，然后回到待命等下一条。

## 11.4 为什么不让主对话分派

集中式分派需要一个领导 agent 协调所有任务，每分派一条要花一次模型调用让领导判断"这条该给谁"。两个队友 18 条任务，光是分派开销就要 18 次模型调用。每条任务分派一次，几十条任务就是几十次额外调用。

自治认领把分派从"每条都要花一次模型调用"压到"每次只读几个本地文件"。成本下降几个数量级。队友也不再依赖中央调度——领导临时退场或网络不通时，队友照样能继续工作。上面那次主会话 23:14 退场后，整夜两个队友都没用过一次主对话，但 18 条任务在 50 分钟内全部完成。

更重要的好处是夜间无人值守时仍能持续推进。你睡觉时主对话进入空闲，但队友的待命循环继续。带"能力描述"清楚的队友能在 8 小时内吞掉几十条机械性回归任务——替换 PC 测度、替换 ESG 测度、剔除某子样本、滞后 1/2 期再跑、ESG 离散评级版本——等你早上回来交一份完工清单。

## 11.5 容易踩的坑

能力描述写得越具体越好。"擅长所有 Stata 任务"这种笼统描述会让队友认领一些其实需要研究判断的任务，比如选 IV 工具变量该用 IV1 同行业均值还是 IV3 PC 滞后。应该列具体可做的任务类型——"擅长按 PC_A2/A1/B2/C 套替换主测度跑 reghdfe firm+year FE 并落表"这种。

夜间自治的边界必须显式声明。涉及研究判断的任务必须设成 owner_pool=user，等用户决策——比如改 PC 主测度、调整样本期、新增控制变量、修改机制方向。上面那次任务板里 tk-decision-A2-vs-A1 就是这样设的，整夜两个队友看着这条 blocked，从不尝试认领。这层约束应该写进 CLAUDE.md，让队友每次启动时都看到。

无人值守期间任务图可能进入死锁——所有 pending 任务都在等其他任务先做，但其他任务自己也在等。队友检测到这种情况会停下来等你介入。这是设计预期，避免队友盲目尝试浪费资源。

## 11.6 知识地图

| 关键词 | 含义 | 容易误会的点 |
|:---|:---|:---|
| 待命状态 | 队友无任务时的低频检查循环 | 不是停止；只是检查频率低、不调模型 |
| 能力描述 | identity.md 里声明的可做任务类型 | 写得越具体越准；笼统描述会乱认领 |
| 认领的原子性 | 改名作为单台电脑上不可被打断的操作 | 不需要额外的锁机制就能避免并发认领 |
| 自治边界 | 机械任务可自治，研究判断必须等人 | 由 CLAUDE.md 显式声明范围 |
