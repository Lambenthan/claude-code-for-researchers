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
        <h1 className="display text-ink">Version not found</h1>
        <p className="mt-3 text-ink-subtle">{version}</p>
      </div>
    );
  }

  const t = getTranslations(locale, "version");
  const tSession = getTranslations(locale, "sessions");
  const tLayer = getTranslations(locale, "layer_labels");
  const layer = LAYERS.find((l) => l.id === meta.layer);

  const pathIndex = LEARNING_PATH.indexOf(
    version as (typeof LEARNING_PATH)[number],
  );
  const prevVersion = pathIndex > 0 ? LEARNING_PATH[pathIndex - 1] : null;
  const nextVersion =
    pathIndex < LEARNING_PATH.length - 1
      ? LEARNING_PATH[pathIndex + 1]
      : null;

  const scenario = getScenarioByVersion(version);
  const overviewLabels =
    locale === "zh"
      ? {
          overview: "机制概览",
          example: "本节贯穿示例",
          project: "研究项目",
          whatHappens: "在这一节里做的事",
          more: "看完整机制讲解",
        }
      : {
          overview: "Overview",
          example: "Running example",
          project: "Research project",
          whatHappens: "What happens in this section",
          more: "Read the full mechanism",
        };

  return (
    <div className="mx-auto max-w-3xl space-y-12 py-4">
      <header className="space-y-5">
        <p className="eyebrow inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-ember"
          />
          <span translate="no">{version}</span>
          {layer && (
            <>
              <span aria-hidden="true" className="text-ink-subtle">
                ·
              </span>
              <span>{tLayer(layer.id)}</span>
            </>
          )}
        </p>
        <h1 className="display text-ink">
          {tSession(version) || meta.title}
        </h1>
        <p className="font-fluid-lede max-w-2xl leading-[1.7] text-ink-muted">
          {meta.subtitle}
        </p>
        <dl className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-subtle">
          <Pair label="LOC" value={<span className="tabular-nums">{versionData.loc}</span>} />
          <Pair label={t("tools")} value={<span className="tabular-nums">{versionData.tools.length}</span>} />
          {meta.coreAddition && (
            <Pair
              label={locale === "zh" ? "新增" : "Adds"}
              value={meta.coreAddition}
            />
          )}
          {layer && (
            <div className="flex items-baseline gap-1.5">
              <dt className="eyebrow">{locale === "zh" ? "层" : "Layer"}</dt>
              <dd>
                <LayerBadge layer={meta.layer}>{tLayer(layer.id)}</LayerBadge>
              </dd>
            </div>
          )}
        </dl>
      </header>

      {scenario && scenario.description && (
        <section className="space-y-5">
          <div className="border-l-2 border-rule-strong bg-cream-surface px-5 py-5">
            <p className="eyebrow inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-cloud"
              />
              {overviewLabels.overview}
            </p>
            <p className="mt-3 font-fluid-body leading-[1.85] text-ink">
              {scenario.description}
            </p>
          </div>

          {scenario.runningExample && (
            <div className="border-l-2 border-cactus bg-cream-surface px-5 py-5">
              <p className="eyebrow inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-cactus"
                />
                {overviewLabels.example}
              </p>
              {(() => {
                const text = scenario.runningExample!;
                const splitIdx = text.search(/[，,]/);
                const project =
                  splitIdx > 0 ? text.slice(0, splitIdx).trim() : text;
                const rest =
                  splitIdx > 0 ? text.slice(splitIdx + 1).trim() : "";
                return (
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="eyebrow text-ink-subtle">
                        {overviewLabels.project}
                      </p>
                      <p className="mt-1 font-serif text-[16px] leading-snug text-ink">
                        {project}
                      </p>
                    </div>
                    {rest && (
                      <div>
                        <p className="eyebrow text-ink-subtle">
                          {overviewLabels.whatHappens}
                        </p>
                        <p className="mt-1 font-fluid-body leading-[1.8] text-ink">
                          {rest}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="mt-5 border-t border-rule pt-3">
                <Link
                  href={`/${locale}/scenarios/${scenario.slug}`}
                  className="eyebrow inline-flex items-center gap-1.5 text-ember transition-colors hover:text-ink"
                >
                  {overviewLabels.more}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      <VersionDetailClient
        version={version}
        diff={diff}
        source={versionData.source}
        filename={versionData.filename}
      />

      <nav className="grid grid-cols-1 gap-4 border-t border-rule pt-7 sm:grid-cols-2">
        {prevVersion ? (
          <Link
            href={`/${locale}/${prevVersion}`}
            className="group flex flex-col gap-1 rounded text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
          >
            <span className="eyebrow inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="transition-transform group-hover:-translate-x-1"
              >
                ←
              </span>
              {t("prev")}
            </span>
            <span className="font-serif text-[16px] text-ink transition-colors group-hover:text-ember">
              <span translate="no" className="text-ink-subtle">
                {prevVersion}
              </span>{" "}
              · {tSession(prevVersion) || VERSION_META[prevVersion]?.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {nextVersion ? (
          <Link
            href={`/${locale}/${nextVersion}`}
            className="group flex flex-col gap-1 rounded text-right transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember sm:items-end"
          >
            <span className="eyebrow inline-flex items-center gap-1.5">
              {t("next")}
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
            <span className="font-serif text-[16px] text-ink transition-colors group-hover:text-ember">
              {tSession(nextVersion) || VERSION_META[nextVersion]?.title} ·{" "}
              <span translate="no" className="text-ink-subtle">
                {nextVersion}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

function Pair({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
