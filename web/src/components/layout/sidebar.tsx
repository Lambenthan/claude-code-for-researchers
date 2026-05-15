"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAYERS, VERSION_META } from "@/lib/constants";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ScenarioMeta } from "@/lib/scenarios";

const LAYER_DOT_BG: Record<string, string> = {
  tools: "bg-blue-500",
  planning: "bg-emerald-500",
  memory: "bg-purple-500",
  concurrency: "bg-amber-500",
  collaboration: "bg-red-500",
};

export function Sidebar({ scenarios = [] }: { scenarios?: ScenarioMeta[] }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const t = useTranslations("sessions");
  const tLayer = useTranslations("layer_labels");

  const startSection = locale === "zh" ? "开始" : "Start";
  const scenariosSection = locale === "zh" ? "11 个机制（案例叙事）" : "11 mechanisms (case story)";
  const engineeringSection = locale === "zh" ? "12 项能力（工程参考）" : "12 capabilities (engineering ref)";

  const introItems = [
    {
      href: `/${locale}/start`,
      label: locale === "zh" ? "入门" : "Getting Started",
    },
    {
      href: `/${locale}/project-mode`,
      label: locale === "zh" ? "项目制" : "Project Mode",
    },
    {
      href: `/${locale}/claude-md`,
      label: locale === "zh" ? "CLAUDE.md" : "CLAUDE.md",
    },
  ];

  const scenariosIndexHref = `/${locale}/scenarios`;
  const isScenariosIndexActive =
    pathname === scenariosIndexHref || pathname === `${scenariosIndexHref}/`;

  return (
    <nav className="hidden w-60 shrink-0 md:block">
      <div className="sticky top-[calc(3.5rem+2rem)] max-h-[calc(100vh-5.5rem)] space-y-5 overflow-y-auto pr-1">
        {/* Intro */}
        <div>
          <div className="flex items-center gap-1.5 pb-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {startSection}
            </span>
          </div>
          <ul className="space-y-0.5">
            {introItems.map((item) => {
              const isActive =
                pathname === item.href || pathname === `${item.href}/`;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-md px-2.5 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
                    )}
                  >
                    <span className="font-mono text-xs">→</span>
                    <span className="ml-1.5">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 11 scenarios (case-anchored chapters) */}
        {scenarios.length > 0 && (
          <div>
            <Link
              href={scenariosIndexHref}
              className="flex items-center gap-1.5 pb-1.5 hover:underline"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {scenariosSection}
              </span>
            </Link>
            <ul className="space-y-0.5">
              {scenarios.map((s) => {
                const href = `/${locale}/scenarios/${s.slug}`;
                const isActive =
                  pathname === href || pathname === `${href}/`;
                return (
                  <li key={s.slug}>
                    <Link
                      href={href}
                      className={cn(
                        "block rounded-md px-2.5 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-emerald-50 font-medium text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
                      )}
                    >
                      <span className="font-mono text-xs text-emerald-600/70 dark:text-emerald-400/70">
                        {s.number.padStart(2, "0")}
                      </span>
                      <span className="ml-1.5">{s.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {isScenariosIndexActive && (
              <div className="mt-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                {locale === "zh" ? "← 索引页" : "← Index page"}
              </div>
            )}
          </div>
        )}

        {/* 12 sNN engineering reference, grouped by layer */}
        <div>
          <div className="flex items-center gap-1.5 pb-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {engineeringSection}
            </span>
          </div>
          <div className="space-y-3">
            {LAYERS.map((layer) => (
              <div key={layer.id}>
                <div className="flex items-center gap-1.5 pb-1 pl-1">
                  <span className={cn("h-1.5 w-1.5 rounded-full", LAYER_DOT_BG[layer.id])} />
                  <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {tLayer(layer.id)}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {layer.versions.map((vId) => {
                    const meta = VERSION_META[vId];
                    const href = `/${locale}/${vId}`;
                    const isActive =
                      pathname === href ||
                      pathname === `${href}/` ||
                      pathname.startsWith(`${href}/diff`);

                    return (
                      <li key={vId}>
                        <Link
                          href={href}
                          className={cn(
                            "block rounded-md px-2.5 py-1.5 text-sm transition-colors",
                            isActive
                              ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-white"
                              : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
                          )}
                        >
                          <span className="font-mono text-xs">{vId}</span>
                          <span className="ml-1.5">{t(vId) || meta?.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
