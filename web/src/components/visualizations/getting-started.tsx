"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useLocale } from "@/lib/i18n";

type LineType =
  | "shell_command"
  | "shell_output"
  | "cc_user"
  | "cc_assistant"
  | "cc_assistant_cont"
  | "cc_status";

interface TerminalLine {
  type: LineType;
  text: string;
}

interface Copy {
  title: string;
  shellWindowTitle: string;
  ccVersion: string;
  ccModel: string;
  ccCwd: string;
  ccProjectLabel: string;
  ccContextLabel: string;
  ccUsageLabel: string;
  ccWeeklyLabel: string;
  ccUsageReset: string;
  ccWeeklyReset: string;
  ccBypassLabel: string;
  linesPerStep: TerminalLine[][];
  steps: { title: string; desc: string }[];
}

const COPY_ZH: Copy = {
  title: "5 分钟从零到第一句对话",
  shellWindowTitle: "Terminal",
  ccVersion: "Claude Code v2.1.141",
  ccModel: "Opus 4.7 (1M context) with xhigh effort · Claude Max",
  ccCwd: "~/papers/pc-esg",
  ccProjectLabel: "pc-esg",
  ccContextLabel: "Context",
  ccUsageLabel: "Usage",
  ccWeeklyLabel: "Weekly",
  ccUsageReset: "resets in 4h 59m",
  ccWeeklyReset: "resets in 2d 14h",
  ccBypassLabel: "bypass permissions on (shift+tab to cycle)",
  linesPerStep: [
    [],
    [
      { type: "shell_command", text: "npm install -g @anthropic-ai/claude-code" },
      { type: "shell_output", text: "added 87 packages in 12s" },
    ],
    [{ type: "shell_command", text: "cd ~/papers/pc-esg" }],
    [{ type: "shell_command", text: "claude" }],
    [],
    [{ type: "cc_user", text: "列一下 04_中间数据 里有哪些 .dta" }],
    [
      { type: "cc_assistant", text: "我用 Bash 跑了一下 ls 04_中间数据/*.dta" },
      { type: "cc_assistant_cont", text: "  csmar_panel.dta  esg_annual.dta  main_panel.dta" },
      { type: "cc_assistant_cont", text: "  myopia_mda.dta  熵值法汇总.dta  耐心资本_七合一_WZY.dta" },
      { type: "cc_assistant_cont", text: "找到 6 份中间数据。接下来要看哪一份的 codebook？" },
      { type: "cc_status", text: "Churned for 3s" },
    ],
  ],
  steps: [
    { title: "打开终端", desc: "Mac 上是 Terminal.app，Windows 上是 PowerShell。任意目录里打开都可以。" },
    { title: "装上 Claude Code", desc: "一行 npm 命令。需要先有 Node.js 18 或更新版本，Mac 用户可以 brew install node。" },
    { title: "切到项目目录", desc: "Claude Code 在工作目录里跑，cd 到你的实证项目文件夹再启动。这里以 ~/papers/pc-esg 为例。" },
    { title: "敲 claude 命令", desc: "输入 claude 进入交互模式，shell 即将被 Claude Code 接管。CLAUDE.md 同时在这一步自动加载。" },
    { title: "Claude Code 启动", desc: "终端变成 Claude Code 的界面：顶部是版本与项目信息，底部是输入框。" },
    { title: "第一句指令", desc: "在 › 提示符后输入指令、回车。先从简单的开始，比如让它列一下中间数据目录里的 .dta 文件。" },
    { title: "拿到回应", desc: "Claude Code 调 Bash 列出文件，回到对话窗口里。接下来按 do0 → do10 的顺序一句一句往下推。" },
  ],
};

const COPY_EN: Copy = {
  title: "From zero to your first message in 5 minutes",
  shellWindowTitle: "Terminal",
  ccVersion: "Claude Code v2.1.141",
  ccModel: "Opus 4.7 (1M context) with xhigh effort · Claude Max",
  ccCwd: "~/papers/pc-esg",
  ccProjectLabel: "pc-esg",
  ccContextLabel: "Context",
  ccUsageLabel: "Usage",
  ccWeeklyLabel: "Weekly",
  ccUsageReset: "resets in 4h 59m",
  ccWeeklyReset: "resets in 2d 14h",
  ccBypassLabel: "bypass permissions on (shift+tab to cycle)",
  linesPerStep: [
    [],
    [
      { type: "shell_command", text: "npm install -g @anthropic-ai/claude-code" },
      { type: "shell_output", text: "added 87 packages in 12s" },
    ],
    [{ type: "shell_command", text: "cd ~/papers/pc-esg" }],
    [{ type: "shell_command", text: "claude" }],
    [],
    [{ type: "cc_user", text: "List the .dta files under 04_中间数据/" }],
    [
      { type: "cc_assistant", text: "I ran ls 04_中间数据/*.dta for you." },
      { type: "cc_assistant_cont", text: "  csmar_panel.dta  esg_annual.dta  main_panel.dta" },
      { type: "cc_assistant_cont", text: "  myopia_mda.dta  熵值法汇总.dta  耐心资本_七合一_WZY.dta" },
      { type: "cc_assistant_cont", text: "Found 6 intermediate datasets. Which codebook should I show first?" },
      { type: "cc_status", text: "Churned for 3s" },
    ],
  ],
  steps: [
    { title: "Open a terminal", desc: "Terminal.app on Mac, PowerShell on Windows. Any folder is fine." },
    { title: "Install Claude Code", desc: "One npm command. You need Node.js 18 or newer first; Mac: brew install node." },
    { title: "Switch to the project folder", desc: "Claude Code runs from a working directory. cd into your empirical project folder — here we use ~/papers/pc-esg as the example." },
    { title: "Run claude", desc: "Type claude to enter the interactive prompt. CLAUDE.md is also auto-loaded at this step." },
    { title: "Claude Code is up", desc: "The terminal transforms into Claude Code's UI: version + project info on top, input bar at the bottom." },
    { title: "Send a message", desc: "Type after the › prompt, hit return. Start small — ask it to list the .dta files under intermediate data." },
    { title: "Read the reply", desc: "Claude Code runs Bash to list files, then replies in the conversation. From here you can step through do0 → do10 in order." },
  ],
};

const LINE_GAP_MS = 160;

interface TypingProfile {
  instant: boolean;
  baseSpeed: number; // ms per char
  variance: number; // ± ms randomly
  pauseAtSpace: number; // extra ms after a space
  pauseAtPunct: number; // extra ms after punctuation
}

const TYPING_PROFILES: Record<LineType, TypingProfile> = {
  // Human typing in shell: average ~60ms/char with notable variance and
  // small pauses at spaces — feels like real keyboard rhythm.
  shell_command: { instant: false, baseSpeed: 58, variance: 32, pauseAtSpace: 90, pauseAtPunct: 120 },
  // Shell output appears instantly when the command finishes.
  shell_output: { instant: true, baseSpeed: 0, variance: 0, pauseAtSpace: 0, pauseAtPunct: 0 },
  // Composing a message: slightly slower because the human is thinking.
  cc_user: { instant: false, baseSpeed: 70, variance: 40, pauseAtSpace: 110, pauseAtPunct: 160 },
  // LLM streaming: fast and steady, like Claude's actual token stream.
  cc_assistant: { instant: false, baseSpeed: 17, variance: 6, pauseAtSpace: 12, pauseAtPunct: 60 },
  cc_assistant_cont: { instant: false, baseSpeed: 17, variance: 6, pauseAtSpace: 12, pauseAtPunct: 60 },
  // Status indicator appears all at once.
  cc_status: { instant: true, baseSpeed: 0, variance: 0, pauseAtSpace: 0, pauseAtPunct: 0 },
};

const PUNCT_RE = /[.,!?;:。，！？；：、]/;

function estimateLineDuration(line: TerminalLine): number {
  const p = TYPING_PROFILES[line.type];
  if (p.instant) return 120;
  const spaces = (line.text.match(/ /g) || []).length;
  const puncts = (line.text.match(PUNCT_RE) || []).length;
  return line.text.length * p.baseSpeed + spaces * p.pauseAtSpace * 0.6 + puncts * p.pauseAtPunct * 0.6;
}

interface LineProps {
  line: TerminalLine;
  startDelay: number;
  animate: boolean;
  showCursorWhenDone: boolean;
}

function TypewriterLine({ line, startDelay, animate, showCursorWhenDone }: LineProps) {
  const profile = TYPING_PROFILES[line.type];
  const [progress, setProgress] = useState(animate && !profile.instant ? 0 : line.text.length);

  useEffect(() => {
    if (!animate) {
      setProgress(line.text.length);
      return;
    }
    if (profile.instant) {
      // Instant line: wait for startDelay then snap to full text.
      const t = setTimeout(() => setProgress(line.text.length), startDelay);
      return () => clearTimeout(t);
    }

    setProgress(0);
    let cancelled = false;
    let currentIdx = 0;

    const typeNext = () => {
      if (cancelled || currentIdx >= line.text.length) return;
      currentIdx += 1;
      setProgress(currentIdx);
      if (currentIdx >= line.text.length) return;

      const justTyped = line.text[currentIdx - 1];
      let delay = profile.baseSpeed + (Math.random() * 2 - 1) * profile.variance;
      if (justTyped === " ") delay += profile.pauseAtSpace;
      if (PUNCT_RE.test(justTyped)) delay += profile.pauseAtPunct;
      delay = Math.max(8, delay);
      setTimeout(typeNext, delay);
    };

    const startTimer = setTimeout(typeNext, startDelay);
    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [line.text, line.type, animate, startDelay, profile.instant, profile.baseSpeed, profile.variance, profile.pauseAtSpace, profile.pauseAtPunct]);

  const isDone = progress >= line.text.length;
  const showCursor = animate && (!isDone || showCursorWhenDone);
  const visible = line.text.substring(0, progress);

  if (line.type === "shell_command") {
    return (
      <div className="text-zinc-200">
        <span className="text-zinc-500">$ </span>
        <span className="text-emerald-300">{visible}</span>
        {showCursor && <BlinkingCursor />}
      </div>
    );
  }

  if (line.type === "shell_output") {
    return (
      <div className="text-zinc-400">
        {visible}
        {showCursor && <BlinkingCursor />}
      </div>
    );
  }

  if (line.type === "cc_user") {
    return (
      <div className="-mx-3 mb-1 mt-2 rounded bg-zinc-800/70 px-3 py-1">
        <span className="text-zinc-500">› </span>
        <span className="text-zinc-100">{visible}</span>
        {showCursor && <BlinkingCursor />}
      </div>
    );
  }

  if (line.type === "cc_assistant") {
    return (
      <div className="mt-2 text-zinc-200">
        <span className="text-emerald-400">● </span>
        {visible}
        {showCursor && <BlinkingCursor />}
      </div>
    );
  }

  if (line.type === "cc_assistant_cont") {
    return (
      <div className="text-zinc-300">
        <span className="opacity-0">● </span>
        {visible}
        {showCursor && <BlinkingCursor />}
      </div>
    );
  }

  if (line.type === "cc_status") {
    return (
      <div className="mt-1 text-zinc-500">
        <span className="text-emerald-500">✻ </span>
        {visible}
        {showCursor && <BlinkingCursor />}
      </div>
    );
  }

  return null;
}

function BlinkingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.9, repeat: Infinity }}
      className="ml-px text-zinc-400"
    >
      ▌
    </motion.span>
  );
}

function ClaudeMascot() {
  // Stylized pixel mascot inspired by Claude Code's terminal logo
  return (
    <div className="grid shrink-0 grid-cols-5 gap-px font-mono leading-none">
      {[
        [0, 1, 1, 1, 0],
        [1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0],
      ].flatMap((row, ri) =>
        row.map((cell, ci) => (
          <span
            key={`${ri}-${ci}`}
            className={`h-1.5 w-1.5 ${cell ? "bg-orange-400" : ""}`}
          />
        ))
      )}
    </div>
  );
}

function ClaudeCodeHeader({ c }: { c: Copy }) {
  return (
    <div className="mb-3 flex items-start gap-3 pb-2">
      <ClaudeMascot />
      <div className="flex-1 space-y-0.5">
        <div className="text-sm font-semibold text-zinc-100">{c.ccVersion}</div>
        <div className="text-xs text-zinc-400">{c.ccModel}</div>
        <div className="text-xs text-zinc-500">{c.ccCwd}</div>
      </div>
    </div>
  );
}

function ClaudeCodeBottomBar({ c }: { c: Copy }) {
  return (
    <div className="mt-4 space-y-1 border-t border-zinc-800 pt-3 text-[10px] leading-tight">
      <div>
        <span className="text-zinc-500">› </span>
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          className="inline-block h-3 w-1.5 align-middle bg-zinc-300"
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-zinc-500">
        <span className="text-zinc-400">[Opus 4.7 (1M context)]</span>
        <span className="text-zinc-700">|</span>
        <span className="text-blue-400 underline-offset-2">{c.ccProjectLabel}</span>
        <span className="flex items-center gap-1">
          {c.ccContextLabel}{" "}
          <span className="inline-block h-1.5 w-12 overflow-hidden rounded-sm bg-zinc-800">
            <span className="block h-full w-[4%] bg-amber-400" />
          </span>
          <span className="text-amber-400">4%</span>
        </span>
        <span className="flex items-center gap-1">
          {c.ccUsageLabel}{" "}
          <span className="inline-block h-1.5 w-12 overflow-hidden rounded-sm bg-zinc-800">
            <span className="block h-full w-[2%] bg-blue-400" />
          </span>
          <span className="text-blue-400">0%</span>
          <span className="text-zinc-600">({c.ccUsageReset})</span>
        </span>
        <span className="flex items-center gap-1">
          {c.ccWeeklyLabel}{" "}
          <span className="inline-block h-1.5 w-12 overflow-hidden rounded-sm bg-zinc-800">
            <span className="block h-full w-[45%] bg-blue-400" />
          </span>
          <span className="text-blue-400">45%</span>
          <span className="text-zinc-600">({c.ccWeeklyReset})</span>
        </span>
      </div>
      <div className="text-rose-400">»» {c.ccBypassLabel}</div>
    </div>
  );
}

export default function GettingStartedAnimation() {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;
  const STEPS = c.steps;
  const CC_FROM_STEP = 4;

  const {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    isPlaying,
    toggleAutoPlay,
  } = useSteppedVisualization({ totalSteps: STEPS.length, autoPlayInterval: 5200 });

  const inClaudeCode = currentStep >= CC_FROM_STEP;

  // Accumulate visible lines from the appropriate origin.
  // - In shell mode (steps 0-3): accumulate steps 0 through current.
  // - In Claude Code mode (steps 4+): only accumulate steps from CC_FROM_STEP onward
  //   (so the previous shell content is replaced by the Claude Code UI).
  const visibleLines: {
    line: TerminalLine;
    key: string;
    animate: boolean;
    startDelay: number;
    isLastOfCurrent: boolean;
  }[] = [];

  const accumulateFrom = inClaudeCode ? CC_FROM_STEP : 0;
  for (let s = accumulateFrom; s <= currentStep; s++) {
    const stepLines = c.linesPerStep[s];
    const isCurrent = s === currentStep;
    let cumulativeDelay = 0;
    stepLines.forEach((line, i) => {
      const isLastOfCurrent = isCurrent && i === stepLines.length - 1;
      visibleLines.push({
        line,
        key: `${s}-${i}`,
        animate: isCurrent,
        startDelay: isCurrent ? cumulativeDelay : 0,
        isLastOfCurrent,
      });
      if (isCurrent) {
        cumulativeDelay += estimateLineDuration(line) + LINE_GAP_MS;
      }
    });
  }

  const stepInfo = STEPS[currentStep];
  const isEmptyShell = !inClaudeCode && visibleLines.length === 0;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {c.title}
      </h2>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
          <span className="ml-3 font-mono text-xs text-zinc-500">
            {inClaudeCode ? c.ccVersion : `${c.shellWindowTitle} — ${c.ccCwd}`}
          </span>
        </div>

        <div className="flex flex-col p-4 font-mono text-sm leading-relaxed" style={{ minHeight: 380 }}>
          {inClaudeCode && <ClaudeCodeHeader c={c} />}

          <div className="flex-1">
            {isEmptyShell && (
              <div className="text-zinc-300">
                <span className="text-zinc-500">$ </span>
                <BlinkingCursor />
              </div>
            )}
            {visibleLines.map((entry) => (
              <TypewriterLine
                key={entry.key}
                line={entry.line}
                startDelay={entry.startDelay}
                animate={entry.animate}
                showCursorWhenDone={entry.isLastOfCurrent}
              />
            ))}
          </div>

          {inClaudeCode && <ClaudeCodeBottomBar c={c} />}
        </div>
      </div>

      <StepControls
        currentStep={currentStep}
        totalSteps={totalSteps}
        onPrev={prev}
        onNext={next}
        onReset={reset}
        isPlaying={isPlaying}
        onToggleAutoPlay={toggleAutoPlay}
        stepTitle={stepInfo.title}
        stepDescription={stepInfo.desc}
      />
    </section>
  );
}
