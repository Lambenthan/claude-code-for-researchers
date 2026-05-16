# 07 · 跨会话任务图

**Python 复刻**：[agents/s07_task_system.py](../../agents/s07_task_system.py)

任务系统把每条任务存成磁盘上的一份文件，跨会话保留。今天关掉 Claude Code 明天回来开新会话，所有任务还在原处——状态、依赖关系、负责人全部记得。

> 本节贯穿示例：耐心资本对企业 ESG 表现的实证项目，phase 1 跑完 do0–do6 后落地了 main_panel.dta（26441 obs）与 5 张三线表，phase 2 还要做 do7 IV/PSM、do8 机制、do9 异质性、do10 稳健性矩阵 ABC 三个面板共 13 组。任务跨周推进，checkpoint.md 顶层四类——已完成 / 进行中 / 待做 / 待解决——的具体条目按依赖关系拆进 .tasks/，每条任务记 stata-mcp do-file 名、产物表号、依赖前置任务。

---

## 7.1 跟 TodoWrite 的区别

第 03 节讲过的 TodoWrite 是单次会话里的内存清单。这次坐下来要做的事都在它里面，会话关掉清单也跟着消失。

任务系统不一样。它是磁盘上的一份持久化工作板，会话之间能接得上。实证项目里像"phase 1 收尾 + 等待主口径决策 + phase 2 + 数据缺口逐步补齐"这种规模，单个会话装不下，需要的是一份磁盘上的工作板。

简单说：TodoWrite 服务"这次坐下来要做的事"，任务系统服务"这个项目还没完的事"。两者分工，互不替代。三个小时把 do0–do6 跑完用 TodoWrite，跨周推进 phase 1 → 等决策 → phase 2 四个 do + 12 张表用任务系统。

## 7.2 一份真实任务图长什么样

phase 1 收尾、phase 2 启动那个时点，工作目录 `.tasks/` 下的任务文件大致是这几条：

```json
{
  "id": "phase1-done",
  "title": "phase 1：do0_setup → do6_baseline 七脚本顺序完成",
  "state": "done",
  "products": ["04_中间数据/main_panel.dta (26441 obs)",
               "06_结果输出/tables/table{1..5}_*.rtf",
               "07_论文写作/01_主表/PC_ESG_主表汇总_phase1.docx"]
}
```
```json
{
  "id": "phase2-decision-pc-main",
  "title": "决策：A2 主口径 OLS 不显著（β=0.0004），是否切到 A1 经典（β=0.0018***）作主口径",
  "state": "blocked",
  "blocked_by": [],
  "owner": "user",
  "note": "需用户拍板；checkpoint.md 第四节已记录"
}
```
```json
{
  "id": "phase2-do7-iv-psm",
  "title": "do7_iv_psm：IV1 同行业均值 + IV2 前十大股东 + IV3 PC 滞后 + PSM 1:1 nn + Heckman + Change + Placebo 500",
  "state": "pending",
  "blocked_by": ["phase2-decision-pc-main"],
  "owner": "main"
}
```
```json
{
  "id": "phase2-do8-mech",
  "title": "do8_mechanism：KZ 通道 a/b 段 + Myopia 通道 a/b 段 + Sobel + Bootstrap CI",
  "state": "pending",
  "blocked_by": ["phase2-do7-iv-psm"],
  "owner": "main"
}
```
```json
{
  "id": "phase2-do9-hetero",
  "title": "do9_hetero：规模 / Lev / 国有 / 上市年限 4 维度交互项",
  "state": "pending",
  "blocked_by": ["phase2-do7-iv-psm"],
  "owner": "main"
}
```
```json
{
  "id": "phase2-do10-robust",
  "title": "do10_robust：表 10A PC 测度替换 7 套 + 表 10B 替换设定 6 套 + 表 10C 子样本 5 套",
  "state": "pending",
  "blocked_by": ["phase2-do7-iv-psm"],
  "owner": "robust-runner-1"
}
```

Claude Code 启动新会话时扫一遍 `.tasks/`，把所有任务文件读进内存重新拼出整张任务图。会话期间所有更新写回对应文件。

## 7.3 任务图能做什么查询

最常用的查询是"接下来该做什么"。系统提供一个 next_actionable() 接口，它检查所有任务：state 是 pending、依赖的任务全都已完成的，挑出来作为候选。phase 1 刚收尾那个时点调一次 next_actionable()：phase2-decision-pc-main 是 blocked owner=user，不属于 main agent 可以推进的；其它 phase2-do7/8/9/10 都被 phase2-decision-pc-main 阻挡——返回空候选清单。Claude 看见空清单就向你回报"等你定 PC 主口径"。

另一类查询是按 do-file 或按章节筛选。"列出 phase 2 还有哪些 pending"返回 do7/do8/do9/do10 四条；"看下 do10 稳健性还有哪几个子样本没跑"——把 do10 拆得更细的话能查到表 10A 七套、表 10B 六套、表 10C 五套各自的状态。

任务完成时的状态更新会自动传播。把"phase2-decision-pc-main"从 blocked 改成 done（你拍板"维持 A2 主口径，把 OLS 不显著作为新发现讨论"）的瞬间，系统检查所有 blocked_by 里含它的任务：phase2-do7-iv-psm 的依赖现在为空，状态从 pending 切回 actionable，下次 next_actionable() 调用时它就出现在候选清单里。再过半天 do7 跑完落 state=done，phase2-do8/9/10 三条同步从 blocked 切回 actionable，可以并行启动。

## 7.4 为什么不用数据库

选用纯 JSON 文件而不引入数据库，是为了 git 友好与最低的运维成本。每条任务一个文件让 git diff 清楚显示每次状态变更——phase2-do7-iv-psm 什么时候从 pending 变成 in_progress、in_progress 变成 done，谁改的，看 git log 就知道。实证项目通常已经在用 git 管 do/ 与 chapters/，任务图直接跟代码与正文一起进 git。

文件存储的另一个好处是没有数据库服务要起、没有连接配置要管、没有版本升级要操心。删一条任务就是删一个文件，看任务详情就是 cat 一个文件。

任务图还是多个 agent 协作的基础。第 09 节讲的评审小组、第 11 节讲的夜间自动认领，都依赖共享的任务图——比如 phase2-do10-robust 的 owner 字段写 robust-runner-1，让夜间自治队友自己看板自己认领。任务系统不仅服务跨会话恢复，也服务多个 agent 之间的工作分配。

## 7.5 容易踩的坑

任务图不适合非常高频的更新。每条更新是一次文件写入，几十条任务的批量更新没问题，但任务数超过几千条后写入会变慢。Claude Code 默认假设任务规模在几十到几百条之间。

依赖关系靠任务文件里的 blocked_by 字段标记。如果模型在新建任务时漏标依赖，next_actionable() 可能把实际上不该立刻做的任务列入候选——比如还没等 phase2-do7 跑完就把 phase2-do8 标成可做，结果机制检验时 PC 主口径还没有过 IV 矫正、跑出来的 a 段系数没法引用。依赖识别由模型完成，准确性依赖模型对项目语义的理解。

任务图不存周期性任务、不存定时触发、不存通知订阅。它是一份静态的任务清单加依赖图。任何动态行为，比如轮询、调度、通知，由其它机制承担。

## 7.6 知识地图

| 关键词 | 含义 | 容易误会的点 |
|:---|:---|:---|
| `.tasks/` 文件夹 | 工作目录下存放任务图的目录 | 是纯 JSON 文件，不是数据库 |
| blocked_by 字段 | 必须等待哪些任务先完成 | 没依赖就省略字段，不要标空数组 |
| next_actionable() | 立刻可开始的任务候选集 | 由依赖图自动计算，不需要手工维护 |
| 跨会话持久化 | 会话关闭后任务图仍在磁盘 | 重启 Claude Code 时自动重建内存任务图 |
