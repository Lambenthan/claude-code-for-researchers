"use client";

import { useTranslations, useLocale } from "@/lib/i18n";
import { Timeline } from "@/components/timeline/timeline";

export default function TimelinePage() {
  const t = useTranslations("timeline");
  const locale = useLocale();

  return (
    <div className="space-y-[var(--space-m)] pb-[var(--space-m)]">
      <header className="max-w-3xl pt-4">
        <p className="eyebrow">{locale === "zh" ? "时间线" : "Timeline"}</p>
        <h1 className="display mt-3 text-ink">{t("title")}</h1>
        <p className="font-fluid-lede mt-5 max-w-2xl leading-[1.75] text-ink-muted">
          {t("subtitle")}
        </p>
      </header>
      <Timeline />
    </div>
  );
}
