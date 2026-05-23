import ClaudeMdLoadingAnimation from "@/components/visualizations/claude-md-loading";

const locales = ["en", "zh"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Copy {
  title: string;
  intro: string;
  s1Header: string;
  s1Body: string[];
  s2Header: string;
  s2Body: string[];
  priorityHeader: string;
  priorityRows: { layer: string; path: string; effect: string }[];
  sampleHeader: string;
  sampleNote: string;
  sampleCode: string;
  s3Header: string;
  s3Body: string[];
  trapsHeader: string;
  traps: { title: string; desc: string }[];
}

const COPY_ZH: Copy = {
  title: "CLAUDE.md 是怎么工作的",
  intro:
    "CLAUDE.md 是你写给 Claude 的项目说明书。每次启动 Claude Code 在这个项目里都会自动加载这份文件，把里面的内容作为系统提示词的一部分，Claude 全程都看得到。论文项目里所有跨会话不能丢的约定都该写在这里。",
  s1Header: "为什么需要这份文件",
  s1Body: [
    "Claude 的对话历史在会话结束时就没了。今天你跟它说清楚术语锁定、文件结构、引用风格，明天打开新会话它就什么都不记得，要从头说一遍。",
    "CLAUDE.md 是把这种'每次都要说一遍的话'写一次定下来。每次启动会话，Claude Code 自动读取项目根目录下的 CLAUDE.md，把里面的所有内容塞进系统提示词。Claude 在这个项目的所有会话里都默认知道这些规则。",
    "更重要的：CLAUDE.md 不受对话历史压缩影响。后期对话太长触发自动压缩时，前段对话会被压成摘要，但 CLAUDE.md 永远完整。这意味着会话再长，里面定下来的规则也不会丢。关键的约定写进 CLAUDE.md 比写在对话里靠谱得多。",
  ],
  s2Header: "它的加载机制",
  s2Body: [
    "Claude Code 启动时按从根目录往上找的顺序，找所有路径上的 CLAUDE.md。比如你在 ~/papers/pc-esg/05_分析代码/ 启动，它会查 05_分析代码/CLAUDE.md、pc-esg/CLAUDE.md，然后到 ~/.claude/CLAUDE.md。找到的所有 CLAUDE.md 内容拼起来作为系统提示词。",
    "拼接顺序：用户全局级（~/.claude/CLAUDE.md）→ 上级目录 → 项目根 → 子目录。后加载的会覆盖前面同名的约定。项目级 CLAUDE.md 优先级高于用户全局级。",
    "层级机制让你能在不同层做不同的事。用户全局级写'我所有项目都用 Heiti TC 中文字体'；项目根级写'保护清单 14 词 + PC_A2 主测度 + 工作纪律 6 条'；子目录级写'05_分析代码 下的所有 .do 文件按 do0–do10 编号'。",
  ],
  priorityHeader: "优先级 + 加载顺序",
  priorityRows: [
    {
      layer: "用户全局级",
      path: "~/.claude/CLAUDE.md",
      effect: "所有项目共享的默认行为偏好。比如图字体规则、提交消息风格、个人偏好",
    },
    {
      layer: "项目根级",
      path: "~/papers/pc-esg/CLAUDE.md",
      effect: "这个实证项目专属的规则。保护清单 14 词、PC_A2 主测度、华证 ESG 0-1 标准化、工作纪律 6 条",
    },
    {
      layer: "子目录级",
      path: "~/papers/pc-esg/05_分析代码/CLAUDE.md",
      effect: "只对这个子目录生效的规则。比如所有 .do 文件按 do0–do10 编号，stata-mcp 跑前必须 cd 进本目录",
    },
  ],
  sampleHeader: "耐心资本 → ESG 项目的 CLAUDE.md 范本",
  sampleNote:
    "下面是这个实证项目实际在用的 CLAUDE.md（节选）。每条规则都是'你跟 Claude 协作时不想再重复说的话'，你可以直接套用为自己项目的模板。",
  sampleCode: `# CLAUDE.md

本文件为本项目的常驻上下文，每次会话由 Claude Code 自动加载。

## 一、研究方向

研究主题：耐心资本对企业 ESG 表现的影响及作用机制。
样本范围：中国沪深 A 股 2009–2023 年。
被解释变量主口径：华证 ESG 评级连续得分（0–1 标准化）。
核心解释变量主口径：A2（代飞 2025）= 稳定型股权 + 关系型债权。
机制变量主口径：MDA 版管理者短视主义（胡楠等 2021 词频法）。
融资约束变量：KZ 指数（项目无 WW 数据，用 KZ 替代，论文脚注披露）。

## 二、保护清单（禁止同义替换）

下列术语在所有文本输出中必须按原写法保留：
耐心资本 / 稳定型机构投资者 / 战略型机构投资者 / 交易型机构投资者 /
关系型债权 / 机构投资者异质性 / ESG 表现 / 漂绿 /
管理者短视主义 / 双元创新 / 新质生产力 / 全要素生产率 /
融资约束 / 两权分离率

## 三、写作纪律

- 学术中文，避免口语化（咱们 / 说白了 / 不难发现 等）
- 反 AI 腔：不用排比、空泛评价、列举式比喻、概括性升华
- 段落 4–8 句，不写空泛"小结段"
- 引用按 GB/T 7714，确定投稿后可改 APA / Chicago

## 四、工作纪律（强约束，AI 不得跳过）

1. 改文件前先确认方案——"改一下""整理一下"这类模糊指令，先说"改哪里、不改哪里"，待用户确认再动手
2. 改 .docx 前先 cp 创建带时间戳的备份
3. 跨文件改写或术语统一前先复读保护清单
4. 批量任务（≥ 30 条目）先在 3-5 个样本上试跑
5. 改动核心声明须先扫描全文联动位置，待用户确认
6. 交付前运行硬检查清单：术语 / 引用 / 数据 / 图表 / 交叉引用 / AIGC 自查

## 五、不要做的事

- 不要替我写正文段落或摘要
- 不要润色已写好的文字
- 不要批量修改 07_论文写作/ 下的文件，先生成审计报告，我决定后再动手
- 不要 commit 到 git——commit 我自己来`,
  s3Header: "怎么写 CLAUDE.md",
  s3Body: [
    "用直白的中文或英文写，像跟一个新来的研究助理交代规矩。避免抽象的指令（'按学术规范来'），具体写出来要求（'引用风格用 APA'）。",
    "写完后启动 Claude Code 测一下：随便给它一句涉及项目约定的指令，看它的回应是否反映出 CLAUDE.md 里的规则。如果它忘了某条规则，往往是规则写得太抽象——补一个具体例子。",
    "CLAUDE.md 随论文一起放进 git，让它跟项目其它内容一样有版本历史。换电脑、协作者克隆下来，CLAUDE.md 都跟着过去，新会话直接生效。",
  ],
  trapsHeader: "新手常见的几个坑",
  traps: [
    {
      title: "写得太长导致 Claude 抓不住重点",
      desc: "CLAUDE.md 控制在 200 行以内最好。超过这个量模型在系统提示词里要消化的内容就太多。把不那么关键的规则放进各章节自己的小 CLAUDE.md，主项目级保持精简。",
    },
    {
      title: "规则之间互相冲突没察觉",
      desc: '如果你在某段写"全文统一被解释变量"，又在另一段写"按导师习惯用因变量"，Claude 会随机选一个执行。每条规则定好后逐条检查跟前面有没有冲突。',
    },
    {
      title: "把临时记录写进 CLAUDE.md",
      desc: 'CLAUDE.md 是长期生效的规则，不是会话级笔记。临时记录（"今天讨论了 X、下周做 Y"）应该写进 notes/ 下的某个文件。CLAUDE.md 写满会话流水会让 Claude 误以为这些都是当下要遵循的规则。',
    },
    {
      title: "不更新过期规则",
      desc: "论文走到不同阶段规则会变。初稿阶段允许大改章节结构，定稿阶段就要锁定章节。规则过期了就改 CLAUDE.md，别留着旧规则让模型按陈旧的约定行事。",
    },
  ],
};

const COPY_EN: Copy = {
  title: "How CLAUDE.md Works",
  intro:
    "CLAUDE.md is the project instructions file you write for Claude. Every time you launch Claude Code in this project, the file is auto-loaded as part of the system prompt, and Claude sees its contents for the whole session. Anything about this paper that must not be lost across sessions belongs here.",
  s1Header: "Why you need this file",
  s1Body: [
    "Claude's conversation history disappears when the session ends. The terminology locks, file structure, citation style you set today are gone tomorrow — next session you'd have to spell them out again.",
    "CLAUDE.md is how you write that down once. On launch, Claude Code reads the project-root CLAUDE.md and injects its contents into the system prompt. Every session in this project starts with those rules in place.",
    "Even more important: CLAUDE.md is not affected by context compression. When a long session triggers auto-compact, the earlier conversation gets summarized away, but CLAUDE.md stays intact. The rules you put here survive any session length. Anchoring critical agreements in CLAUDE.md is far more reliable than keeping them in the conversation.",
  ],
  s2Header: "How it gets loaded",
  s2Body: [
    "On launch, Claude Code walks from the current directory up to root looking for every CLAUDE.md along the way. Starting in ~/papers/pc-esg/05_分析代码/, it picks up 05_分析代码/CLAUDE.md, pc-esg/CLAUDE.md, and ~/.claude/CLAUDE.md. All discovered CLAUDE.md files get stitched together into the system prompt.",
    "Stitch order: user global (~/.claude/CLAUDE.md) → parent dirs → project root → subdirs. Later-loaded rules override earlier rules with the same key. Project-level CLAUDE.md takes precedence over the user global one.",
    "The layering lets you separate concerns. User global: 'all my projects use Times New Roman for English'. Project root: '14-term protected list + A2 primary measure + 6 working-discipline rules'. Subdir: 'every .do file under 05_分析代码 is numbered do0–do10'.",
  ],
  priorityHeader: "Priority and load order",
  priorityRows: [
    {
      layer: "User global",
      path: "~/.claude/CLAUDE.md",
      effect: "Defaults shared across all your projects. Figure font rules, commit message style, personal preferences.",
    },
    {
      layer: "Project root",
      path: "~/papers/pc-esg/CLAUDE.md",
      effect: "Rules unique to this empirical project. 14-term protected list, PC_A2 primary measure, Huazheng ESG 0-1 normalization, 6 working-discipline rules.",
    },
    {
      layer: "Subdir",
      path: "~/papers/pc-esg/05_分析代码/CLAUDE.md",
      effect: "Rules that only apply to this subdir. Like 'all .do files are numbered do0–do10' or 'cd here before running stata-mcp'.",
    },
  ],
  sampleHeader: "Sample CLAUDE.md from the Patient Capital → ESG project",
  sampleNote:
    "Below is the actual CLAUDE.md (excerpted) used in the running example. Every rule is a thing 'you don't want to repeat to Claude every session.' You can copy this directly as a template.",
  sampleCode: `# CLAUDE.md

This file is the project's persistent context, auto-loaded by Claude Code at the start of each session.

## 1. Research direction

Topic: Patient Capital's effect on corporate ESG performance and its mechanisms.
Sample: Chinese A-share listed firms, 2009–2023.
Primary BeS: Huazheng ESG continuous score (0–1 normalized).
Primary PC measure: A2 (Daifei 2025) = stable equity + relationship debt.
Mechanism variable: MDA-version managerial myopia (Hu Nan et al. 2021 word-frequency).
Financing-constraint variable: KZ index (project has no WW data; uses KZ as substitute, disclosed in footnote).

## 2. Protected term list (no synonym substitution allowed)

The following terms must be preserved verbatim across all text output:
耐心资本 / 稳定型机构投资者 / 战略型机构投资者 / 交易型机构投资者 /
关系型债权 / 机构投资者异质性 / ESG 表现 / 漂绿 /
管理者短视主义 / 双元创新 / 新质生产力 / 全要素生产率 /
融资约束 / 两权分离率

## 3. Writing discipline

- Academic Chinese; avoid colloquialisms
- Anti-AI: no parallel structures, no empty evaluative phrases, no listing-style metaphors, no summary-style platitudes
- 4–8 sentences per paragraph; no empty wrap-up paragraphs
- Citations follow GB/T 7714; switch to APA/Chicago after target journal is fixed

## 4. Working discipline (hard constraint; AI may not skip)

1. State the plan before any edit — for vague instructions ("clean up", "tidy"), spell out "what changes / what stays" and wait for user approval
2. cp a timestamped backup before touching any .docx
3. Re-read the protected-term list before any cross-file rewrite
4. For batch tasks (≥ 30 items), pilot on 3–5 samples first
5. Before changing any core claim, scan the paper for all linked positions and confirm with user
6. Before handoff, run the hard checklist: terms / citations / data / figures / cross-refs / AIGC self-check

## 5. Do not

- Do not draft paper sections, abstracts, or body paragraphs for me
- Do not polish or rewrite text I have already written
- Do not bulk-edit 07_论文写作/; produce an audit report first, I decide before any edit
- Do not git commit on my behalf — I commit manually`,
  s3Header: "How to write a good CLAUDE.md",
  s3Body: [
    "Write it in plain English (or your working language), like you would brief a new research assistant on the rules of the project. Avoid abstract directives ('follow academic conventions'); write the concrete requirement ('citation style is APA').",
    "After writing, test it: launch Claude Code, give an instruction that touches one of the rules, and see if the response reflects what's in CLAUDE.md. When a rule is forgotten, it usually means the rule is too abstract — add a concrete example.",
    "Keep CLAUDE.md under git like the rest of the project. When you switch machines or hand the project off to a collaborator, CLAUDE.md travels with everything else and new sessions pick it up automatically.",
  ],
  trapsHeader: "Beginner traps",
  traps: [
    {
      title: "Too long, Claude loses the thread",
      desc: "Aim for under 200 lines. Beyond that, the system prompt gets bloated and the model has trouble prioritizing. Push less-critical rules into per-chapter mini-CLAUDE.md files; keep the project-root one lean.",
    },
    {
      title: "Conflicting rules that go unnoticed",
      desc: 'If one section says "always use outcome variable" and another says "match the advisor\'s style which is dependent variable", Claude will pick one at random. Cross-check each new rule against existing rules.',
    },
    {
      title: "Treating CLAUDE.md as a notebook",
      desc: 'CLAUDE.md is for long-lived rules, not session notes. Ad-hoc notes ("today we discussed X, next week do Y") belong in a file under notes/. Stuffing CLAUDE.md with session flow makes Claude think those notes are active rules.',
    },
    {
      title: "Not retiring stale rules",
      desc: "Rules change as the paper progresses. Draft phase allows structural changes; final phase locks the structure. When a rule expires, update CLAUDE.md; do not leave outdated rules around for the model to obey.",
    },
  ],
};

export default async function ClaudeMdPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = locale === "zh" ? COPY_ZH : COPY_EN;

  return (
    <div className="space-y-[var(--space-m)] pb-[var(--space-m)]">
      <header className="max-w-3xl pt-4">
        <p className="eyebrow">CLAUDE.md</p>
        <h1 className="display mt-3 text-ink">{c.title}</h1>
        <p className="font-fluid-lede mt-5 max-w-2xl leading-[1.75] text-ink-muted">
          {c.intro}
        </p>
      </header>

      <ClaudeMdLoadingAnimation />

      <Prose heading={c.s1Header} body={c.s1Body} />
      <Prose heading={c.s2Header} body={c.s2Body} />

      <section>
        <header className="max-w-3xl">
          <p className="eyebrow">{locale === "zh" ? "层次" : "Layering"}</p>
          <h2 className="display mt-3 text-ink">{c.priorityHeader}</h2>
        </header>
        <table className="mt-8 w-full border-collapse text-[13.5px]">
          <thead>
            <tr>
              <th className="eyebrow border-b border-rule-strong py-2 pr-4 text-left font-medium">
                {locale === "zh" ? "层级" : "Layer"}
              </th>
              <th className="eyebrow border-b border-rule-strong py-2 pr-4 text-left font-medium">
                {locale === "zh" ? "路径" : "Path"}
              </th>
              <th className="eyebrow border-b border-rule-strong py-2 text-left font-medium">
                {locale === "zh" ? "作用" : "Effect"}
              </th>
            </tr>
          </thead>
          <tbody>
            {c.priorityRows.map((row, i) => (
              <tr key={i}>
                <td className="border-b border-rule py-3 pr-4 align-top font-medium text-ink">
                  {row.layer}
                </td>
                <td
                  translate="no"
                  className="border-b border-rule py-3 pr-4 align-top font-mono text-[12px] text-ink-muted"
                >
                  {row.path}
                </td>
                <td className="border-b border-rule py-3 align-top text-ink-muted">
                  {row.effect}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <header className="max-w-3xl">
          <p className="eyebrow">{locale === "zh" ? "实例" : "Sample"}</p>
          <h2 className="display mt-3 text-ink">{c.sampleHeader}</h2>
          <p className="font-fluid-body mt-4 max-w-2xl leading-[1.75] text-ink-muted">
            {c.sampleNote}
          </p>
        </header>
        <pre
          translate="no"
          className="mt-6 overflow-x-auto border border-[var(--color-code-border)] bg-[var(--color-code-bg)] p-5 font-mono text-[12px] leading-relaxed text-[var(--color-code-text)]"
        >
          {c.sampleCode}
        </pre>
      </section>

      <Prose heading={c.s3Header} body={c.s3Body} />

      <section>
        <header className="max-w-3xl">
          <p className="eyebrow">{locale === "zh" ? "常见的坑" : "Pitfalls"}</p>
          <h2 className="display mt-3 text-ink">{c.trapsHeader}</h2>
        </header>
        <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-rule pt-7 sm:grid-cols-2">
          {c.traps.map((trap, i) => (
            <li key={i} className="border-l-2 border-ember/60 pl-4">
              <h3 className="font-serif text-[17px] leading-snug text-ink">
                {trap.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.75] text-ink-muted">
                {trap.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Prose({ heading, body }: { heading: string; body: string[] }) {
  return (
    <section>
      <h2 className="display text-ink" style={{ fontSize: "var(--type-h2)" }}>
        {heading}
      </h2>
      <div className="mt-5 space-y-4">
        {body.map((p, i) => (
          <p
            key={i}
            className="font-fluid-body max-w-3xl leading-[1.85] text-ink"
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
