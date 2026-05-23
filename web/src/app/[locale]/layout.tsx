import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/layout/header";
import en from "@/i18n/messages/en.json";
import zh from "@/i18n/messages/zh.json";
import "../globals.css";

const locales = ["en", "zh"];
const metaMessages: Record<string, typeof en> = { en, zh };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = metaMessages[locale] || metaMessages.en;
  return {
    title: messages.meta?.title || "Learn Claude Code",
    description:
      messages.meta?.description ||
      "Build an AI coding agent from scratch, one concept at a time",
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <head>
        {/*
          Geist (sans) + Source Serif 4 (serif) — closest free analogs to
          Anthropic's proprietary Styrene B + Tiempos pair. Loaded over
          Google Fonts CDN with preconnect to keep first-paint snappy.
          LXGW WenKai Screen handles CJK glyphs — strokes tuned for
          screen rendering at 10–16px so kaiti doesn't smudge.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont/lxgwwenkaiscreen.css"
        />
        <meta name="theme-color" content="#f5f4ed" />
      </head>
      <body className="min-h-screen antialiased">
        <I18nProvider locale={locale}>
          <Header />
          <main className="mx-auto max-w-[88rem] px-6 py-12 sm:px-8 lg:px-10">
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
