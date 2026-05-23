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
    <div className="space-y-[var(--space-m)] pb-[var(--space-m)]">
      <header className="max-w-3xl pt-4">
        <p className="eyebrow">{locale === "zh" ? "入门指南" : "Start guide"}</p>
        <h1 className="display mt-3 text-ink">{c.title}</h1>
        <p className="font-fluid-lede mt-5 max-w-2xl leading-[1.75] text-ink-muted">
          {c.intro}
        </p>
      </header>

      <GettingStartedAnimation />

      <section className="grid grid-cols-1 gap-x-8 gap-y-8 border-t border-rule pt-9 lg:grid-cols-2">
        <article className="flex flex-col gap-3">
          <h3 className="font-serif text-[18px] leading-snug text-ink">
            {c.installHeader}
          </h3>
          <pre
            translate="no"
            className="overflow-x-auto border border-[var(--color-code-border)] bg-[var(--color-code-bg)] p-4 font-mono text-[12.5px] leading-relaxed text-[var(--color-code-text)]"
          >
            {c.installCmd}
          </pre>
          <p className="text-[13.5px] leading-[1.75] text-ink-muted">
            {c.installNote}
          </p>
        </article>

        <article className="flex flex-col gap-3">
          <h3 className="font-serif text-[18px] leading-snug text-ink">
            {c.launchHeader}
          </h3>
          <pre
            translate="no"
            className="overflow-x-auto border border-[var(--color-code-border)] bg-[var(--color-code-bg)] p-4 font-mono text-[12.5px] leading-relaxed text-[var(--color-code-text)]"
          >
            {c.launchCmd}
          </pre>
          <p className="text-[13.5px] leading-[1.75] text-ink-muted">
            {c.launchNote}
          </p>
        </article>
      </section>

      <section>
        <header className="max-w-3xl">
          <p className="eyebrow">{locale === "zh" ? "继续浏览" : "Continue"}</p>
          <h2 className="display mt-3 text-ink">{c.nextHeader}</h2>
          <p className="font-fluid-body mt-4 max-w-2xl leading-[1.75] text-ink-muted">
            {c.nextIntro}
          </p>
        </header>
        <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-7 border-t border-rule pt-7 sm:grid-cols-2">
          {c.nextLinks.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className="group block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
              >
                <h3 className="font-serif text-[18px] leading-snug text-ink transition-colors group-hover:text-ember">
                  {n.label} <span aria-hidden="true">→</span>
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.75] text-ink-muted">
                  {n.desc}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
