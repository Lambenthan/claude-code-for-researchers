"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "@/lib/i18n";
import { LEARNING_PATH, VERSION_META } from "@/lib/constants";
import { LayerBadge } from "@/components/ui/badge";
import { CodeDiff } from "@/components/diff/code-diff";
import { ArchDiagram } from "@/components/architecture/arch-diagram";
import { ArrowRight, FileCode, Wrench, Box, FunctionSquare } from "lucide-react";
import type { VersionIndex } from "@/types/agent-data";
import versionData from "@/data/generated/versions.json";

const data = versionData as VersionIndex;

export default function ComparePage() {
  const t = useTranslations("compare");
  const locale = useLocale();
  const [versionA, setVersionA] = useState<string>("");
  const [versionB, setVersionB] = useState<string>("");

  const infoA = useMemo(
    () => data.versions.find((v) => v.id === versionA),
    [versionA],
  );
  const infoB = useMemo(
    () => data.versions.find((v) => v.id === versionB),
    [versionB],
  );
  const metaA = versionA ? VERSION_META[versionA] : null;
  const metaB = versionB ? VERSION_META[versionB] : null;

  const comparison = useMemo(() => {
    if (!infoA || !infoB) return null;
    const toolsA = new Set(infoA.tools);
    const toolsB = new Set(infoB.tools);
    const onlyA = infoA.tools.filter((tool) => !toolsB.has(tool));
    const onlyB = infoB.tools.filter((tool) => !toolsA.has(tool));
    const shared = infoA.tools.filter((tool) => toolsB.has(tool));

    const classesA = new Set(infoA.classes.map((c) => c.name));
    const newClasses = infoB.classes
      .map((c) => c.name)
      .filter((c) => !classesA.has(c));

    const funcsA = new Set(infoA.functions.map((f) => f.name));
    const newFunctions = infoB.functions
      .map((f) => f.name)
      .filter((f) => !funcsA.has(f));

    return {
      locDelta: infoB.loc - infoA.loc,
      toolsOnlyA: onlyA,
      toolsOnlyB: onlyB,
      toolsShared: shared,
      newClasses,
      newFunctions,
    };
  }, [infoA, infoB]);

  return (
    <div className="space-y-[var(--space-m)] pb-[var(--space-m)]">
      <header className="max-w-3xl pt-4">
        <p className="eyebrow">{locale === "zh" ? "版本对比" : "Version comparison"}</p>
        <h1 className="display mt-3 text-ink">{t("title")}</h1>
        <p className="font-fluid-lede mt-5 max-w-2xl leading-[1.75] text-ink-muted">
          {t("subtitle")}
        </p>
      </header>

      <section className="flex flex-col items-start gap-5 border-t border-rule pt-7 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label
            htmlFor="version-a"
            className="eyebrow block text-ink"
          >
            {t("select_a")}
          </label>
          <select
            id="version-a"
            name="version-a"
            autoComplete="off"
            value={versionA}
            onChange={(e) => setVersionA(e.target.value)}
            className="w-full border border-rule-strong bg-cream-elevated px-3 py-2.5 text-[14px] text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            <option value="">-- select --</option>
            {LEARNING_PATH.map((v) => (
              <option key={v} value={v}>
                {v} - {VERSION_META[v]?.title}
              </option>
            ))}
          </select>
        </div>

        <ArrowRight
          size={20}
          aria-hidden="true"
          className="mb-3 hidden text-ink-subtle sm:block"
        />

        <div className="flex-1 space-y-2">
          <label
            htmlFor="version-b"
            className="eyebrow block text-ink"
          >
            {t("select_b")}
          </label>
          <select
            id="version-b"
            name="version-b"
            autoComplete="off"
            value={versionB}
            onChange={(e) => setVersionB(e.target.value)}
            className="w-full border border-rule-strong bg-cream-elevated px-3 py-2.5 text-[14px] text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            <option value="">-- select --</option>
            {LEARNING_PATH.map((v) => (
              <option key={v} value={v}>
                {v} - {VERSION_META[v]?.title}
              </option>
            ))}
          </select>
        </div>
      </section>

      {infoA && infoB && comparison && (
        <div className="space-y-12">
          {/* Side-by-side version info */}
          <section className="grid grid-cols-1 gap-6 border-t border-rule pt-7 sm:grid-cols-2">
            <article className="border-l-2 border-cloud bg-cream-surface px-5 py-5">
              <p className="eyebrow">
                <span translate="no">{versionA}</span>
              </p>
              <h2 className="mt-2 font-serif text-[20px] leading-snug text-ink">
                {metaA?.title || versionA}
              </h2>
              {metaA?.subtitle && (
                <p className="mt-1 text-[13px] italic text-ink-muted">
                  {metaA.subtitle}
                </p>
              )}
              <dl className="mt-4 flex flex-wrap items-baseline gap-x-4 text-[12.5px]">
                <Pair label="LOC" value={<span className="tabular-nums">{infoA.loc}</span>} />
                <Pair label={t("tools")} value={<span className="tabular-nums">{infoA.tools.length}</span>} />
                {metaA && (
                  <div className="flex items-baseline gap-1.5">
                    <dt className="eyebrow">{locale === "zh" ? "层" : "Layer"}</dt>
                    <dd>
                      <LayerBadge layer={metaA.layer}>{metaA.layer}</LayerBadge>
                    </dd>
                  </div>
                )}
              </dl>
            </article>
            <article className="border-l-2 border-ember bg-cream-surface px-5 py-5">
              <p className="eyebrow">
                <span translate="no">{versionB}</span>
              </p>
              <h2 className="mt-2 font-serif text-[20px] leading-snug text-ink">
                {metaB?.title || versionB}
              </h2>
              {metaB?.subtitle && (
                <p className="mt-1 text-[13px] italic text-ink-muted">
                  {metaB.subtitle}
                </p>
              )}
              <dl className="mt-4 flex flex-wrap items-baseline gap-x-4 text-[12.5px]">
                <Pair label="LOC" value={<span className="tabular-nums">{infoB.loc}</span>} />
                <Pair label={t("tools")} value={<span className="tabular-nums">{infoB.tools.length}</span>} />
                {metaB && (
                  <div className="flex items-baseline gap-1.5">
                    <dt className="eyebrow">{locale === "zh" ? "层" : "Layer"}</dt>
                    <dd>
                      <LayerBadge layer={metaB.layer}>{metaB.layer}</LayerBadge>
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          </section>

          {/* Architecture Diagrams */}
          <section>
            <header className="mb-6">
              <p className="eyebrow">{locale === "zh" ? "对比图示" : "Side by side"}</p>
              <h2 className="display mt-3 text-ink">{t("architecture")}</h2>
            </header>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h3 className="eyebrow mb-3">
                  {metaA?.title || versionA}
                </h3>
                <ArchDiagram version={versionA} />
              </div>
              <div>
                <h3 className="eyebrow mb-3">
                  {metaB?.title || versionB}
                </h3>
                <ArchDiagram version={versionB} />
              </div>
            </div>
          </section>

          {/* Structural diff */}
          <section>
            <header className="mb-6">
              <p className="eyebrow">{locale === "zh" ? "差异概览" : "Diff overview"}</p>
              <h2 className="display mt-3 text-ink">
                {locale === "zh" ? "结构性差异" : "Structural diff"}
              </h2>
            </header>
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <DiffStat
                icon={<FileCode size={14} aria-hidden="true" />}
                label={t("loc_delta")}
                value={
                  <span
                    className={
                      comparison.locDelta >= 0 ? "text-cactus" : "text-ember"
                    }
                  >
                    {comparison.locDelta >= 0 ? "+" : ""}
                    {comparison.locDelta}
                  </span>
                }
                suffix={t("lines")}
              />
              <DiffStat
                icon={<Wrench size={14} aria-hidden="true" />}
                label={t("new_tools_in_b")}
                value={comparison.toolsOnlyB.length}
                chips={comparison.toolsOnlyB}
                chipBg="bg-cloud/40"
              />
              <DiffStat
                icon={<Box size={14} aria-hidden="true" />}
                label={t("new_classes_in_b")}
                value={comparison.newClasses.length}
                chips={comparison.newClasses}
                chipBg="bg-heather/40"
              />
              <DiffStat
                icon={<FunctionSquare size={14} aria-hidden="true" />}
                label={t("new_functions_in_b")}
                value={comparison.newFunctions.length}
                chips={comparison.newFunctions}
                chipBg="bg-coral/50"
              />
            </dl>
          </section>

          {/* Tool comparison */}
          <section>
            <header className="mb-6">
              <p className="eyebrow">{locale === "zh" ? "工具集" : "Tool sets"}</p>
              <h2 className="display mt-3 text-ink">{t("tool_comparison")}</h2>
            </header>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 border-t border-rule pt-6">
              <ToolColumn
                label={`${t("only_in")} ${metaA?.title || versionA}`}
                tools={comparison.toolsOnlyA}
                empty={t("none")}
                chipBg="bg-ember/15 text-ember"
              />
              <ToolColumn
                label={t("shared")}
                tools={comparison.toolsShared}
                empty={t("none")}
                chipBg="bg-cream-hover text-ink-muted"
              />
              <ToolColumn
                label={`${t("only_in")} ${metaB?.title || versionB}`}
                tools={comparison.toolsOnlyB}
                empty={t("none")}
                chipBg="bg-cactus/40 text-ink"
              />
            </div>
          </section>

          {/* Code Diff */}
          <section>
            <header className="mb-6">
              <p className="eyebrow">{locale === "zh" ? "源码差异" : "Source"}</p>
              <h2 className="display mt-3 text-ink">{t("source_diff")}</h2>
            </header>
            <CodeDiff
              oldSource={infoA.source}
              newSource={infoB.source}
              oldLabel={`${infoA.id} (${infoA.filename})`}
              newLabel={`${infoB.id} (${infoB.filename})`}
            />
          </section>
        </div>
      )}

      {(!versionA || !versionB) && (
        <div className="border border-dashed border-rule px-8 py-14 text-center">
          <p className="font-fluid-body text-ink-muted">{t("empty_hint")}</p>
        </div>
      )}
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

function DiffStat({
  icon,
  label,
  value,
  suffix,
  chips,
  chipBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  suffix?: string;
  chips?: string[];
  chipBg?: string;
}) {
  return (
    <div>
      <dt className="eyebrow inline-flex items-center gap-1.5 text-ink-muted">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 font-serif text-[28px] leading-none text-ink">
        {value}
        {suffix && (
          <span className="ml-2 font-sans text-[12px] font-normal text-ink-subtle">
            {suffix}
          </span>
        )}
      </dd>
      {chips && chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1">
          {chips.map((c) => (
            <li
              key={c}
              translate="no"
              className={`rounded-sm px-1.5 py-0.5 font-mono text-[11px] text-ink ${chipBg ?? "bg-cream-hover"}`}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ToolColumn({
  label,
  tools,
  empty,
  chipBg,
}: {
  label: string;
  tools: string[];
  empty: string;
  chipBg: string;
}) {
  return (
    <div>
      <h4 className="eyebrow mb-3 text-ink">{label}</h4>
      {tools.length === 0 ? (
        <p className="text-[12px] italic text-ink-subtle">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-1">
          {tools.map((tool) => (
            <li
              key={tool}
              translate="no"
              className={`rounded-sm px-1.5 py-0.5 font-mono text-[11px] ${chipBg}`}
            >
              {tool}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
