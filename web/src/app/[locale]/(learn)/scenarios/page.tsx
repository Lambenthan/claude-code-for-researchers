import Link from "next/link";
import { listScenarios } from "@/lib/scenarios";

const locales = ["en", "zh"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const COPY = {
  zh: {
    title: "11 个工作机制",
    eyebrow: "案例叙事",
    intro:
      "Claude Code 在实证研究里的每一项能力，用研究者熟悉的话讲清楚它在做什么、为什么这样设计。每节按定义、工作机制、设计原因、容易踩的坑、知识地图五节展开。全部示例围绕贯穿案例'耐心资本对企业 ESG 表现的影响'展开。",
    timelineHeader: "按项目时间线读",
    timelineDesc:
      "下面把 11 个机制按耐心资本 → ESG 项目的实际推进阶段重排。从 phase 1 数据落地到 phase 2 因果识别再到投稿期，每个机制对应这条链路上的一个具体动作。点开任一节进入完整章节。",
    skipNote:
      "编号跳过 04：子会话机制按案例叙事归到第 10 节，对应 agents/s04，下面 phase 2 一栏的「子会话 · 8 种 PC 测度并行」就是它。",
    allHeader: "按编号读",
    allDesc: "如果你想按 Claude Code 工程顺序（机制依赖逐层叠加）阅读，下面是按编号排列的 11 张卡片。",
    runningCase: "贯穿示例",
    phases: [
      {
        title: "phase 1 · 数据落地",
        subtitle: "do0_setup → do6_baseline",
        slugs: ["03-advisor-revisions-todo", "01-cross-chapter-term-unification", "02-claude-picks-tools", "06-context-compact-third-chapter"],
      },
      {
        title: "phase 2 · 因果识别与稳健性",
        subtitle: "do7_iv_psm → do10_robust",
        slugs: ["07-task-system-persistent-revisions", "10-parallel-citation-audit", "08-background-latex-compile", "11-autonomous-night-claim"],
      },
      {
        title: "投稿期",
        subtitle: "同行模拟评审 / 多版本维护",
        slugs: ["09-peer-review-rehearsal", "12-worktree-multi-submission"],
      },
      {
        title: "贯穿全程",
        subtitle: "工作纪律",
        slugs: ["05-skill-auto-backup"],
      },
    ],
  },
  en: {
    title: "11 mechanisms",
    eyebrow: "Case narrative",
    intro:
      "Every capability Claude Code uses in empirical research, explained in researcher-familiar language. Each section follows the same five-part structure: definition, mechanism, design reasoning, common pitfalls, knowledge map. Every example is anchored to the running case — Patient Capital → Corporate ESG Performance.",
    timelineHeader: "Read by project timeline",
    timelineDesc:
      "Below the 11 mechanisms are regrouped along the running case's actual progression. From phase 1 (data landing) to phase 2 (causal identification) to submission, each mechanism marks a concrete step on that pipeline. Click any section for the full chapter.",
    skipNote:
      "Numbering skips 04: the subagent mechanism is grouped under chapter 10 (mapped to agents/s04). The 'Subagent · 8 PC measures in parallel' entry under phase 2 below is exactly that.",
    allHeader: "Read by mechanism number",
    allDesc: "If you prefer the Claude Code engineering order (mechanisms layered by dependency), here are all 11 cards by number.",
    runningCase: "Running example",
    phases: [
      {
        title: "phase 1 · data landing",
        subtitle: "do0_setup → do6_baseline",
        slugs: ["03-advisor-revisions-todo", "01-cross-chapter-term-unification", "02-claude-picks-tools", "06-context-compact-third-chapter"],
      },
      {
        title: "phase 2 · causal ID & robustness",
        subtitle: "do7_iv_psm → do10_robust",
        slugs: ["07-task-system-persistent-revisions", "10-parallel-citation-audit", "08-background-latex-compile", "11-autonomous-night-claim"],
      },
      {
        title: "submission period",
        subtitle: "mock review / multi-version maintenance",
        slugs: ["09-peer-review-rehearsal", "12-worktree-multi-submission"],
      },
      {
        title: "throughout",
        subtitle: "working discipline",
        slugs: ["05-skill-auto-backup"],
      },
    ],
  },
} as const;

function runningTagOf(runningExample: string | null): string | null {
  if (!runningExample) return null;
  const splitIdx = runningExample.search(/[，,]/);
  const second = splitIdx > 0 ? runningExample.slice(splitIdx + 1).trim() : "";
  if (!second) return null;
  const cutoff = second.search(/[，,。.]/);
  return cutoff > 0
    ? second.slice(0, cutoff).trim()
    : second.slice(0, 32).trim();
}

export default async function ScenariosIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = COPY[(locale === "zh" ? "zh" : "en") as keyof typeof COPY];
  const scenarios = listScenarios();
  const bySlug = new Map(scenarios.map((s) => [s.slug, s]));

  return (
    <div className="space-y-[var(--space-m)] pb-[var(--space-m)]">
      <header className="max-w-3xl pt-4">
        <p className="eyebrow">{c.eyebrow}</p>
        <h1 className="display mt-3 text-ink">{c.title}</h1>
        <p className="font-fluid-lede mt-5 max-w-2xl leading-[1.75] text-ink-muted">
          {c.intro}
        </p>
      </header>

      {/* Case-timeline view */}
      <section>
        <header className="max-w-3xl">
          <p className="eyebrow inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-cactus"
            />
            {c.timelineHeader}
          </p>
          <p className="font-fluid-body mt-3 max-w-2xl leading-[1.75] text-ink-muted">
            {c.timelineDesc}
          </p>
        </header>

        <div className="mt-8 space-y-8 border-t border-rule pt-7">
          {c.phases.map((phase, pi) => (
            <div key={pi}>
              <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-rule pb-2.5">
                <h3 className="font-serif text-[17px] text-ink">
                  {phase.title}
                </h3>
                <span
                  translate="no"
                  className="font-mono text-[11.5px] text-ink-subtle"
                >
                  {phase.subtitle}
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                {phase.slugs.map((slug) => {
                  const s = bySlug.get(slug);
                  if (!s) return null;
                  const tag = runningTagOf(s.runningExample);
                  return (
                    <li key={slug}>
                      <Link
                        href={`/${locale}/scenarios/${slug}`}
                        className="group block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
                      >
                        <div className="flex items-baseline gap-2">
                          <span
                            translate="no"
                            className="eyebrow-strong text-ember tabular-nums"
                          >
                            {s.number.padStart(2, "0")}
                          </span>
                          <h4 className="font-serif text-[15px] leading-snug text-ink transition-colors group-hover:text-ember">
                            {s.title}
                          </h4>
                        </div>
                        {tag && (
                          <p className="mt-1.5 line-clamp-1 text-[12px] text-ink-subtle">
                            {tag}
                          </p>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-7 border-l-2 border-ember bg-cream-surface px-4 py-3 text-[13px] leading-[1.7] text-ink-muted">
          {c.skipNote}
        </p>
      </section>

      {/* Numeric-order grid */}
      <section>
        <header className="max-w-3xl">
          <p className="eyebrow">{locale === "zh" ? "工程顺序" : "Engineering order"}</p>
          <h2 className="display mt-3 text-ink">{c.allHeader}</h2>
          <p className="font-fluid-body mt-4 max-w-2xl leading-[1.75] text-ink-muted">
            {c.allDesc}
          </p>
        </header>
        <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-7 border-t border-rule pt-7 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => {
            const runningTag = runningTagOf(s.runningExample);
            return (
              <li key={s.slug}>
                <Link
                  href={`/${locale}/scenarios/${s.slug}`}
                  className="group block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      translate="no"
                      className="eyebrow-strong text-ember"
                    >
                      s{s.number.padStart(2, "0")}
                    </span>
                    {runningTag && (
                      <span className="eyebrow truncate">
                        {c.runningCase} · {runningTag}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-serif text-[18px] leading-snug text-ink transition-colors group-hover:text-ember">
                    {s.title}
                  </h3>
                  {s.description && (
                    <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.75] text-ink-muted">
                      {s.description}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
