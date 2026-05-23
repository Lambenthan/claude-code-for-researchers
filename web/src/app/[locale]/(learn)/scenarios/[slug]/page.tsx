import Link from "next/link";
import { notFound } from "next/navigation";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { listScenarios, getScenario } from "@/lib/scenarios";

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

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function postProcess(html: string, locale: string): string {
  html = html.replace(
    /<pre><code class="hljs language-(\w+)">/g,
    '<pre class="code-block" data-language="$1"><code class="hljs language-$1">',
  );
  html = html.replace(
    /<pre><code(?! class="hljs)([^>]*)>/g,
    '<pre class="ascii-diagram"><code$1>',
  );
  html = html.replace(/<h1>.*?<\/h1>\n?/, "");

  html = html.replace(
    /href="\.\.\/\.\.\/agents\/s(\d+)_[^"]+\.py"/g,
    `href="${BASE_PATH}/${locale}/s$1"`,
  );

  return html;
}

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
      ? {
          back: "返回机制列表",
          example: "本节贯穿示例",
          project: "研究项目",
          whatHappens: "在这一节里做的事",
          prev: "上一节",
          next: "下一节",
        }
      : {
          back: "Back to mechanism list",
          example: "Running example",
          project: "Research project",
          whatHappens: "What happens in this section",
          prev: "Previous",
          next: "Next",
        };

  const all = listScenarios();
  const idx = all.findIndex((s) => s.slug === slug);
  const prevScenario = idx > 0 ? all[idx - 1] : null;
  const nextScenario =
    idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  const bodyMd = scenario.runningExample
    ? stripRunningExampleBlockquote(scenario.content)
    : scenario.content;
  const html = postProcess(renderMarkdown(bodyMd), locale);

  let exampleProject = "";
  let exampleRest = "";
  if (scenario.runningExample) {
    const splitIdx = scenario.runningExample.search(/[，,]/);
    exampleProject =
      splitIdx > 0
        ? scenario.runningExample.slice(0, splitIdx).trim()
        : scenario.runningExample;
    exampleRest =
      splitIdx > 0
        ? scenario.runningExample.slice(splitIdx + 1).trim()
        : "";
  }

  return (
    <div className="mx-auto max-w-3xl space-y-9 pb-[var(--space-m)]">
      <nav>
        <Link
          href={`/${locale}/scenarios`}
          className="eyebrow inline-flex items-center gap-1.5 transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span>
          {labels.back}
        </Link>
      </nav>

      <header className="space-y-3">
        <p className="eyebrow inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-cactus"
          />
          {locale === "zh" ? "第" : "Mechanism"}{" "}
          <span translate="no" className="tabular-nums">
            {scenario.number.padStart(2, "0")}
          </span>{" "}
          {locale === "zh" ? "节" : ""}
        </p>
        <h1 className="display text-ink">{scenario.title}</h1>
      </header>

      {scenario.runningExample && (
        <aside className="border-l-2 border-cactus bg-cream-surface px-5 py-5">
          <p className="eyebrow inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-cactus"
            />
            {labels.example}
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <p className="eyebrow text-ink-subtle">{labels.project}</p>
              <p className="mt-1 font-serif text-[16px] leading-snug text-ink">
                {exampleProject}
              </p>
            </div>
            {exampleRest && (
              <div>
                <p className="eyebrow text-ink-subtle">{labels.whatHappens}</p>
                <p className="mt-1 font-fluid-body leading-[1.8] text-ink">
                  {exampleRest}
                </p>
              </div>
            )}
          </div>
        </aside>
      )}

      <article>
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      {(prevScenario || nextScenario) && (
        <nav className="grid grid-cols-1 gap-4 border-t border-rule pt-7 sm:grid-cols-2">
          {prevScenario ? (
            <Link
              href={`/${locale}/scenarios/${prevScenario.slug}`}
              className="group flex flex-col gap-1 rounded text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
            >
              <span className="eyebrow inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:-translate-x-1"
                >
                  ←
                </span>
                {labels.prev}
              </span>
              <span className="font-serif text-[16px] text-ink transition-colors group-hover:text-ember">
                <span
                  translate="no"
                  className="tabular-nums text-ink-subtle"
                >
                  {prevScenario.number.padStart(2, "0")}
                </span>{" "}
                · {prevScenario.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {nextScenario ? (
            <Link
              href={`/${locale}/scenarios/${nextScenario.slug}`}
              className="group flex flex-col gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember sm:items-end sm:text-right"
            >
              <span className="eyebrow inline-flex items-center gap-1.5">
                {labels.next}
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
              <span className="font-serif text-[16px] text-ink transition-colors group-hover:text-ember">
                <span
                  translate="no"
                  className="tabular-nums text-ink-subtle"
                >
                  {nextScenario.number.padStart(2, "0")}
                </span>{" "}
                · {nextScenario.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
