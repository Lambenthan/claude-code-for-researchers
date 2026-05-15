import Link from "next/link";
import GettingStartedAnimation from "@/components/visualizations/getting-started";

const locales = ["en", "zh"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Copy {
  title: string;
  intro: string;
  installHeader: string;
  installCmd: string;
  installNote: string;
  launchHeader: string;
  launchCmd: string;
  launchNote: string;
  nextHeader: string;
  nextIntro: string;
  nextLinks: { label: string; href: string; desc: string }[];
}

const COPY_ZH: Copy = {
  title: "入门",
  intro:
    "5 分钟内从零到第一句对话。下面的动画以贯穿案例'耐心资本对企业 ESG 表现的影响'为背景，把整个启动流程展开给你看，按步骤推进或自动播放都可以。",
  installHeader: "1. 装上 Claude Code",
  installCmd: "npm install -g @anthropic-ai/claude-code",
  installNote:
    "需要先有 Node.js 18 或更新版本。Mac 用 brew install node，Windows 从 nodejs.org 下载安装包。装完后 claude --version 看到版本号就说明装好了。",
  launchHeader: "2. 在实证项目文件夹里启动",
  launchCmd: "cd ~/papers/pc-esg\nclaude",
  launchNote:
    "Claude Code 在工作目录里跑，所以先 cd 到项目文件夹再启动。这里以耐心资本 → ESG 项目为例。第一次启动会让你登录或填 API Key，按提示走。",
  nextHeader: "接下来",
  nextIntro: "装好之后回到首页，或从下面两个入口看具体机制。",
  nextLinks: [
    {
      label: "11 个工作机制",
      href: "/zh/scenarios",
      desc: "每个机制一节，全部用耐心资本 → ESG 这一个实证项目里的具体节点演示。",
    },
    {
      label: "12 项能力一览",
      href: "/zh/timeline",
      desc: "Claude Code 在实证研究里的全部能力，按层次分组浏览。",
    },
  ],
};

const COPY_EN: Copy = {
  title: "Getting Started",
  intro:
    "From zero to your first message in under 5 minutes. The animation below uses the running case 'Patient Capital → Corporate ESG Performance' to walk through the whole flow. Step through it manually or let it auto-play.",
  installHeader: "1. Install Claude Code",
  installCmd: "npm install -g @anthropic-ai/claude-code",
  installNote:
    "You need Node.js 18 or newer first. Mac: brew install node. Windows: install from nodejs.org. After install, claude --version should print a version number.",
  launchHeader: "2. Launch inside the empirical project folder",
  launchCmd: "cd ~/papers/pc-esg\nclaude",
  launchNote:
    "Claude Code runs from a working directory, so cd into your project folder before launching. We use the Patient Capital → ESG project as the running example. First launch asks you to sign in or paste an API key.",
  nextHeader: "Next",
  nextIntro:
    "After setup, head back to the home page or use these two entries to see how each mechanism works.",
  nextLinks: [
    {
      label: "11 mechanisms",
      href: "/en/scenarios",
      desc: "One section per mechanism — every example uses a real node from the Patient Capital → ESG empirical project.",
    },
    {
      label: "12 capabilities at a glance",
      href: "/en/timeline",
      desc: "Everything Claude Code does in empirical research, grouped by layer.",
    },
  ],
};

export default async function GettingStartedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = locale === "zh" ? COPY_ZH : COPY_EN;

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="pt-6 sm:pt-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {c.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[var(--color-text-secondary)] sm:text-lg">
          {c.intro}
        </p>
      </section>

      <GettingStartedAnimation />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
          <h3 className="text-base font-semibold">{c.installHeader}</h3>
          <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {c.installCmd}
          </pre>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {c.installNote}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
          <h3 className="text-base font-semibold">{c.launchHeader}</h3>
          <pre className="overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {c.launchCmd}
          </pre>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {c.launchNote}
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {c.nextHeader}
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-[var(--color-text-secondary)] sm:text-base">
            {c.nextIntro}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {c.nextLinks.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="group flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
            >
              <h3 className="text-base font-semibold group-hover:underline">
                {n.label} →
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {n.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
