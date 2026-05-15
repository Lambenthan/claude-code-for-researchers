"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useLocale } from "@/lib/i18n";

interface Copy {
  title: string;
  desktopLabel: string;
  terminalLabel: string;
  scopeLabel: string;
  cwdLabel: string;
  outOfScopeLabel: string;
  promptUser: string;
  promptCwdReady: string;
  promptCwdInProject: string;
  fileTree: { line: string; visible: boolean; mark?: "in" | "out" }[];
  outsideTree: { line: string; mark: "out" }[];
  shellOutputCdHome: string;
  shellOutputCdPaper: string;
  shellOutputClaude: string[];
  shellOutputTask: string[];
  steps: { title: string; description: string }[];
}

const COPY_ZH: Copy = {
  title: "项目制 = Claude Code 锁在一个文件夹里干活",
  desktopLabel: "你的电脑",
  terminalLabel: "终端",
  scopeLabel: "Claude 的工作范围",
  cwdLabel: "工作目录",
  outOfScopeLabel: "范围以外（看不到）",
  promptUser: "你输入：",
  promptCwdReady: "han@mac ~ %",
  promptCwdInProject: "han@mac pc-esg %",
  fileTree: [
    { line: "~/papers/pc-esg/", visible: true, mark: "in" },
    { line: "├── CLAUDE.md", visible: true, mark: "in" },
    { line: "├── checkpoint.md", visible: true, mark: "in" },
    { line: "├── 01_文献/", visible: true, mark: "in" },
    { line: "├── 02_变量字典/", visible: true, mark: "in" },
    { line: "├── 03_原始数据/", visible: true, mark: "in" },
    { line: "├── 04_中间数据/main_panel.dta", visible: true, mark: "in" },
    { line: "├── 05_分析代码/耐心资本-全套代码.do", visible: true, mark: "in" },
    { line: "├── 06_结果输出/tables/", visible: true, mark: "in" },
    { line: "└── 07_论文写作/", visible: true, mark: "in" },
  ],
  outsideTree: [
    { line: "~/papers/another-project/", mark: "out" },
    { line: "~/Documents/2024-tax-return.pdf", mark: "out" },
    { line: "~/Downloads/random-stuff.zip", mark: "out" },
    { line: "~/photos/2025-trip/", mark: "out" },
  ],
  shellOutputCdHome: "han@mac ~ %",
  shellOutputCdPaper: "han@mac pc-esg %",
  shellOutputClaude: [
    "Claude Code v2.1.141",
    "cwd: /Users/han/papers/pc-esg",
    "loading CLAUDE.md ...",
    "loading checkpoint.md ...",
    "Ready.",
  ],
  shellOutputTask: [
    "● 我读 checkpoint.md，phase 1 已落 26874 obs main_panel.dta",
    "tool_use: read 02_变量字典/测算方法说明.md",
    "tool_use: stata-mcp codebook main_panel.dta",
    "结果：PC_A2 主测度字段对齐，待 phase 2 启动 IV/PSM",
  ],
  steps: [
    {
      title: "默认状态：Claude Code 还没启动",
      description:
        "你的电脑里有很多文件夹：耐心资本项目、其他论文、税务文档、下载、照片。Claude Code 还没启动，它现在什么都看不到。",
    },
    {
      title: "cd 进入耐心资本项目",
      description:
        "启动 Claude Code 之前，必须先 cd 到要工作的项目文件夹。这一步决定了 Claude 的工作范围。终端的提示符变成 pc-esg，说明已经站在项目里了。",
    },
    {
      title: "敲 claude 启动会话",
      description:
        "Claude Code 启动时把当前目录锁定为工作目录。整个会话期间 Claude 都站在这个文件夹里，文件夹以外的东西它看不到。CLAUDE.md 与 checkpoint.md 也在这一步自动加载（详见下一节）。",
    },
    {
      title: "Claude 只看得见项目内的文件",
      description:
        "左边是项目文件夹里的所有目录——从 01_文献 到 07_论文写作 的编号目录，Claude 可以随时读到。右边那些是项目外的——其他论文、税务文档、下载夹——Claude 一律看不见。这是工作目录隔离带来的天然安全边界。",
    },
    {
      title: "给 Claude 一个实证任务",
      description:
        "你说'读一下 checkpoint.md 看进度，再核 PC_A2 字段定义'。Claude 在自己的工作目录里读 02_变量字典、调 stata-mcp 看 main_panel.dta codebook、对照报告。整个过程没碰文件夹外的任何东西。",
    },
    {
      title: "退出后，项目仍在原地",
      description:
        "Claude Code 关闭后，文件夹里的所有内容、git 历史、CLAUDE.md、checkpoint.md、跑完的 do0–do10 与产出的 12 张三线表都留在原地。明天再 cd 进来重新启动，从这里继续。Claude 没有自己的'记忆'，它的连续性靠的就是这个文件夹。",
    },
  ],
};

const COPY_EN: Copy = {
  title: "Project Mode = Claude Code Locked Inside One Folder",
  desktopLabel: "Your computer",
  terminalLabel: "Terminal",
  scopeLabel: "Claude's working scope",
  cwdLabel: "Working dir",
  outOfScopeLabel: "Out of scope (invisible)",
  promptUser: "You type:",
  promptCwdReady: "han@mac ~ %",
  promptCwdInProject: "han@mac pc-esg %",
  fileTree: [
    { line: "~/papers/pc-esg/", visible: true, mark: "in" },
    { line: "├── CLAUDE.md", visible: true, mark: "in" },
    { line: "├── checkpoint.md", visible: true, mark: "in" },
    { line: "├── 01_文献/", visible: true, mark: "in" },
    { line: "├── 02_变量字典/", visible: true, mark: "in" },
    { line: "├── 03_原始数据/", visible: true, mark: "in" },
    { line: "├── 04_中间数据/main_panel.dta", visible: true, mark: "in" },
    { line: "├── 05_分析代码/耐心资本-全套代码.do", visible: true, mark: "in" },
    { line: "├── 06_结果输出/tables/", visible: true, mark: "in" },
    { line: "└── 07_论文写作/", visible: true, mark: "in" },
  ],
  outsideTree: [
    { line: "~/papers/another-project/", mark: "out" },
    { line: "~/Documents/2024-tax-return.pdf", mark: "out" },
    { line: "~/Downloads/random-stuff.zip", mark: "out" },
    { line: "~/photos/2025-trip/", mark: "out" },
  ],
  shellOutputCdHome: "han@mac ~ %",
  shellOutputCdPaper: "han@mac pc-esg %",
  shellOutputClaude: [
    "Claude Code v2.1.141",
    "cwd: /Users/han/papers/pc-esg",
    "loading CLAUDE.md ...",
    "loading checkpoint.md ...",
    "Ready.",
  ],
  shellOutputTask: [
    "● Read checkpoint.md: phase 1 produced 26874-obs main_panel.dta",
    "tool_use: read 02_变量字典/测算方法说明.md",
    "tool_use: stata-mcp codebook main_panel.dta",
    "Result: PC_A2 fields aligned. Phase 2 IV/PSM pending.",
  ],
  steps: [
    {
      title: "Initial: Claude Code not yet launched",
      description:
        "Your computer holds many folders: the patient-capital project, other papers, tax documents, downloads, photos. Claude Code has not started; it currently sees nothing.",
    },
    {
      title: "cd into the project folder",
      description:
        "Before launching Claude Code, you cd into the empirical project folder. This step decides Claude's scope. The shell prompt now says pc-esg — you are inside the project.",
    },
    {
      title: "Type claude to start the session",
      description:
        "On launch, Claude Code locks the current directory as the working directory. For the rest of the session, Claude sits inside this folder; anything outside is invisible to it. CLAUDE.md and checkpoint.md auto-load here as well (next page).",
    },
    {
      title: "Claude only sees files inside the project",
      description:
        "Left: every numbered subdir from 01_文献 to 07_论文写作 is reachable by Claude. Right: other papers, tax documents, the downloads folder — Claude cannot see them. The working-directory boundary is a natural safety boundary.",
    },
    {
      title: "Give Claude an empirical task",
      description:
        "You ask: 'read checkpoint.md and verify the PC_A2 field definition'. Claude reads 02_变量字典/, queries stata-mcp for the main_panel.dta codebook, and produces a cross-check report — all within the working directory. Nothing outside the folder is touched.",
    },
    {
      title: "Quit — the project stays put",
      description:
        "After you close Claude Code, the folder content, git history, CLAUDE.md, checkpoint.md, and all the do0–do10 outputs plus the 12 ready tables stay on disk. Tomorrow you cd in and launch again, picking up from here. Claude has no memory of its own — the continuity lives in this folder.",
    },
  ],
};

interface StepState {
  showCdToPaper: boolean;
  showClaudeBoot: boolean;
  showProjectTree: boolean;
  showOutsideTree: boolean;
  highlightScope: boolean;
  showTask: boolean;
  showQuitNote: boolean;
}

const STEP_STATES: StepState[] = [
  { showCdToPaper: false, showClaudeBoot: false, showProjectTree: false, showOutsideTree: false, highlightScope: false, showTask: false, showQuitNote: false },
  { showCdToPaper: true, showClaudeBoot: false, showProjectTree: false, showOutsideTree: false, highlightScope: false, showTask: false, showQuitNote: false },
  { showCdToPaper: true, showClaudeBoot: true, showProjectTree: false, showOutsideTree: false, highlightScope: false, showTask: false, showQuitNote: false },
  { showCdToPaper: true, showClaudeBoot: true, showProjectTree: true, showOutsideTree: true, highlightScope: true, showTask: false, showQuitNote: false },
  { showCdToPaper: true, showClaudeBoot: true, showProjectTree: true, showOutsideTree: true, highlightScope: true, showTask: true, showQuitNote: false },
  { showCdToPaper: true, showClaudeBoot: true, showProjectTree: true, showOutsideTree: true, highlightScope: false, showTask: true, showQuitNote: true },
];

export default function ProjectModeAnimation() {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;

  const {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    isPlaying,
    toggleAutoPlay,
  } = useSteppedVisualization({
    totalSteps: c.steps.length,
    autoPlayInterval: 4200,
  });

  const state = STEP_STATES[currentStep];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {c.title}
      </h2>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]" style={{ minHeight: 480 }}>
          {/* Left: terminal */}
          <div className="flex flex-col rounded-lg border border-zinc-300 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-100 dark:border-zinc-700">
            <div className="mb-2 flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 text-[10px] uppercase tracking-wider text-zinc-500">
                {c.terminalLabel}
              </span>
            </div>

            <div className="flex-1 space-y-1">
              {/* Always: initial prompt */}
              <div className="text-zinc-400">
                <span className="text-emerald-400">{c.promptCwdReady}</span>
              </div>

              {state.showCdToPaper && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div>
                    <span className="text-emerald-400">{c.promptCwdReady}</span>{" "}
                    <span className="text-zinc-100">cd ~/papers/pc-esg</span>
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-emerald-400">{c.promptCwdInProject}</span>
                  </div>
                </motion.div>
              )}

              {state.showClaudeBoot && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div>
                    <span className="text-emerald-400">{c.promptCwdInProject}</span>{" "}
                    <span className="text-zinc-100">claude</span>
                  </div>
                  {c.shellOutputClaude.map((line, i) => (
                    <div key={i} className="text-zinc-400">
                      {line}
                    </div>
                  ))}
                </motion.div>
              )}

              {state.showTask && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mt-2 border-t border-zinc-800 pt-2"
                >
                  <div className="text-zinc-300">
                    <span className="text-blue-300">&gt; </span>
                    {locale === "zh"
                      ? "核一下 references.bib 的引用一致性"
                      : "Audit citation consistency in references.bib"}
                  </div>
                  {c.shellOutputTask.map((line, i) => (
                    <div key={i} className="text-zinc-400">
                      {line}
                    </div>
                  ))}
                </motion.div>
              )}

              {state.showQuitNote && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 border-t border-zinc-800 pt-2 text-zinc-500"
                >
                  <div>
                    <span className="text-emerald-400">{c.shellOutputCdPaper}</span>{" "}
                    <span>exit</span>
                  </div>
                  <div className="text-zinc-600">
                    {locale === "zh"
                      ? "[Claude Code 已退出，audit-citations.md 留在原地]"
                      : "[Claude Code exited; audit-citations.md remains on disk]"}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: filesystem view */}
          <div className="flex flex-col gap-3">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {c.desktopLabel}
            </div>

            {/* Scope box: project files */}
            <div
              className={`rounded-lg border-2 p-3 transition-colors ${
                state.highlightScope
                  ? "border-emerald-400 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/30"
                  : "border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/40"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${state.highlightScope ? "bg-emerald-500" : "bg-zinc-400"}`} />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  {c.scopeLabel}
                </span>
              </div>

              <AnimatePresence>
                {state.showProjectTree && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="font-mono text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-300"
                  >
                    {c.fileTree.map((entry, i) => (
                      <div key={i}>{entry.line}</div>
                    ))}
                  </motion.div>
                )}
                {!state.showProjectTree && (
                  <div className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                    {locale === "zh"
                      ? "（Claude Code 未启动，没有锁定的工作目录）"
                      : "(Claude Code not running; no scope yet)"}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Out of scope box */}
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-100/40 p-3 dark:border-zinc-700 dark:bg-zinc-800/30">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                  {c.outOfScopeLabel}
                </span>
              </div>
              <div className="font-mono text-[10px] leading-relaxed text-zinc-400 line-through dark:text-zinc-600">
                {c.outsideTree.map((entry, i) => (
                  <div key={i}>{entry.line}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <StepControls
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrev={prev}
            onNext={next}
            onReset={reset}
            isPlaying={isPlaying}
            onToggleAutoPlay={toggleAutoPlay}
            stepTitle={c.steps[currentStep].title}
            stepDescription={c.steps[currentStep].description}
          />
        </div>
      </div>
    </section>
  );
}
