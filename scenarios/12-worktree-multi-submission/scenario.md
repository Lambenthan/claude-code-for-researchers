# 12 · 多版本并行不冲突

**Python 复刻**：[agents/s12_worktree_task_isolation.py](../../agents/s12_worktree_task_isolation.py)

同一项研究要并行维护几个稳健性方向时，每个方向需要独立的目录与独立的 git 分支，多个 agent 同时各做各的不互相干扰。Claude Code 用 git 提供的"多目录"机制让每个稳健性版本住在独立目录里，几个 agent 同时各跑各的回归互不冲突。

> 本节贯穿示例：耐心资本对企业 ESG 表现的实证项目要并行维护三个版本——pc-esg/ 主目录跑华证 ESG 0-1 连续主测度（do6 baseline 用 esg_score）、pc-esg-discrete/ 跑华证 AAA-CCC 1-9 离散评级（替换被解释变量为 esg_grade_num，β=0.0120* 显著、规模比 0-1 版大 30 倍）、pc-esg-subscores/ 跑 E/S/G 三分项（拆解被解释变量为 e_score01/s_score01/g_score01）。三个版本核心数据相同，只是 do6_baseline.do 里 LHS 替换或拆解。

---

## 12.1 多目录是什么

如果你用过 git 做版本管理，可能习惯一个项目就一个目录。git 有个进阶功能叫 worktree，能让同一个仓库同时有几个独立的目录，每个目录是一份完整的项目工作版本，分别对应不同的分支。

举例：项目主目录是 `pc-esg/`，里面是主分支的内容（华证 ESG 0-1 连续版）。用 `git worktree add` 在旁边创建 `pc-esg-discrete/`，这个新目录里是 esg-discrete 分支的工作版本，跟主目录共享同一份 git 历史，但工作文件互不影响。在 pc-esg-discrete/ 改 do6_baseline.do 把 LHS 从 esg_score 换成 esg_grade_num，不影响主目录的 do6。

Claude Code 把这套多目录机制跟任务系统连起来。每条任务可以指定它在哪个目录里跑。agent 接到任务时先切换到对应目录，后续所有读文件、改文件的动作都在那个目录里发生。

## 12.2 一次真实运行里三个 worktree 怎么挂上

下面是 phase 2 收尾时主会话把三个稳健性版本拆成三个 worktree 的过程。

**轮 1**：主会话调 Bash 创建两个新 worktree。
```bash
git worktree add ../pc-esg-discrete   submission/esg-discrete
git worktree add ../pc-esg-subscores  submission/esg-subscores
```
现在 disk 上有三个并列目录：pc-esg（原工作树，主分支）、pc-esg-discrete（新树，submission/esg-discrete 分支）、pc-esg-subscores（新树，submission/esg-subscores 分支）。git 历史共用。

**轮 2**：在 pc-esg-discrete/ 里，主会话调 Edit 修改 .statamcp/stata-mcp-dofile/do6_baseline.do，把所有 reghdfe 的 LHS 从 esg_score 替换为 esg_grade_num（华证 AAA-CCC 数值化 1-9 评级）。

**轮 3**：在 pc-esg-subscores/ 里，把 do6_baseline.do 复制成 do6_baseline_e.do / do6_baseline_s.do / do6_baseline_g.do 三份，分别用 e_score01 / s_score01 / g_score01 作 LHS。

**轮 4**：任务板里追加三条 worktree 任务：

```json
{ "id": "tk-disc-baseline",
  "title": "ESG 离散评级版：用 esg_grade_num 替换 LHS 后跑 baseline + 表 10A 7 套",
  "worktree": "../pc-esg-discrete",
  "branch": "submission/esg-discrete",
  "owner_pool": "robust-runner-*" }
{ "id": "tk-sub-baseline-e",
  "title": "E 分项版：用 e_score01 跑 baseline 与稳健性",
  "worktree": "../pc-esg-subscores",
  "branch": "submission/esg-subscores",
  "owner_pool": "robust-runner-*" }
```

**轮 6**：robust-runner-1 认领 tk-disc-baseline。它第一件事是把当前工作目录切到 ../pc-esg-discrete。后续所有 Read、Edit、stata-mcp_do 的相对路径都从这个目录算起。robust-runner-1 跑 do6_baseline.do 离散评级版，得到 LHS=esg_grade_num 时 PC β=0.0120 SE=0.0069，p<0.10。这个结果与主目录 LHS=esg_score 时 β=0.0004 形成强对比——评级是离散刻度（1-9）所以系数比 0-1 标准化大 30 倍是正常的。

**轮 7**：与此同时 robust-runner-2 认领 tk-sub-baseline-e，切到 ../pc-esg-subscores 跑 E 分项回归。robust-runner-1 与 robust-runner-2 物理上处理的是不同路径下的不同 .do 文件——pc-esg-discrete/.statamcp/stata-mcp-dofile/do6_baseline.do 与 pc-esg-subscores/.statamcp/stata-mcp-dofile/do6_baseline_e.do——自然不冲突。

**轮 9**：robust-runner-1 跑完 tk-disc-baseline，在 ../pc-esg-discrete 里把 06_结果输出/tables_tsv/table10B_alt_specs.csv 第 1 列填上 ESG 评级版 β=0.0120*。这个 csv 与主目录的 csv 是不同文件——pc-esg-discrete/06_结果输出/ 是独立的。

**轮 14**：所有三个 worktree 各自把自己的 baseline + 稳健性跑完。主会话最后做一次跨 worktree 综合：调 Read 分别读三个目录的 06_结果输出/tables_tsv/table10B_alt_specs.csv 第 1 列、table4_esg_subscores.csv，合成一份"三个稳健性版本对比"摘要，写到 pc-esg/07_论文写作/稳健性版本对比.md。

## 12.3 任务怎么绑定目录

任务文件里加两个字段：worktree 写目录路径、branch 写对应的分支名。一份典型的多版本任务文件长上面 tk-disc-baseline 那样。

agent 认领这条任务后，第一件事是把"当前工作目录"切到 worktree 指定的路径。后续所有工具调用——Read、Edit、Write、Bash、stata-mcp_do——的相对路径都从这个目录算起。

多个 agent 同时处理几条不同的多版本任务时，每个 agent 分别在自己的目录里工作。物理上它们处理的是不同路径下的不同 .do 文件，自然不冲突。

## 12.4 跨版本怎么同步

最常见的场景是发现一个核心错误，比如表 1 描述统计里某个控制变量缩尾边界写反了——原始 main_panel.dta 里 Lev 的 winsor cuts 应该是 (1 99) 但 do4 错写成 (5 95)——三个版本都要同步过去。处理方式是：在主目录 pc-esg/ 里把 do4_panel_assemble.do 第 134 行修正、重跑 do4 落新的 main_panel.dta、commit 到主分支，然后到每个 worktree 跑一句 `git pull --rebase origin main`，git 自动把主分支的修正合并进这个分支。每个 worktree 拉一次新数据集后再跑自己的 do6，结果都基于修正后的面板。

git 的合并算法处理冲突。多数情况下核心修改影响的只是某一两行，自动合并即可。如果分歧大到 git 没法自动决定，它会停下来让你看冲突在哪里。实证项目里这种大冲突不常见，因为不同稳健性版本的差异通常局限在几个变量替换语句（do6 里的 esg_score → esg_grade_num），核心数据合并段落（do4）是共享的。

## 12.5 多目录隔离的设计

如果所有版本都在同一个目录里操作，让两个 agent 同时跑必然冲突。两个 agent 各自读一份当前 do6，各自修改其中的 LHS 变量名，各自写回，后写的会覆盖前面那个刚处理完还没读到的内容。要解决得加文件锁、加锁就要串行、串行就失去了并行的意义。

把每个版本放进独立目录后，物理隔离让冲突天然不会发生。agent 看不到其他目录的工作状态，自然不会互相干扰。需要同步的事留到 git commit 那一刻才处理——git 的合并工具是成熟的，不是 Claude Code 的负担。

多目录还有一个独立好处：版本可独立保存。主测度版投稿后那个目录可以放在原地不动，被冻结在投稿时的状态。三个月后审稿意见回来直接进那个目录继续工作，所有当时的 .do 文件、Stata log、临时表都在原地。其他两个稳健性版本同时在各自目录独立推进，互不影响。

## 12.6 容易踩的坑

worktree 数量过多会加重磁盘占用。每个 worktree 是一份完整的工作目录，文件数量乘以 worktree 数量等于实际磁盘上的文件数。上面那个项目三个 worktree 加起来约 600 MB（main_panel.dta 与 PC 七合一.dta 是大头，每个 worktree 各一份）。实证项目通常 worktree 数量在 2 到 5 之间，过多管理成本超过收益。

跨版本同步依赖 git 操作的正确性。`git pull --rebase` 在版本分歧较大时可能产生冲突，要人工解决。Claude Code 的 agent 能处理简单冲突，复杂冲突要交回你。上面那次同步 do4 的修正合并到三个 worktree 时，pc-esg-subscores 因为已经在本地修改过 do6_baseline_e.do 导致 rebase 报冲突，agent 停下来等用户介入。

worktree 用完后需要显式清理。废弃的 worktree 不会自动删除，会一直占盘。手动跑 `git worktree remove <path>` 才会清掉。

## 12.7 知识地图

| 关键词 | 含义 | 容易误会的点 |
|:---|:---|:---|
| git worktree | 同一个 git 仓库的多个独立工作目录 | 共享 git 历史，工作文件互不影响 |
| 任务的 worktree 字段 | 把任务绑定到具体的目录 | 在创建任务时显式指定，agent 不会自动猜 |
| 并行隔离 | 多个 agent 同时工作互不干扰 | 没有文件锁，靠各自目录不同实现物理隔离 |
| 跨版本同步 | 主分支 commit + 各 worktree rebase | git 自动合并；版本分歧大时才需要人工处理冲突 |
