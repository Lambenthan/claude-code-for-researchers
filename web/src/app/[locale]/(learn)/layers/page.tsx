"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "@/lib/i18n";
import { LAYERS, VERSION_META } from "@/lib/constants";
import { LayerBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { VersionIndex } from "@/types/agent-data";
import versionData from "@/data/generated/versions.json";

const data = versionData as VersionIndex;

const LAYER_ACCENT: Record<string, string> = {
  tools: "bg-cloud",
  planning: "bg-cactus",
  memory: "bg-heather",
  concurrency: "bg-coral",
  collaboration: "bg-fig",
};

export default function LayersPage() {
  const t = useTranslations("layers");
  const locale = useLocale();

  return (
    <div className="space-y-[var(--space-m)] pb-[var(--space-m)]">
      <header className="max-w-3xl pt-4">
        <p className="eyebrow">{locale === "zh" ? "层次架构" : "Layered architecture"}</p>
        <h1 className="display mt-3 text-ink">{t("title")}</h1>
        <p className="font-fluid-lede mt-5 max-w-2xl leading-[1.75] text-ink-muted">
          {t("subtitle")}
        </p>
      </header>

      <div className="space-y-10 border-t border-rule pt-9">
        {LAYERS.map((layer, index) => {
          const versionInfos = layer.versions.map((vId) => {
            const info = data.versions.find((v) => v.id === vId);
            const meta = VERSION_META[vId];
            return { id: vId, info, meta };
          });

          return (
            <section key={layer.id}>
              <header className="mb-6 grid grid-cols-[3px_1fr] gap-x-6 border-b border-rule pb-4">
                <span
                  aria-hidden="true"
                  className={cn("self-stretch", LAYER_ACCENT[layer.id])}
                />
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      translate="no"
                      className="eyebrow-strong tabular-nums text-ink-subtle"
                    >
                      L{index + 1}
                    </span>
                    <h2 className="font-serif text-[22px] leading-snug text-ink">
                      {layer.label}
                    </h2>
                  </div>
                  <p className="mt-2 max-w-2xl text-[13.5px] leading-[1.75] text-ink-muted">
                    {t(layer.id)}
                  </p>
                </div>
              </header>

              <ul className="grid grid-cols-1 gap-x-8 gap-y-7 md:grid-cols-2 lg:grid-cols-3">
                {versionInfos.map(({ id, info, meta }) => (
                  <li key={id}>
                    <Link
                      href={`/${locale}/${id}`}
                      className="group block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-2">
                          <span
                            translate="no"
                            className="eyebrow-strong text-ember tabular-nums"
                          >
                            {id}
                          </span>
                          <LayerBadge layer={layer.id}>{layer.id}</LayerBadge>
                        </div>
                        <ChevronRight
                          size={14}
                          aria-hidden="true"
                          className="shrink-0 text-ink-subtle transition-colors group-hover:text-ember"
                        />
                      </div>
                      <h3 className="mt-2 font-serif text-[17px] leading-snug text-ink transition-colors group-hover:text-ember">
                        {meta?.title || id}
                      </h3>
                      {meta?.subtitle && (
                        <p className="mt-1 text-[13px] italic text-ink-muted">
                          {meta.subtitle}
                        </p>
                      )}
                      <dl className="mt-3 flex flex-wrap items-baseline gap-x-4 text-[11.5px] text-ink-subtle">
                        <div className="flex items-baseline gap-1">
                          <dt className="eyebrow">LOC</dt>
                          <dd className="tabular-nums text-ink">
                            {info?.loc ?? "?"}
                          </dd>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <dt className="eyebrow">Tools</dt>
                          <dd className="tabular-nums text-ink">
                            {info?.tools.length ?? "?"}
                          </dd>
                        </div>
                      </dl>
                      {meta?.keyInsight && (
                        <p className="mt-3 line-clamp-2 text-[12.5px] leading-[1.7] text-ink-muted">
                          {meta.keyInsight}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
