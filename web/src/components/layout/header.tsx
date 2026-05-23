"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "@/lib/i18n";
import { Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "start", href: "/start" },
  { key: "timeline", href: "/timeline" },
  { key: "compare", href: "/compare" },
  { key: "layers", href: "/layers" },
] as const;

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

const REPO_URL = "https://github.com/shareAI-lab/learn-claude-code";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  function switchLocale(newLocale: string) {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  }

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-6 px-6 py-5 sm:px-8 lg:px-10">
        <Link
          href={`/${locale}`}
          className="font-serif text-[19px] italic leading-none text-ink transition-colors hover:text-ember"
        >
          Learn Claude Code
        </Link>

        <nav className="hidden items-baseline gap-7 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "eyebrow transition-colors hover:text-ink",
                  isActive && "text-ink",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <div className="flex items-baseline gap-3">
            {LOCALES.map((l, i) => (
              <span key={l.code} className="flex items-baseline gap-3">
                <button
                  type="button"
                  onClick={() => switchLocale(l.code)}
                  className={cn(
                    "eyebrow transition-colors hover:text-ink",
                    locale === l.code && "text-ink",
                  )}
                  aria-pressed={locale === l.code}
                >
                  {l.label}
                </button>
                {i === 0 && (
                  <span aria-hidden="true" className="text-ink-subtle">
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow inline-flex items-center gap-1.5 transition-colors hover:text-ink"
            aria-label="View source on GitHub"
          >
            <Github size={13} aria-hidden="true" />
            <span>GitHub</span>
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center text-ink transition-colors hover:text-ember md:hidden"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-rule px-6 py-4 md:hidden">
          <ul className="space-y-3">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.includes(item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={`/${locale}${item.href}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "eyebrow block py-1 transition-colors hover:text-ink",
                      isActive && "text-ink",
                    )}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-rule pt-4">
            <div className="flex items-baseline gap-3">
              {LOCALES.map((l, i) => (
                <span key={l.code} className="flex items-baseline gap-3">
                  <button
                    type="button"
                    onClick={() => switchLocale(l.code)}
                    className={cn(
                      "eyebrow transition-colors hover:text-ink",
                      locale === l.code && "text-ink",
                    )}
                    aria-pressed={locale === l.code}
                  >
                    {l.label}
                  </button>
                  {i === 0 && (
                    <span aria-hidden="true" className="text-ink-subtle">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </div>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow inline-flex items-center gap-1.5 transition-colors hover:text-ink"
              aria-label="View source on GitHub"
            >
              <Github size={13} aria-hidden="true" />
              <span>GitHub</span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
