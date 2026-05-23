import Link from "next/link";
import { VERSION_META, LAYERS } from "@/lib/constants";
import { LayerBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MessageFlow } from "@/components/architecture/message-flow";
import { listScenarios } from "@/lib/scenarios";
import enMessages from "@/i18n/messages/en.json";
import zhMessages from "@/i18n/messages/zh.json";

const locales = ["en", "zh"] as const;
const messagesByLocale = {
  en: enMessages,
  zh: zhMessages,
} as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const LAYER_BAR_COLORS: Record<string, string> = {
  tools: "bg-cloud",
  planning: "bg-cactus",
  memory: "bg-heather",
  concurrency: "bg-coral",
  collaboration: "bg-fig",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages =
    messagesByLocale[locale as keyof typeof messagesByLocale] ?? enMessages;
  const t = (key: keyof typeof messages.home): string => {
    const v = (messages.home as Record<string, unknown>)[key];
    return typeof v === "string" ? v : String(key);
  };
  const tLayer = (key: keyof typeof messages.layers): string => {
    return (messages.layers as Record<string, string>)[key] ?? key;
  };

  const scenarios = listScenarios();
  const casePillars = (messages.home as Record<string, unknown>).case_pillars as
    | [string, string][]
    | undefined;
  const runningLabel = locale === "zh" ? "贯穿示例" : "Running example";

  return (
    <div className="space-y-[var(--space-m)] pb-[var(--space-m)]">
      {/* Hero ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl pt-[var(--space-s)] text-center">
        <p className="eyebrow inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-ember"
          />
          {t("hero_audience")}
        </p>
        <h1 className="display display-xl mt-6 text-ink">
          {t("hero_title")}
        </h1>
        <p className="font-fluid-lede mx-auto mt-7 max-w-2xl text-pretty leading-[1.7] text-ink-muted">
          {t("hero_subtitle")}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/scenarios`}
            className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[13px] font-medium text-cream transition-colors hover:border-ember hover:bg-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            <span>{t("start")}</span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={`/${locale}/timeline`}
            className="inline-flex items-center gap-2 rounded-full border border-rule-strong px-6 py-3 text-[13px] text-ink-muted transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            {t("start_secondary")}
          </Link>
        </div>
      </section>

      {/* Running case spotlight ───────────────────────────────────── */}
      <section>
        <div className="relative border-l-2 border-cactus bg-cream-surface px-6 py-7 sm:px-10 sm:py-9">
          <p className="eyebrow inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-cactus"
            />
            {t("case_label" as keyof typeof messages.home)}
          </p>
          <h2 className="display mt-4 text-ink">
            {t("case_title" as keyof typeof messages.home)}
          </h2>
          <p
            translate="no"
            className="mt-3 font-mono text-[12.5px] text-ink-subtle"
          >
            {t("case_subtitle" as keyof typeof messages.home)}
          </p>
          <p className="font-fluid-body mt-5 max-w-3xl leading-[1.85] text-ink">
            {t("case_body" as keyof typeof messages.home)}
          </p>
          {casePillars && (
            <dl className="mt-7 grid grid-cols-1 gap-x-10 gap-y-5 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-4">
              {casePillars.map(([label, value]) => (
                <div key={label}>
                  <dt className="eyebrow">{label}</dt>
                  <dd className="mt-1.5 text-[14px] leading-snug text-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* 11 Mechanisms ─────────────────────────────────────────────── */}
      <section>
        <header className="mb-9 max-w-3xl">
          <p className="eyebrow">{locale === "zh" ? "11 个机制" : "11 Mechanisms"}</p>
          <h2 className="display mt-3 text-ink">{t("scenarios_title")}</h2>
          <p className="font-fluid-body mt-4 max-w-2xl leading-[1.75] text-ink-muted">
            {t("scenarios_desc")}
          </p>
        </header>
        <ul className="grid grid-cols-1 gap-x-10 gap-y-7 border-t border-rule pt-7 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((s) => {
            let runningTag: string | null = null;
            if (s.runningExample) {
              const splitIdx = s.runningExample.search(/[，,]/);
              const second =
                splitIdx > 0 ? s.runningExample.slice(splitIdx + 1).trim() : "";
              if (second) {
                const cutoff = second.search(/[，,。.]/);
                runningTag =
                  cutoff > 0
                    ? second.slice(0, cutoff).trim()
                    : second.slice(0, 32).trim();
              }
            }
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
                        {runningLabel} · {runningTag}
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
        <div className="mt-8 border-t border-rule pt-5">
          <Link
            href={`/${locale}/scenarios`}
            className="eyebrow inline-flex items-center gap-1.5 text-ember transition-colors hover:text-ink"
          >
            {t("scenarios_see_all")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Core Pattern ────────────────────────────────────────────── */}
      <section>
        <header className="mb-8 max-w-3xl">
          <p className="eyebrow">{locale === "zh" ? "核心模式" : "Core Pattern"}</p>
          <h2 className="display mt-3 text-ink">{t("core_pattern")}</h2>
          <p className="font-fluid-body mt-4 max-w-2xl leading-[1.75] text-ink-muted">
            {t("core_pattern_desc")}
          </p>
        </header>
        <div className="mx-auto max-w-2xl overflow-hidden rounded-md border border-[var(--color-code-border)] bg-[var(--color-code-bg)]">
          <div className="flex items-baseline justify-between border-b border-[var(--color-code-border)] px-4 py-2.5">
            <span
              translate="no"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-code-mute)]"
            >
              agent_loop.py
            </span>
            <span className="eyebrow text-[var(--color-code-mute)]">python</span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.7]">
            <code>
              <span className="text-[#d4b3e8]">while</span>
              <span className="text-[var(--color-code-text)]"> </span>
              <span className="text-[var(--color-ember-soft)]">True</span>
              <span className="text-[var(--color-code-mute)]">:</span>
              {"\n"}
              <span className="text-[var(--color-code-text)]">{"    "}response = client.messages.</span>
              <span className="text-[#d6a3b8]">create</span>
              <span className="text-[var(--color-code-mute)]">(</span>
              <span className="text-[var(--color-code-text)]">messages=messages, tools=tools</span>
              <span className="text-[var(--color-code-mute)]">)</span>
              {"\n"}
              <span className="text-[#d4b3e8]">{"    "}if</span>
              <span className="text-[var(--color-code-text)]"> response.stop_reason != </span>
              <span className="text-[#a8d0bf]">&quot;tool_use&quot;</span>
              <span className="text-[var(--color-code-mute)]">:</span>
              {"\n"}
              <span className="text-[#d4b3e8]">{"        "}break</span>
              {"\n"}
              <span className="text-[#d4b3e8]">{"    "}for</span>
              <span className="text-[var(--color-code-text)]"> tool_call </span>
              <span className="text-[#d4b3e8]">in</span>
              <span className="text-[var(--color-code-text)]"> response.content</span>
              <span className="text-[var(--color-code-mute)]">:</span>
              {"\n"}
              <span className="text-[var(--color-code-text)]">{"        "}result = </span>
              <span className="text-[#d6a3b8]">execute_tool</span>
              <span className="text-[var(--color-code-mute)]">(</span>
              <span className="text-[var(--color-code-text)]">tool_call.name, tool_call.input</span>
              <span className="text-[var(--color-code-mute)]">)</span>
              {"\n"}
              <span className="text-[var(--color-code-text)]">{"        "}messages.</span>
              <span className="text-[#d6a3b8]">append</span>
              <span className="text-[var(--color-code-mute)]">(</span>
              <span className="text-[var(--color-code-text)]">result</span>
              <span className="text-[var(--color-code-mute)]">)</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Message Flow ────────────────────────────────────────────── */}
      <section>
        <header className="mb-8 max-w-3xl">
          <p className="eyebrow">{locale === "zh" ? "消息流" : "Message Flow"}</p>
          <h2 className="display mt-3 text-ink">{t("message_flow")}</h2>
          <p className="font-fluid-body mt-4 max-w-2xl leading-[1.75] text-ink-muted">
            {t("message_flow_desc")}
          </p>
        </header>
        <div className="mx-auto max-w-2xl">
          <MessageFlow />
        </div>
      </section>

      {/* Layers ──────────────────────────────────────────────────── */}
      <section>
        <header className="mb-8 max-w-3xl">
          <p className="eyebrow">{locale === "zh" ? "12 项能力" : "12 Capabilities"}</p>
          <h2 className="display mt-3 text-ink">{t("layers_title")}</h2>
          <p className="font-fluid-body mt-4 max-w-2xl leading-[1.75] text-ink-muted">
            {t("layers_desc")}
          </p>
        </header>
        <ul className="space-y-5 border-t border-rule pt-7">
          {LAYERS.map((layer) => (
            <li
              key={layer.id}
              className="grid grid-cols-[3px_1fr] gap-x-6 border-b border-rule pb-5"
            >
              <span
                aria-hidden="true"
                className={cn("self-stretch", LAYER_BAR_COLORS[layer.id])}
              />
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-serif text-[18px] text-ink">
                    {layer.label}
                  </h3>
                  <span className="eyebrow">
                    {layer.versions.length} {t("versions_in_layer")}
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-[13.5px] leading-[1.7] text-ink-muted">
                  {tLayer(layer.id as keyof typeof messages.layers)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {layer.versions.map((vid) => {
                    const meta = VERSION_META[vid];
                    return (
                      <Link key={vid} href={`/${locale}/${vid}`}>
                        <LayerBadge
                          layer={layer.id}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                        >
                          <span translate="no">{vid}</span>: {meta?.title}
                        </LayerBadge>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
