import Link from "next/link";
import { listScenarios } from "@/lib/scenarios";

const locales = ["en", "zh"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const COPY = {
  zh: {
    title: "11 个工作机制",
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
  return cutoff > 0 ? second.slice(0, cutoff).trim() : second.slice(0, 32).trim();
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
    <div className="flex flex-col gap-10 pb-16">
      <section className="pt-6 sm:pt-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {c.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[var(--color-text-secondary)] sm:text-lg">
          {c.intro}
        </p>
      </section>

      {/* Case-timeline view */}
      <section className="flex flex-col gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {c.timelineHeader}
          </div>
          <p className="max-w-3xl text-sm text-[var(--color-text-secondary)]">
            {c.timelineDesc}
          </p>
        </div>

        <div className="space-y-5">
          {c.phases.map((phase, pi) => (
            <div key={pi} className="rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 to-white p-4 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-zinc-900">
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-emerald-200/60 pb-2 dark:border-emerald-900/30">
                <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  {phase.title}
                </div>
                <div className="font-mono text-[11px] text-emerald-700/70 dark:text-emerald-300/70">
                  {phase.subtitle}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {phase.slugs.map((slug) => {
                  const s = bySlug.get(slug);
                  if (!s) return null;
                  const tag = runningTagOf(s.runningExample);
                  return (
                    <Link
                      key={slug}
                      href={`/${locale}/scenarios/${slug}`}
                      className="group flex h-full flex-col gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 transition-all hover:border-emerald-400 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-emerald-600"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-100 px-1.5 py-px font-mono text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {s.number.padStart(2, "0")}
                        </span>
                        <span className="truncate text-sm font-medium group-hover:underline">
                          {s.title}
                        </span>
                      </div>
                      {tag && (
                        <span className="line-clamp-1 text-[11px] text-[var(--color-text-secondary)]">
                          {tag}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="rounded-md border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          {c.skipNote}
        </p>
      </section>

      {/* Numeric-order grid */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{c.allHeader}</h2>
          <p className="mt-1 max-w-3xl text-sm text-[var(--color-text-secondary)]">
            {c.allDesc}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => {
            const runningTag = runningTagOf(s.runningExample);
            return (
              <Link
                key={s.slug}
                href={`/${locale}/scenarios/${s.slug}`}
                className="group flex h-full flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-all hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-sm dark:hover:border-zinc-600"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-zinc-900 px-2 py-0.5 font-mono text-xs text-white dark:bg-white dark:text-zinc-900">
                    s{s.number.padStart(2, "0")}
                  </span>
                  {runningTag && (
                    <span className="inline-flex items-center gap-1 truncate rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <span className="hidden sm:inline">{c.runningCase} · </span>
                      <span className="truncate">{runningTag}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold tracking-tight group-hover:underline">
                  {s.title}
                </h3>
                {s.description && (
                  <p className="line-clamp-4 text-xs text-[var(--color-text-secondary)] sm:text-sm">
                    {s.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
