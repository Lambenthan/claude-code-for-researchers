import Link from "next/link";
import { notFound } from "next/navigation";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { listScenarios, getScenario, getReplay } from "@/lib/scenarios";
import { ReplayPlayer, type ReplayLabels } from "@/components/scenarios/replay-player";

const locales = ["en", "zh"];

export function generateStaticParams() {
  const scenarios = listScenarios();
  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of locales) {
    for (const s of scenarios) {
      params.push({ locale, slug: s.slug });
    }
  }
  return params;
}

function renderMarkdown(md: string): string {
  const result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHighlight, { detect: false, ignoreMissing: true })
    .use(rehypeStringify)
    .processSync(md);
  return String(result);
}

// Read at build time so the rewritten <a> hrefs honor basePath on GitHub Pages
// (and stay empty in local dev).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function postProcess(html: string, locale: string): string {
  html = html.replace(
    /<pre><code class="hljs language-(\w+)">/g,
    '<pre class="code-block" data-language="$1"><code class="hljs language-$1">'
  );
  html = html.replace(
    /<pre><code(?! class="hljs)([^>]*)>/g,
    '<pre class="ascii-diagram"><code$1>'
  );
  html = html.replace(/<h1>.*?<\/h1>\n?/, "");

  // Rewrite relative Python file links to the existing /[locale]/sNN learn route.
  // Prepend basePath so the link works under GitHub Pages' project subpath.
  html = html.replace(
    /href="\.\.\/\.\.\/agents\/s(\d+)_[^"]+\.py"/g,
    `href="${BASE_PATH}/${locale}/s$1"`
  );

  return html;
}

/** Strip the `> 本节贯穿示例：...` blockquote from the markdown so it does not render twice. */
function stripRunningExampleBlockquote(md: string): string {
  return md.replace(/\n>\s*本节贯穿示例[：:][\s\S]*?(?=\n\n(?!>)|\n---)/, "");
}

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const scenario = getScenario(slug);
  if (!scenario) notFound();

  const labels =
    locale === "zh"
      ? { back: "← 返回机制列表", example: "本节贯穿示例", project: "研究项目", whatHappens: "在这一节里做的事", prev: "上一节", next: "下一节" }
      : { back: "← Back to mechanism list", example: "Running example", project: "Research project", whatHappens: "What happens in this section", prev: "Previous", next: "Next" };

  const replayLabels: ReplayLabels =
    locale === "zh"
      ? {
          title: "真实运行回放",
          subtitle: "按播放或单步推进，看 Claude Code 在这一节里逐轮做的事",
          reset: "重置到第一步",
          prev: "上一步",
          next: "下一步",
          play: "自动播放",
          pause: "暂停",
          speed: "速度",
          step: "步",
          roleUser: "user",
          roleAssistant: "assistant",
          roleToolUse: "tool 调用",
          roleToolResult: "tool 结果",
          roleThinking: "thinking",
          roleNote: "旁白",
          roleStop: "stop",
        }
      : {
          title: "Real-run replay",
          subtitle:
            "Play or step through what Claude Code did, turn by turn, in this scenario",
          reset: "Reset to first step",
          prev: "Previous step",
          next: "Next step",
          play: "Auto play",
          pause: "Pause",
          speed: "Speed",
          step: "Step",
          roleUser: "user",
          roleAssistant: "assistant",
          roleToolUse: "tool call",
          roleToolResult: "tool result",
          roleThinking: "thinking",
          roleNote: "note",
          roleStop: "stop",
        };

  const replay = getReplay(slug);

  // Prev/Next neighbors in the scenario sequence (sorted by number, skipping 04).
  const all = listScenarios();
  const idx = all.findIndex((s) => s.slug === slug);
  const prevScenario = idx > 0 ? all[idx - 1] : null;
  const nextScenario = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  // Render the running-example callout once at the top, then strip its blockquote from the body
  // so it does not appear a second time as a default blockquote.
  const bodyMd = scenario.runningExample
    ? stripRunningExampleBlockquote(scenario.content)
    : scenario.content;
  const html = postProcess(renderMarkdown(bodyMd), locale);

  let exampleProject = "";
  let exampleRest = "";
  if (scenario.runningExample) {
    const splitIdx = scenario.runningExample.search(/[，,]/);
    exampleProject = splitIdx > 0 ? scenario.runningExample.slice(0, splitIdx).trim() : scenario.runningExample;
    exampleRest = splitIdx > 0 ? scenario.runningExample.slice(splitIdx + 1).trim() : "";
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <nav className="text-xs text-[var(--color-text-secondary)]">
        <Link href={`/${locale}/scenarios`} className="hover:underline">
          {labels.back}
        </Link>
      </nav>

      {scenario.runningExample && (
        <aside className="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/20">
          <div className="flex items-center gap-2 border-b border-emerald-200/70 px-5 py-2.5 dark:border-emerald-900/40">
            <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              {labels.example}
            </span>
          </div>
          <div className="space-y-3 px-5 py-4">
            <div>
              <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70">
                {labels.project}
              </div>
              <div className="font-medium text-emerald-900 dark:text-emerald-100">
                {exampleProject}
              </div>
            </div>
            {exampleRest && (
              <div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70">
                  {labels.whatHappens}
                </div>
                <p className="text-sm leading-relaxed text-emerald-900/90 dark:text-emerald-100/90">
                  {exampleRest}
                </p>
              </div>
            )}
          </div>
        </aside>
      )}

      {replay && (
        <ReplayPlayer steps={replay.steps} labels={replayLabels} />
      )}

      <article>
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      {/* Prev/Next nav */}
      {(prevScenario || nextScenario) && (
        <nav className="mt-8 grid grid-cols-1 gap-3 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2">
          {prevScenario ? (
            <Link
              href={`/${locale}/scenarios/${prevScenario.slug}`}
              className="group flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                ← {labels.prev}
              </span>
              <span className="text-sm font-medium group-hover:underline">
                {prevScenario.number.padStart(2, "0")} · {prevScenario.title}
              </span>
            </Link>
          ) : <div />}
          {nextScenario ? (
            <Link
              href={`/${locale}/scenarios/${nextScenario.slug}`}
              className="group flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-right transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                {labels.next} →
              </span>
              <span className="text-sm font-medium group-hover:underline">
                {nextScenario.number.padStart(2, "0")} · {nextScenario.title}
              </span>
            </Link>
          ) : <div />}
        </nav>
      )}
    </div>
  );
}
