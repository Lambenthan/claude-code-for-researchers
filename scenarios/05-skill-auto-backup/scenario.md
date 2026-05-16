# 05 · Skill 按需加载规则

**Python 复刻**：[agents/s05_skill_loading.py](../../agents/s05_skill_loading.py)

Skill 是一份用 markdown 写的规则文件，定义"遇到某类场景就先做某件事"的工作纪律。Skill 内容不预先全部塞进 Claude 的工作记忆，命中触发条件的那一刻才临时调进来。这样装很多 skill 也不会让 Claude 变慢、不会让对话变拥挤。

> 本节贯穿示例：耐心资本对企业 ESG 表现的实证项目 CLAUDE.md 第八节规定了六条工作纪律，每条做成一份 SKILL.md——paper-confirm-before-doing、paper-backup-before-word、paper-protect-terminology、paper-pilot-before-batch、paper-logical-consistency、paper-verify-before-handoff。Phase 2 收尾要把 IV / PSM / 机制 / 异质性 / 稳健性 5 类共 7 张表合并进已有的 07_论文写作/01_主表/PC_ESG_主表汇总_phase1.docx，动手前 paper-backup-before-word 自动命中触发。

---

## 5.1 Skill 是什么

每个 skill 是一份 SKILL.md 文件。文件最上面是元数据头，给出这个 skill 的名字和一句话描述它在什么场景下生效。下面是这个 skill 的具体规则——可能是"动手前先备份"，可能是"按特定格式回复"，可能是"按某种顺序调用某几个工具"。

Claude Code 启动时会扫一遍存放 skill 的目录，把所有 skill 的"名字 + 一句话描述"做成一份索引。这份索引常驻在 Claude 的工作记忆里，几百到几千文字量。索引只记一句话，不记规则全文。

规则全文不进工作记忆。模型在每条用户消息进来时对照索引扫一遍——这条消息匹配哪个 skill 的描述了吗。匹配上了就调一次"加载"动作，把对应的 SKILL.md 全文临时调进对话，作为后续轮次的参考。

## 5.2 一次真实运行里 skill 怎么命中加载

下面是 phase 2 收尾那次会话里 paper-backup-before-word 从命中到生效的完整过程。

**轮 1**：你说"把表 6 IV / 表 7 PSM+Heckman+Change / 表 8 机制 / 表 9 异质性 / 表 10 ABC 三个面板共 7 张表合进 PC_ESG_主表汇总_phase1.docx"。Claude 在做下一步动作之前先扫索引——

* 命中 `paper-backup-before-word`：描述写着"改 .docx 文件前先创建带时间戳的备份，并评估是否用 markitdown 转 LaTeX 再编辑"。当前指令含"合进 .docx"，匹配。
* 命中 `paper-protect-terminology`：描述写着"跨文件改写或术语统一前先复读项目 CLAUDE.md 第二节保护清单"。当前指令是合表入 docx，不涉及术语跨章替换，不匹配。
* 命中 `paper-confirm-before-doing`：描述写着"改文件前对模糊指令先陈述方案"。当前指令明确，不需要陈述方案，不匹配。

只有 paper-backup-before-word 这一条匹配。Claude 决定加载它。

**轮 2**：Claude 调用 load_skill("paper-backup-before-word")。代码侧的执行函数读 ~/.claude/skills/paper-backup-before-word/SKILL.md 全文，作为工具结果回传。规则全文进入对话历史。规则要求两步：第一步用 cp 创建带时间戳副本到 .bak/ 目录、第二步评估是否用 markitdown 把 docx 转 markdown 编辑后再转回。

**轮 3**：Claude 按规则第一步做。调用 Bash 跑 `cp 07_论文写作/01_主表/PC_ESG_主表汇总_phase1.docx 07_论文写作/01_主表/.bak/PC_ESG_主表汇总_phase1_20260510_1102.docx`。备份落盘。

**轮 4**：Claude 按规则第二步做评估。读 build_word_phase1.js 这份 Node.js 文档生成器，发现 phase1 docx 是用 docx 库程序化生成的（含原生三线表、合并单元格），不是 Word 手工排版。结论是：用同样的 Node.js 生成器把 7 张新表追加进去最稳定，markitdown 转 markdown 在三线表合并单元格上会失真。

**轮 5**：Claude 用 Read 看现有 build_word_phase1.js 的 buildTable 函数签名，再调用 Write 写 build_word_full.js——在 phase1 的 5 张表后面追加表 6 IV、表 7 内生性矩阵、表 7 PSM 摘要、表 8 机制、表 8 Sobel 摘要、表 9 异质性、表 10ABC 三个面板。

**轮 9**：Bash 跑 `node 05_分析代码/build_word_full.js`，生成 07_论文写作/01_主表/PC_ESG_主表汇总.docx，28.9 KB，12 张原生 Word 三线表 + 综合发现 + 解读建议。validation 全过。

加载完成的 skill 在当前会话剩下的轮次里都存在，模型可以反复参考。当 phase 2 还要回头改 docx 时——例如审稿意见回来后要增加一张作者贡献声明表——同一会话内不需要重新加载，规则已在对话历史里。会话结束时随对话历史一起销毁。下次新会话再做 docx 操作时重新触发加载。

## 5.3 为什么不全部预加载

预加载所有 skill 在 skill 数量增长后会撑爆工作内存。装 30 个 skill 每个 2000 字，预加载就是 6 万字常驻。Claude 的工作内存虽然不小，但被这 6 万字占去后留给你和它对话的空间就被吃掉很多，长会话很快撞顶。

按需触发让索引常驻、规则全文按场景调入。装 30 个 skill 平时占的是几千字的索引，规则全文不进工作内存，需要哪条才把哪条调进来。

skill 之间还可能有规则冲突。一份说"动手前先备份"、一份说"动手前先做小范围试点"、一份说"动手前先和你确认方案"。三条都预加载的时候，模型在做一个简单任务时会陷入多条规则相互制约。按需触发让每条规则只在自己真正相关的时刻才进入工作内存，规避冲突。上面那次 phase 2 收尾合表只命中 paper-backup-before-word 一条，没把另外五条工作纪律一起拉进对话，省下大量上下文。

skill 系统也让"工作纪律"成为可累积的对象。你在使用中发现某种场景需要 Claude Code 强制执行一条规则时，写一份新 SKILL.md 放进 skill 目录即可。下次会话该规则自动加入索引并按场景触发。实证研究的工作经验慢慢累积成一组规则库——paper-pilot-before-batch 要求批量任务前先在 3-5 个样本上试跑、paper-verify-before-handoff 要求交付前跑硬检查清单。

## 5.4 容易踩的坑

skill 的描述写得模糊时，模型会漏触发。触发率取决于描述与你实际指令的语义匹配度，含糊描述触发不稳定。装一个 skill 时如果它的描述不准确，最好按你的实际使用场景改一改描述。例如 paper-backup-before-word 的描述如果只写"修改重要文件前备份"，模型在改 main_panel.dta 时也会误触发；写"改 .docx 文件前备份"就只在改 Word 文件时命中。

skill 全文进入对话后会占用工作内存。在已经接近上限的会话里触发一个很长的 SKILL.md 可能促使后续压缩。频繁加载多个 skill 会显著加快工作内存的消耗速度。

加载是一次性的。模型在当前会话里调过 load_skill 后，规则跟随对话历史存在，但被压缩后部分规则可能丢失，需要重新触发加载。

## 5.5 知识地图

| 关键词 | 含义 | 容易误会的点 |
|:---|:---|:---|
| SKILL.md | 一份 markdown 规则文件，定义某场景下的工作纪律 | 是给模型读的指令，不是可执行代码 |
| 一句话描述 | 触发判断的唯一依据 | 索引里只存它；触发准不准完全看它写得清不清楚 |
| load_skill | 把规则全文调进对话的工具调用 | 是模型主动调的，不是系统自动注入 |
| 索引常驻 | 只有"名字 + 一句话"常驻工作内存 | 规则全文按场景调入；30 个 skill 索引只占几千字，规则全文不算入 |
