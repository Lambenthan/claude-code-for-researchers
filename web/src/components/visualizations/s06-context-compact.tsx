"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useLocale } from "@/lib/i18n";

type BlockType = "user" | "assistant" | "tool_result";

interface ContextBlock {
  id: string;
  type: BlockType;
  label: string;
  tokens: number;
}

const BLOCK_COLORS: Record<BlockType, string> = {
  user: "bg-blue-500",
  assistant: "bg-zinc-500 dark:bg-zinc-600",
  tool_result: "bg-emerald-500",
};

const BLOCK_LABELS: Record<BlockType, string> = {
  user: "USR",
  assistant: "AST",
  tool_result: "TRL",
};

interface Copy {
  title: string;
  contextWindow: string;
  tokenUsage: string;
  oldToolResultsTitle: string;
  oldToolResultsDesc: string;
  microCompactLabel: string;
  microCompactDesc: string;
  autoCompactLabel: string;
  autoCompactDesc: string;
  compactCommandLabel: string;
  compactCommandDesc: string;
  stage1Label: string;
  stage1Tag: string;
  stage2Label: string;
  stage2Tag: string;
  stage3Label: string;
  stage3Tag: string;
  summaryBlockLabel: string;
  compactSummaryLabel: string;
  steps: { title: string; description: string }[];
}

const COPY_ZH: Copy = {
  title: "三层上下文压缩",
  contextWindow: "工作内存",
  tokenUsage: "Token 占用",
  oldToolResultsTitle: "tool_result 是最大块",
  oldToolResultsDesc: "文件内容、命令输出、检索结果——每一条都是几千 token。",
  microCompactLabel: "微压缩",
  microCompactDesc: "旧的 tool_result 被压成小摘要",
  autoCompactLabel: "自动压缩",
  autoCompactDesc: "整段对话被压成一段摘要块",
  compactCommandLabel: "/compact",
  compactCommandDesc: "用户主动触发，最深度压缩",
  stage1Label: "层 1：微压缩——压缩旧的 tool_result",
  stage1Tag: "自动",
  stage2Label: "层 2：自动压缩——总结整段对话",
  stage2Tag: "到阈值时",
  stage3Label: "层 3：/compact——用户触发，最深度压缩",
  stage3Tag: "手动",
  summaryBlockLabel: "摘要",
  compactSummaryLabel: "紧凑摘要",
  steps: [
    {
      title: "phase 1 实证会话开始积累",
      description: "你打开 Claude Code 让它按顺序跑 do0_setup → do1_esg_import → do2_csmar_vars。对话历史从空开始，每次 stata-mcp 返回 Stata log 都让对话多几千字。",
    },
    {
      title: "对话继续增长",
      description: "跑到 do4 拼 main_panel.dta 时，前面几次的 log、变量分布、合并诊断已经堆了几万字。工作内存逐步填满。",
    },
    {
      title: "接近上限",
      description: "旧的 stata-mcp tool_result 是最占空间的部分（codebook、summarize、preserve list）。微压缩优先处理这些。",
    },
    {
      title: "第 1 层：微压缩",
      description: "把旧的 tool_result 替换为简短摘要——比如 codebook 几千行变成 'main_panel.dta 含 26874 obs、3608 firms、64 vars'。自动跑，对模型透明。",
    },
    {
      title: "还在增长",
      description: "phase 2 do7 IV/PSM 上场，工作继续推进，工作内存又开始向阈值靠近 ...",
    },
    {
      title: "第 2 层：自动压缩",
      description: "整段 phase 1 对话被总结成一段紧凑的摘要块——保留 PC_A2 主测度、KZ 替代 WW、26874 obs 等关键决定，丢弃中间 log。在 token 接近阈值时触发。",
    },
    {
      title: "第 3 层：/compact",
      description: "phase 2 结束准备进 phase 3 论文写作时，你主动 /compact 一次，把整套实证 log 压成几百字摘要。三层策略叠加，长任务可以无限推进。",
    },
  ],
};

const COPY_EN: Copy = {
  title: "Three-Layer Context Compression",
  contextWindow: "Context Window",
  tokenUsage: "Token usage",
  oldToolResultsTitle: "tool_results are the largest blocks",
  oldToolResultsDesc: "File contents, command outputs, search results -- each one is thousands of tokens.",
  microCompactLabel: "MICRO-COMPACT",
  microCompactDesc: "Old tool_results shrunk to tiny summaries",
  autoCompactLabel: "AUTO-COMPACT",
  autoCompactDesc: "Full conversation compressed to summary block",
  compactCommandLabel: "/compact",
  compactCommandDesc: "Most aggressive compression -- near-empty context",
  stage1Label: "Stage 1: Micro -- shrink old tool_results",
  stage1Tag: "automatic",
  stage2Label: "Stage 2: Auto -- summarize entire conversation",
  stage2Tag: "at threshold",
  stage3Label: "Stage 3: /compact -- user-triggered, deepest compression",
  stage3Tag: "manual",
  summaryBlockLabel: "SUMMARY",
  compactSummaryLabel: "COMPACT SUMMARY",
  steps: [
    {
      title: "Phase 1 empirical session begins",
      description: "You launch Claude Code and have it run do0_setup → do1_esg_import → do2_csmar_vars. The context starts empty; every stata-mcp call adds thousands of characters of Stata log.",
    },
    {
      title: "Context Growing",
      description: "By the time do4 assembles main_panel.dta, the earlier logs, variable distributions, and merge diagnostics already pile up to tens of thousands of chars. Context fills up.",
    },
    {
      title: "Approaching Limit",
      description: "Old stata-mcp tool_results (codebook, summarize, preserve lists) are the biggest space hogs. Micro-compact targets these first.",
    },
    {
      title: "Stage 1: Micro-Compact",
      description: "Replace old tool_results with short summaries — e.g. a 1000-line codebook becomes 'main_panel.dta has 26874 obs, 3608 firms, 64 vars'. Automatic, transparent to the model.",
    },
    {
      title: "Still Growing",
      description: "Phase 2 do7 IV/PSM kicks in. Context keeps growing toward the threshold ...",
    },
    {
      title: "Stage 2: Auto-Compact",
      description: "The entire Phase 1 conversation is summarized into a compact block — keeping the key decisions (PC_A2 primary measure, KZ replacing WW, 26874 obs) and dropping intermediate logs. Triggered at token threshold.",
    },
    {
      title: "Stage 3: /compact",
      description: "When Phase 2 ends and you're about to start Phase 3 paper writing, you trigger /compact manually. The whole empirical log collapses to a few hundred chars. Three layers of strategic forgetting enable infinite sessions.",
    },
  ],
};

function generateBlocks(count: number, seed: number): ContextBlock[] {
  const types: BlockType[] = ["user", "assistant", "tool_result"];
  const blocks: ContextBlock[] = [];
  for (let i = 0; i < count; i++) {
    const typeIndex = (i + seed) % 3;
    const type = types[typeIndex];
    const tokens = type === "tool_result" ? 4000 + (i % 3) * 1000 : 1500 + (i % 4) * 500;
    blocks.push({
      id: `b-${seed}-${i}`,
      type,
      label: `${BLOCK_LABELS[type]} ${i + 1}`,
      tokens,
    });
  }
  return blocks;
}

const MAX_TOKENS = 100000;
const WINDOW_HEIGHT = 350;

interface StepState {
  blocks: { id: string; type: BlockType; label: string; heightPx: number; compressed?: boolean }[];
  tokenCount: number;
  fillPercent: number;
  compressionLabel: string | null;
}

function computeStepState(step: number, c: Copy): StepState {
  switch (step) {
    case 0: {
      const raw = generateBlocks(8, 0);
      const tokenCount = 30000;
      const totalRawTokens = raw.reduce((a, b) => a + b.tokens, 0);
      const blocks = raw.map((b) => ({
        ...b,
        heightPx: Math.max(16, (b.tokens / totalRawTokens) * WINDOW_HEIGHT * 0.3),
      }));
      return { blocks, tokenCount, fillPercent: 30, compressionLabel: null };
    }
    case 1: {
      const raw = generateBlocks(16, 0);
      const tokenCount = 60000;
      const totalRawTokens = raw.reduce((a, b) => a + b.tokens, 0);
      const blocks = raw.map((b) => ({
        ...b,
        heightPx: Math.max(12, (b.tokens / totalRawTokens) * WINDOW_HEIGHT * 0.6),
      }));
      return { blocks, tokenCount, fillPercent: 60, compressionLabel: null };
    }
    case 2: {
      const raw = generateBlocks(20, 0);
      const tokenCount = 80000;
      const totalRawTokens = raw.reduce((a, b) => a + b.tokens, 0);
      const blocks = raw.map((b) => ({
        ...b,
        heightPx: Math.max(10, (b.tokens / totalRawTokens) * WINDOW_HEIGHT * 0.8),
      }));
      return { blocks, tokenCount, fillPercent: 80, compressionLabel: null };
    }
    case 3: {
      const raw = generateBlocks(20, 0);
      const tokenCount = 60000;
      const totalRawTokens = raw.reduce((a, b) => a + b.tokens, 0);
      const blocks = raw.map((b) => ({
        ...b,
        heightPx:
          b.type === "tool_result"
            ? 6
            : Math.max(12, (b.tokens / totalRawTokens) * WINDOW_HEIGHT * 0.6),
        compressed: b.type === "tool_result",
      }));
      return { blocks, tokenCount, fillPercent: 60, compressionLabel: c.microCompactLabel };
    }
    case 4: {
      const raw = generateBlocks(24, 1);
      const tokenCount = 85000;
      const totalRawTokens = raw.reduce((a, b) => a + b.tokens, 0);
      const blocks = raw.map((b) => ({
        ...b,
        heightPx: Math.max(10, (b.tokens / totalRawTokens) * WINDOW_HEIGHT * 0.85),
      }));
      return { blocks, tokenCount, fillPercent: 85, compressionLabel: null };
    }
    case 5: {
      const tokenCount = 25000;
      const summaryBlock = {
        id: "auto-summary",
        type: "assistant" as BlockType,
        label: c.summaryBlockLabel,
        heightPx: 40,
        compressed: false,
      };
      const recentBlocks = generateBlocks(4, 2).map((b) => ({
        ...b,
        heightPx: 20,
      }));
      return {
        blocks: [summaryBlock, ...recentBlocks],
        tokenCount,
        fillPercent: 25,
        compressionLabel: c.autoCompactLabel,
      };
    }
    case 6: {
      const tokenCount = 8000;
      const compactBlock = {
        id: "compact-summary",
        type: "assistant" as BlockType,
        label: c.compactSummaryLabel,
        heightPx: 24,
        compressed: false,
      };
      return {
        blocks: [compactBlock],
        tokenCount,
        fillPercent: 8,
        compressionLabel: c.compactCommandLabel,
      };
    }
    default:
      return { blocks: [], tokenCount: 0, fillPercent: 0, compressionLabel: null };
  }
}

export default function ContextCompact({ title }: { title?: string }) {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;
  const STEPS = c.steps;

  const {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    isPlaying,
    toggleAutoPlay,
  } = useSteppedVisualization({ totalSteps: STEPS.length, autoPlayInterval: 2500 });

  const state = useMemo(() => computeStepState(currentStep, c), [currentStep, c]);

  const fillColor =
    state.fillPercent > 75 ? "bg-red-500" : state.fillPercent > 45 ? "bg-amber-500" : "bg-emerald-500";

  const tokenDisplay = `${(state.tokenCount / 1000).toFixed(0)}K`;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>

      <div
        className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
        style={{ minHeight: 500 }}
      >
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="mb-2 font-mono text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
              {c.contextWindow}
            </div>
            <div
              className="relative w-24 overflow-hidden rounded-xl border-2 border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800"
              style={{ height: WINDOW_HEIGHT }}
            >
              <div className="absolute bottom-0 left-0 right-0 flex flex-col-reverse gap-px p-1">
                <AnimatePresence mode="popLayout">
                  {state.blocks.map((block) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1, height: block.heightPx }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`flex w-full items-center justify-center rounded-sm ${
                        block.compressed ? "bg-emerald-300 dark:bg-emerald-700" : BLOCK_COLORS[block.type]
                      }`}
                      style={{ originY: 1 }}
                    >
                      {block.heightPx >= 14 && (
                        <span className="truncate px-1 text-[8px] font-medium text-white">
                          {block.label}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.div
                animate={{ bottom: `${state.fillPercent}%` }}
                transition={{ duration: 0.5 }}
                className="absolute left-0 right-0 border-t-2 border-dashed border-red-400 dark:border-red-500"
              >
                <span className="absolute -top-4 right-1 font-mono text-[9px] font-bold text-red-500 dark:text-red-400">
                  {state.fillPercent}%
                </span>
              </motion.div>
            </div>

            <motion.div
              key={state.tokenCount}
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              className="mt-2 font-mono text-sm font-bold text-zinc-700 dark:text-zinc-200"
            >
              {tokenDisplay}
            </motion.div>
            <div className="font-mono text-[10px] text-zinc-400">/ 100K</div>
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {c.tokenUsage}
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  {state.tokenCount.toLocaleString()} / {MAX_TOKENS.toLocaleString()}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <motion.div
                  animate={{ width: `${state.fillPercent}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${fillColor}`}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-blue-500" />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">user</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-zinc-500" />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-emerald-500" />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">tool_result</span>
              </div>
            </div>

            <AnimatePresence>
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 dark:border-amber-700 dark:bg-amber-900/20"
                >
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {c.oldToolResultsTitle}
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400">
                    {c.oldToolResultsDesc}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {state.compressionLabel && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4"
                >
                  <div
                    className={`rounded-lg border-2 p-4 text-center ${
                      currentStep === 3
                        ? "border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/20"
                        : currentStep === 5
                          ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                          : "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20"
                    }`}
                  >
                    <div
                      className={`text-lg font-black ${
                        currentStep === 3
                          ? "text-amber-600 dark:text-amber-300"
                          : currentStep === 5
                            ? "text-blue-600 dark:text-blue-300"
                            : "text-emerald-600 dark:text-emerald-300"
                      }`}
                    >
                      {state.compressionLabel}
                    </div>
                    <div
                      className={`mt-1 text-xs ${
                        currentStep === 3
                          ? "text-amber-500 dark:text-amber-400"
                          : currentStep === 5
                            ? "text-blue-500 dark:text-blue-400"
                            : "text-emerald-500 dark:text-emerald-400"
                      }`}
                    >
                      {currentStep === 3 && c.microCompactDesc}
                      {currentStep === 5 && c.autoCompactDesc}
                      {currentStep === 6 && c.compactCommandDesc}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {currentStep === 6 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 space-y-2"
              >
                <div className="flex items-center gap-2 rounded bg-amber-50 px-3 py-1.5 dark:bg-amber-900/10">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-amber-700 dark:text-amber-300">{c.stage1Label}</span>
                  <span className="ml-auto font-mono text-[10px] text-amber-500">{c.stage1Tag}</span>
                </div>
                <div className="flex items-center gap-2 rounded bg-blue-50 px-3 py-1.5 dark:bg-blue-900/10">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-blue-700 dark:text-blue-300">{c.stage2Label}</span>
                  <span className="ml-auto font-mono text-[10px] text-blue-500">{c.stage2Tag}</span>
                </div>
                <div className="flex items-center gap-2 rounded bg-emerald-50 px-3 py-1.5 dark:bg-emerald-900/10">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-emerald-700 dark:text-emerald-300">{c.stage3Label}</span>
                  <span className="ml-auto font-mono text-[10px] text-emerald-500">{c.stage3Tag}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <StepControls
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrev={prev}
            onNext={next}
            onReset={reset}
            isPlaying={isPlaying}
            onToggleAutoPlay={toggleAutoPlay}
            stepTitle={STEPS[currentStep].title}
            stepDescription={STEPS[currentStep].description}
          />
        </div>
      </div>
    </section>
  );
}
