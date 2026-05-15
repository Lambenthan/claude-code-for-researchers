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
  tools: "bg-blue-500",
  planning: "bg-emerald-500",
  memory: "bg-purple-500",
  concurrency: "bg-amber-500",
  collaboration: "bg-red-500",
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

  return (
    <div className="flex flex-col gap-20 pb-16">
      {/* Hero */}
      <section className="flex flex-col items-center px-2 pt-8 text-center sm:pt-16">
        <p className="mb-3 inline-block rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
          {t("hero_audience")}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {t("hero_title")}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[var(--color-text-secondary)] sm:text-xl">
          {t("hero_subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/scenarios`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t("start")}
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link
            href={`/${locale}/timeline`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[var(--color-border)] px-6 py-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {t("start_secondary")}
          </Link>
        </div>
      </section>

      {/* Running case spotlight */}
      <section>
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 p-6 sm:p-8 dark:border-emerald-900/50 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-teal-950/30">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-700/20" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-700/20" />
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 backdrop-blur dark:border-emerald-700/50 dark:bg-zinc-900/60 dark:text-emerald-300">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t("case_label" as keyof typeof messages.home)}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-emerald-950 sm:text-2xl lg:text-3xl dark:text-emerald-50">
              {t("case_title" as keyof typeof messages.home)}
            </h2>
            <p className="mt-2 font-mono text-xs text-emerald-700/80 sm:text-sm dark:text-emerald-300/80">
              {t("case_subtitle" as keyof typeof messages.home)}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-emerald-900/90 sm:text-base dark:text-emerald-100/90">
              {t("case_body" as keyof typeof messages.home)}
            </p>
            {casePillars && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {casePillars.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-emerald-200/70 bg-white/80 px-3 py-2.5 backdrop-blur-sm dark:border-emerald-800/40 dark:bg-zinc-900/60"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70">
                      {label}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-emerald-900 dark:text-emerald-100">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 11 Mechanisms (scenarios) */}
      <section>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t("scenarios_title")}
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-[var(--color-text-secondary)] sm:text-base">
            {t("scenarios_desc")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((s) => {
            let runningTag: string | null = null;
            if (s.runningExample) {
              const splitIdx = s.runningExample.search(/[，,]/);
              const second = splitIdx > 0 ? s.runningExample.slice(splitIdx + 1).trim() : "";
              if (second) {
                const cutoff = second.search(/[，,。.]/);
                runningTag = cutoff > 0 ? second.slice(0, cutoff).trim() : second.slice(0, 32).trim();
              }
            }
            const runningLabel = locale === "zh" ? "贯穿示例" : "Running example";
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
                    <span className="inline-flex max-w-[60%] items-center truncate rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <span className="hidden sm:inline">{runningLabel} · </span>
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
        <div className="mt-6 text-center">
          <Link
            href={`/${locale}/scenarios`}
            className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:underline"
          >
            {t("scenarios_see_all")} →
          </Link>
        </div>
      </section>

      {/* Core Pattern */}
      <section>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("core_pattern")}</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-[var(--color-text-secondary)] sm:text-base">
            {t("core_pattern_desc")}
          </p>
        </div>
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <span className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-zinc-500">agent_loop.py</span>
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
            <code>
              <span className="text-purple-400">while</span>
              <span className="text-zinc-300"> </span>
              <span className="text-orange-300">True</span>
              <span className="text-zinc-500">:</span>
              {"\n"}
              <span className="text-zinc-300">{"    "}response = client.messages.</span>
              <span className="text-blue-400">create</span>
              <span className="text-zinc-500">(</span>
              <span className="text-zinc-300">messages=messages, tools=tools</span>
              <span className="text-zinc-500">)</span>
              {"\n"}
              <span className="text-purple-400">{"    "}if</span>
              <span className="text-zinc-300"> response.stop_reason != </span>
              <span className="text-green-400">&quot;tool_use&quot;</span>
              <span className="text-zinc-500">:</span>
              {"\n"}
              <span className="text-purple-400">{"        "}break</span>
              {"\n"}
              <span className="text-purple-400">{"    "}for</span>
              <span className="text-zinc-300"> tool_call </span>
              <span className="text-purple-400">in</span>
              <span className="text-zinc-300"> response.content</span>
              <span className="text-zinc-500">:</span>
              {"\n"}
              <span className="text-zinc-300">{"        "}result = </span>
              <span className="text-blue-400">execute_tool</span>
              <span className="text-zinc-500">(</span>
              <span className="text-zinc-300">tool_call.name, tool_call.input</span>
              <span className="text-zinc-500">)</span>
              {"\n"}
              <span className="text-zinc-300">{"        "}messages.</span>
              <span className="text-blue-400">append</span>
              <span className="text-zinc-500">(</span>
              <span className="text-zinc-300">result</span>
              <span className="text-zinc-500">)</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Message Flow */}
      <section>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("message_flow")}</h2>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            {t("message_flow_desc")}
          </p>
        </div>
        <div className="mx-auto max-w-2xl">
          <MessageFlow />
        </div>
      </section>

      {/* Layers */}
      <section>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{t("layers_title")}</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-[var(--color-text-secondary)] sm:text-base">
            {t("layers_desc")}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {LAYERS.map((layer) => (
            <div
              key={layer.id}
              className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
            >
              <div
                className={cn(
                  "h-full w-1.5 self-stretch rounded-full",
                  LAYER_BAR_COLORS[layer.id],
                )}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{layer.label}</h3>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {layer.versions.length} {t("versions_in_layer")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {tLayer(layer.id as keyof typeof messages.layers)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {layer.versions.map((vid) => {
                    const meta = VERSION_META[vid];
                    return (
                      <Link key={vid} href={`/${locale}/${vid}`}>
                        <LayerBadge
                          layer={layer.id}
                          className="cursor-pointer transition-opacity hover:opacity-80"
                        >
                          {vid}: {meta?.title}
                        </LayerBadge>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
