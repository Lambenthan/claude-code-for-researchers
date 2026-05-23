"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAYERS, VERSION_META } from "@/lib/constants";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ScenarioMeta } from "@/lib/scenarios";

const LAYER_DOT_BG: Record<string, string> = {
  tools: "bg-cloud",
  planning: "bg-cactus",
  memory: "bg-heather",
  concurrency: "bg-coral",
  collaboration: "bg-fig",
};

export function Sidebar({ scenarios = [] }: { scenarios?: ScenarioMeta[] }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const t = useTranslations("sessions");
  const tLayer = useTranslations("layer_labels");

  const startSection = locale === "zh" ? "开始" : "Start";
  const scenariosSection =
    locale === "zh" ? "11 个机制（案例叙事）" : "11 mechanisms (case story)";
  const engineeringSection =
    locale === "zh" ? "12 项能力（工程参考）" : "12 capabilities (engineering ref)";

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
      label: "CLAUDE.md",
    },
  ];

  const scenariosIndexHref = `/${locale}/scenarios`;
  const isScenariosIndexActive =
    pathname === scenariosIndexHref || pathname === `${scenariosIndexHref}/`;

  return (
    <nav className="hidden w-60 shrink-0 md:block">
      <div className="sticky top-[calc(3.5rem+2rem)] max-h-[calc(100vh-5.5rem)] space-y-7 overflow-y-auto pr-1">
        <SidebarSection label={startSection}>
          <ul>
            {introItems.map((item) => (
              <SidebarItem
                key={item.href}
                href={item.href}
                active={pathname === item.href || pathname === `${item.href}/`}
                label={item.label}
              />
            ))}
          </ul>
        </SidebarSection>

        {scenarios.length > 0 && (
          <SidebarSection
            label={scenariosSection}
            href={scenariosIndexHref}
            accentDot="bg-cactus"
          >
            <ul>
              {scenarios.map((s) => {
                const href = `/${locale}/scenarios/${s.slug}`;
                const isActive = pathname === href || pathname === `${href}/`;
                return (
                  <SidebarItem
                    key={s.slug}
                    href={href}
                    active={isActive}
                    label={s.title}
                    leading={
                      <span className="font-mono text-[10.5px] text-ink-subtle tabular-nums">
                        {s.number.padStart(2, "0")}
                      </span>
                    }
                  />
                );
              })}
            </ul>
            {isScenariosIndexActive && (
              <p className="mt-2 px-3 text-[11px] italic text-ember">
                {locale === "zh" ? "← 索引页" : "← Index page"}
              </p>
            )}
          </SidebarSection>
        )}

        <SidebarSection label={engineeringSection}>
          <div className="space-y-5">
            {LAYERS.map((layer) => (
              <div key={layer.id}>
                <div className="flex items-center gap-2 pb-1.5 pl-3">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      LAYER_DOT_BG[layer.id],
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-subtle">
                    {tLayer(layer.id)}
                  </span>
                </div>
                <ul>
                  {layer.versions.map((vId) => {
                    const meta = VERSION_META[vId];
                    const href = `/${locale}/${vId}`;
                    const isActive =
                      pathname === href ||
                      pathname === `${href}/` ||
                      pathname.startsWith(`${href}/diff`);
                    return (
                      <SidebarItem
                        key={vId}
                        href={href}
                        active={isActive}
                        label={t(vId) || meta?.title}
                        leading={
                          <span
                            translate="no"
                            className="font-mono text-[10.5px] text-ink-subtle tabular-nums"
                          >
                            {vId}
                          </span>
                        }
                      />
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </SidebarSection>
      </div>
    </nav>
  );
}

function SidebarSection({
  label,
  href,
  accentDot,
  children,
}: {
  label: string;
  href?: string;
  accentDot?: string;
  children: React.ReactNode;
}) {
  const headerInner = (
    <span className="flex items-center gap-2">
      {accentDot && (
        <span
          aria-hidden="true"
          className={cn("h-2 w-2 rounded-full", accentDot)}
        />
      )}
      <span className="eyebrow">{label}</span>
    </span>
  );
  return (
    <div>
      <div className="pb-2">
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center transition-colors hover:text-ink"
          >
            {headerInner}
          </Link>
        ) : (
          headerInner
        )}
      </div>
      {children}
    </div>
  );
}

function SidebarItem({
  href,
  active,
  label,
  leading,
}: {
  href: string;
  active: boolean;
  label: string;
  leading?: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-baseline gap-2 py-1.5 pl-3 pr-2 text-[13.5px] leading-snug transition-colors",
          active ? "text-ink" : "text-ink-muted hover:text-ink",
        )}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-4 w-px -translate-y-1/2 bg-ember"
          />
        )}
        {leading && <span className="shrink-0">{leading}</span>}
        <span className="text-pretty">{label}</span>
      </Link>
    </li>
  );
}
