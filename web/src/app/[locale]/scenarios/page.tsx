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
    runningCase: "贯穿示例",
  },
  en: {
    title: "11 mechanisms",
    intro:
      "Every capability Claude Code uses in empirical research, explained in researcher-familiar language. Each section follows the same five-part structure: definition, mechanism, design reasoning, common pitfalls, knowledge map. Every example is anchored to one real empirical project — Patient Capital → Corporate ESG Performance.",
    runningCase: "Running example",
  },
} as const;

export default async function ScenariosIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = COPY[(locale === "zh" ? "zh" : "en") as keyof typeof COPY];
  const scenarios = listScenarios();

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

      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => {
            // The first phrase of runningExample before the comma is the concrete "step" tag.
            let runningTag: string | null = null;
            if (s.runningExample) {
              const splitIdx = s.runningExample.search(/[，,]/);
              const second = splitIdx > 0 ? s.runningExample.slice(splitIdx + 1).trim() : "";
              if (second) {
                // Take the first short clause (until next punctuation) for the chip.
                const cutoff = second.search(/[，,。.]/);
                runningTag = cutoff > 0 ? second.slice(0, cutoff).trim() : second.slice(0, 32).trim();
              }
            }
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
