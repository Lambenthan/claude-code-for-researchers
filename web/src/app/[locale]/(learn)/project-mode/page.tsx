import ProjectModeAnimation from "@/components/visualizations/project-mode";

const locales = ["en", "zh"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Copy {
  title: string;
  intro: string;
  s1Header: string;
  s1Body: string[];
  treeHeader: string;
  treeCode: string;
  s2Header: string;
  s2Body: string[];
  s3Header: string;
  s3Body: string[];
  s4Header: string;
  s4Body: string[];
  trapsHeader: string;
  traps: { title: string; desc: string }[];
}

const COPY_ZH: Copy = {
  title: "什么是项目制",
  intro:
    "用过网页版 ChatGPT 或 Claude.ai 的人习惯了'打开一个对话窗 → 输入问题 → 拿到答案 → 关掉就没了'。Claude Code 不一样：它始终在一个具体的文件夹里工作，这个文件夹就是一个项目。所有交互都围绕这个文件夹展开。",
  s1Header: "一个项目就是一个文件夹",
  s1Body: [
    "在 Claude Code 里，'项目'不是一个抽象概念，就是你硬盘上的一个文件夹。本指南用一个具体的实证项目'耐心资本对企业 ESG 表现的影响'贯穿，它的文件夹叫 ~/papers/pc-esg/。如果你同时手上还有一个 meta 分析项目，就在 ~/papers/meta-analysis/ 另开一个。两者完全独立。",
    "你启动 Claude Code 之前先 cd 进入这个文件夹，再敲 claude。Claude Code 启动后，整个会话的工作目录就锁在这个文件夹里。它能读这个文件夹下的所有文件，可以在这个文件夹里创建新文件，可以跑这个文件夹下的 .do 脚本。文件夹外的东西它看不到——除非你明确指定路径让它去读，比如 /Users/han/Demonstration_Data/EmpiricalWiki/。",
    "这种'锁在文件夹里工作'的特性叫工作目录（working directory）。是 Claude Code 跟网页版聊天工具最大的区别。",
  ],
  treeHeader: "耐心资本 → ESG 这个项目的文件夹长什么样",
  treeCode: `~/papers/pc-esg/
├── CLAUDE.md                       ← 给 Claude 的项目说明（保护清单 + A2 主测度等）
├── checkpoint.md                   ← 跨会话进度记录
├── 01_文献/                        ← 文献 PDF + 8 框架索引
├── 02_变量字典/                    ← 测算方法说明.md / 变量对照表.xlsx
├── 03_原始数据/                    ← CSMAR + 华证 ESG + 管理者短视主义
├── 04_中间数据/
│   ├── main_panel.dta              ← 主面板 26874 obs, 3608 firms
│   ├── csmar_panel.dta
│   └── 耐心资本_七合一_WZY.dta
├── 05_分析代码/
│   └── 耐心资本-全套代码.do        ← do0_setup → do10_robust
├── 06_结果输出/
│   ├── tables/                     ← Table 1–10 (RTF)
│   └── tables_tsv/                 ← Table 1–10 (CSV 可读版)
├── 07_论文写作/
│   ├── 01_主表/
│   └── 02_文献综述/
└── .git/                           ← git 版本历史`,
  s2Header: "为什么用文件夹做项目边界",
  s2Body: [
    "把所有项目相关的东西放在同一个文件夹里，意味着 Claude Code 在这个会话里只关心耐心资本 → ESG 这一件事。它不会去你的另一篇论文里翻东西，也不会读你的浏览器历史。研究上你同时手上有 3-4 个实证项目很正常，每个一个文件夹，对应 3-4 个独立的 Claude Code 会话，互不干扰。",
    "文件夹边界也是天然的隔离边界。某一天你想试一种新的 PC 测度（比如把 A2 换成 B1）但怕弄坏主回归，你 cp -r ~/papers/pc-esg ~/papers/pc-esg-experiment 复制一份，再在新文件夹里启动 Claude Code 折腾。原始项目完好。",
    "git 版本历史天然属于这个文件夹。每次 commit 都记录这个项目当时的状态。需要回到 phase 1 刚结束的版本，git checkout 一下就回去了。Claude Code 跟 git 配合得非常紧——它会主动建议你定期 commit，也能帮你看 git log 回忆当时改了什么。",
  ],
  s3Header: "项目文件夹里要放什么、不要放什么",
  s3Body: [
    "放进去：论文源文件（.tex / .docx）、数据（.dta、原始 .xlsx、CSMAR zip）、脚本（do、R、Python 都可以）、参考文献库（.bib）、给 Claude 的说明文件（CLAUDE.md）、进度文件（checkpoint.md）、跟导师讨论的会议记录。这些都是项目本身的一部分，Claude 干活时需要随时看到。",
    "不要放进去：体积很大的中间产物（比如几 GB 的 Bootstrap 全部置换样本），可以放在文件夹外用绝对路径引用。不要放敏感数据（受试者隐私、未脱敏的微观调查数据），如果必须放，请加密或放进 .gitignore 防止被 git 跟踪。也不要放跟这个项目完全无关的文件，会污染 Claude 的工作上下文。",
    "实操建议：你不确定要不要放进去的东西，先放着；只要 Claude Code 偶尔会需要查到它，放进项目里就是合理的。Claude 不会主动读所有文件，它只在你提示需要时才去读，所以放多了不会浪费。",
  ],
  s4Header: "项目模式的好处一句话总结",
  s4Body: [
    "网页聊天工具一问一答，关掉就没。Claude Code 一直待在你的耐心资本 → ESG 项目文件夹里，看得见你过去几个月跑完的 do0–do10、12 张三线表、phase 1 与 phase 2 的所有 Stata log，知道你定的 PC_A2 主测度，知道 KZ 是 WW 的替代。下次打开 Claude Code 进入同一个文件夹，它从你上次离开的地方接手。状态全在这个文件夹里：文件内容、git 历史、CLAUDE.md、checkpoint.md。模型本身不留任何东西。",
  ],
  trapsHeader: "新手最容易犯的几个坑",
  traps: [
    {
      title: "在错的文件夹里启动",
      desc: "在 ~/Downloads 里 claude 启动就会让 Claude Code 把 ~/Downloads 当成项目根目录。一定要先 cd 到 ~/papers/pc-esg 这种项目文件夹再启动。检查方法：启动后输入 pwd 看一下工作目录是不是对的。",
    },
    {
      title: "在桌面随便开会话",
      desc: "桌面或 home 目录下启动会让 Claude 看到一堆零散文件，分不清哪些跟当前任务相关。把每个实证项目放在独立的命名清楚的文件夹里，启动 Claude 前先 cd 进去。",
    },
    {
      title: "把项目文件夹搬来搬去",
      desc: "项目文件夹的路径变了，CLAUDE.md 里写死的绝对路径、.do 文件里用的相对路径都可能失效。搬动前先 git commit 保存当前状态，搬完后启动 Claude Code 检查一遍它能不能正常读到 main_panel.dta 等主要文件。",
    },
  ],
};

const COPY_EN: Copy = {
  title: "What is Project Mode",
  intro:
    "If you have only used ChatGPT or Claude.ai in a browser, you are used to a flow like 'open a chat window → ask a question → get an answer → close the window and everything is gone.' Claude Code is different: it always works inside a specific folder. That folder is a project. Every interaction in the session revolves around that folder.",
  s1Header: "A project is just a folder",
  s1Body: [
    "In Claude Code, 'project' is not an abstract concept. It is a folder on your disk. This guide uses one specific empirical project — Patient Capital → Corporate ESG Performance — as the running example, and its folder is ~/papers/pc-esg/. A separate meta-analysis project would live in ~/papers/meta-analysis/. The two are independent.",
    "Before launching Claude Code, you cd into the folder, then type claude. Once started, the working directory of the whole session is locked to that folder. Claude can read any file under it, create new files in it, run scripts in it. It cannot see anything outside the folder unless you explicitly hand over a path, like /Users/han/Demonstration_Data/EmpiricalWiki/.",
    "This 'locked to a folder' property is called the working directory. It is the single biggest difference between Claude Code and a web chat tool.",
  ],
  treeHeader: "What the Patient Capital → ESG project folder looks like",
  treeCode: `~/papers/pc-esg/
├── CLAUDE.md                       ← project notes (protected term list, A2 primary measure)
├── checkpoint.md                   ← cross-session progress log
├── 01_文献/                        ← literature PDFs indexed by 8 frameworks
├── 02_变量字典/                    ← 测算方法说明.md, 变量对照表.xlsx
├── 03_原始数据/                    ← CSMAR + Huazheng ESG + myopia raw data
├── 04_中间数据/
│   ├── main_panel.dta              ← main panel: 26874 obs, 3608 firms
│   ├── csmar_panel.dta
│   └── 耐心资本_七合一_WZY.dta
├── 05_分析代码/
│   └── 耐心资本-全套代码.do        ← do0_setup → do10_robust
├── 06_结果输出/
│   ├── tables/                     ← Table 1–10 (RTF)
│   └── tables_tsv/                 ← Table 1–10 (CSV readable)
├── 07_论文写作/
│   ├── 01_主表/
│   └── 02_文献综述/
└── .git/                           ← git version history`,
  s2Header: "Why use a folder as the project boundary",
  s2Body: [
    "Keeping everything project-related under one folder means Claude Code only cares about the patient-capital → ESG paper for the duration of the session. It will not poke around in your other empirical projects, nor will it read your browser history. It is normal to have 3-4 empirical projects in parallel as a researcher; each lives in its own folder and gets its own Claude Code session.",
    "The folder boundary is also a natural isolation boundary. If one day you want to try a new PC measure (swap A2 for B1) without breaking the main regression, you do cp -r ~/papers/pc-esg ~/papers/pc-esg-experiment and launch Claude Code in the copy. The original project stays untouched.",
    "Git history belongs to this folder. Each commit captures the project's state at that moment. To go back to the state at the end of phase 1, git checkout takes you there. Claude Code integrates closely with git — it will suggest commits at logical breakpoints and can read git log to recall what changed.",
  ],
  s3Header: "What to put in the folder and what to leave out",
  s3Body: [
    "Put in: paper source (.tex / .docx), data (.dta, raw .xlsx, CSMAR zips), scripts (do / R / Python all fine), bibliography (.bib), the CLAUDE.md notes file, the checkpoint.md progress file, advisor meeting notes. These are part of the project; Claude needs them at hand.",
    "Leave out: very large intermediate artifacts (multi-GB Bootstrap permutation samples) — keep those outside the folder and reference them by absolute path. Do not put sensitive data (subject PII, unredacted micro-survey data) in plain form; encrypt or add to .gitignore. Do not dump unrelated files in — they pollute Claude's working context.",
    "Rule of thumb: if you are unsure, put it in. Claude does not auto-read every file; it only reads on demand when something in your instruction needs it. Extra files do not cost you context.",
  ],
  s4Header: "One-line summary of project mode",
  s4Body: [
    "A web chat tool is like a question kiosk: ask, get an answer, next time you arrive everything is gone. Claude Code is like a resident assistant living inside your Patient Capital → ESG folder: it sees the months of do0–do10 runs, the 12 ready tables, all the phase-1 and phase-2 Stata logs, knows the PC_A2 primary measure decision, knows KZ stands in for WW. The next time you launch Claude Code in the same folder, it picks up where you left off — through files, through git, through CLAUDE.md and checkpoint.md, not through its own memory.",
  ],
  trapsHeader: "Common beginner pitfalls",
  traps: [
    {
      title: "Launching in the wrong folder",
      desc: "Running claude inside ~/Downloads makes Claude Code treat ~/Downloads as the project root. Always cd into something like ~/papers/pc-esg first. Sanity check: after launch, type pwd and confirm the working directory is correct.",
    },
    {
      title: "Starting sessions on the desktop",
      desc: "Launching from the desktop or your home directory exposes Claude to a pile of unrelated files and it cannot tell which belong to the current task. Put each empirical project in its own clearly named folder; cd in before launching.",
    },
    {
      title: "Moving the project folder around",
      desc: "If the folder path changes, absolute paths hard-coded in CLAUDE.md and relative paths used by .do files may break. Commit current state with git before moving, and after moving, launch Claude Code to verify it can still read main_panel.dta and other key files.",
    },
  ],
};

export default async function ProjectModePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = locale === "zh" ? COPY_ZH : COPY_EN;

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="pt-6 sm:pt-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {c.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[var(--color-text-secondary)] sm:text-lg">
          {c.intro}
        </p>
      </section>

      <ProjectModeAnimation />

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{c.s1Header}</h2>
        <div className="flex flex-col gap-3">
          {c.s1Body.map((p, i) => (
            <p key={i} className="max-w-3xl text-base text-[var(--color-text-secondary)]">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold">{c.treeHeader}</h3>
        <pre className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {c.treeCode}
        </pre>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{c.s2Header}</h2>
        <div className="flex flex-col gap-3">
          {c.s2Body.map((p, i) => (
            <p key={i} className="max-w-3xl text-base text-[var(--color-text-secondary)]">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{c.s3Header}</h2>
        <div className="flex flex-col gap-3">
          {c.s3Body.map((p, i) => (
            <p key={i} className="max-w-3xl text-base text-[var(--color-text-secondary)]">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{c.s4Header}</h2>
        <div className="flex flex-col gap-3">
          {c.s4Body.map((p, i) => (
            <p key={i} className="max-w-3xl text-base text-[var(--color-text-secondary)]">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{c.trapsHeader}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.traps.map((t, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5"
            >
              <h3 className="text-base font-semibold">{t.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
