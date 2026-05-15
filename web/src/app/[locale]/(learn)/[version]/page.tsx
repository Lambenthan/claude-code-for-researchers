import Link from "next/link";
import { LEARNING_PATH, VERSION_META, LAYERS } from "@/lib/constants";
import { LayerBadge } from "@/components/ui/badge";
import versionsData from "@/data/generated/versions.json";
import { VersionDetailClient } from "./client";
import { getTranslations } from "@/lib/i18n-server";
import { getScenarioByVersion } from "@/lib/scenarios";

export function generateStaticParams() {
  return LEARNING_PATH.map((version) => ({ version }));
}

export default async function VersionPage({
  params,
}: {
  params: Promise<{ locale: string; version: string }>;
}) {
  const { locale, version } = await params;

  const versionData = versionsData.versions.find((v) => v.id === version);
  const meta = VERSION_META[version];
  const diff = versionsData.diffs.find((d) => d.to === version) ?? null;

  if (!versionData || !meta) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Version not found</h1>
        <p className="mt-2 text-zinc-500">{version}</p>
      </div>
    );
  }

  const t = getTranslations(locale, "version");
  const tSession = getTranslations(locale, "sessions");
  const tLayer = getTranslations(locale, "layer_labels");
  const layer = LAYERS.find((l) => l.id === meta.layer);

  const pathIndex = LEARNING_PATH.indexOf(version as typeof LEARNING_PATH[number]);
  const prevVersion = pathIndex > 0 ? LEARNING_PATH[pathIndex - 1] : null;
  const nextVersion =
    pathIndex < LEARNING_PATH.length - 1
      ? LEARNING_PATH[pathIndex + 1]
      : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-zinc-900 px-3 py-1 font-mono text-base font-bold text-white dark:bg-white dark:text-zinc-900">
            {version}
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tSession(version) || meta.title}</h1>
          {layer && (
            <LayerBadge layer={meta.layer}>{tLayer(layer.id)}</LayerBadge>
          )}
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {meta.subtitle}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
            {versionData.loc} LOC
          </span>
          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
            {versionData.tools.length} {t("tools")}
          </span>
          {meta.coreAddition && (
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
              {meta.coreAddition}
            </span>
          )}
        </div>
      </header>

      {/* Scenario overview + running example (anchored case) */}
      {(() => {
        const scenario = getScenarioByVersion(version);
        if (!scenario || !scenario.description) return null;
        const labels =
          locale === "zh"
            ? { overview: "机制概览", example: "本节贯穿示例", project: "研究项目", whatHappens: "在这一节里做的事", more: "看完整机制讲解" }
            : { overview: "Overview", example: "Running example", project: "Research project", whatHappens: "What happens in this section", more: "Read the full mechanism" };
        return (
          <section className="space-y-4">
            {/* Overview card */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {labels.overview}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                {scenario.description}
              </p>
            </div>

            {/* Running example card — only if scenario.md provides the `> 本节贯穿示例：...` blockquote */}
            {scenario.runningExample && (
              <div className="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/20">
                <div className="flex items-center gap-2 border-b border-emerald-200/70 px-5 py-2.5 dark:border-emerald-900/40">
                  <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    {labels.example}
                  </span>
                </div>
                <div className="space-y-3 px-5 py-4">
                  {(() => {
                    const text = scenario.runningExample!;
                    // First sentence is the project name, rest is the concrete step. Split at the
                    // first comma/period for a cleaner two-line layout.
                    const splitIdx = text.search(/[，,]/);
                    const project = splitIdx > 0 ? text.slice(0, splitIdx).trim() : text;
                    const rest = splitIdx > 0 ? text.slice(splitIdx + 1).trim() : "";
                    return (
                      <>
                        <div>
                          <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70">
                            {labels.project}
                          </div>
                          <div className="font-medium text-emerald-900 dark:text-emerald-100">
                            {project}
                          </div>
                        </div>
                        {rest && (
                          <div>
                            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70">
                              {labels.whatHappens}
                            </div>
                            <p className="text-sm leading-relaxed text-emerald-900/90 dark:text-emerald-100/90">
                              {rest}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="border-t border-emerald-200/70 bg-white/50 px-5 py-2.5 dark:border-emerald-900/40 dark:bg-zinc-900/30">
                  <Link
                    href={`/${locale}/scenarios/${scenario.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                  >
                    {labels.more}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            )}
          </section>
        );
      })()}

      {/* Client-rendered interactive sections */}
      <VersionDetailClient
        version={version}
        diff={diff}
        source={versionData.source}
        filename={versionData.filename}
      />

      {/* Prev / Next navigation */}
      <nav className="flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-700">
        {prevVersion ? (
          <Link
            href={`/${locale}/${prevVersion}`}
            className="group flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              &larr;
            </span>
            <div>
              <div className="text-xs text-zinc-400">{t("prev")}</div>
              <div className="font-medium">
                {prevVersion} - {tSession(prevVersion) || VERSION_META[prevVersion]?.title}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextVersion ? (
          <Link
            href={`/${locale}/${nextVersion}`}
            className="group flex items-center gap-2 text-right text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            <div>
              <div className="text-xs text-zinc-400">{t("next")}</div>
              <div className="font-medium">
                {tSession(nextVersion) || VERSION_META[nextVersion]?.title} - {nextVersion}
              </div>
            </div>
            <span className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}
