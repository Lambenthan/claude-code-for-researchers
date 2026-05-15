"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useLocale } from "@/lib/i18n";

interface MessageBlock {
  id: string;
  label: string;
  color: string;
}

interface Copy {
  title: string;
  parentLabel: string;
  childLabel: string;
  messagesLabel: string;
  childMessagesLabel: string;
  isolation: string;
  notSpawned: string;
  compressing: string;
  discarded: string;
  taskPromptArc: string;
  summaryArc: string;
  cleanContext: string;
  parentBase: MessageBlock[];
  taskPrompt: MessageBlock;
  childWork: MessageBlock[];
  summary: MessageBlock;
  steps: { title: string; description: string }[];
}

const COPY_ZH: Copy = {
  title: "子会话上下文隔离",
  parentLabel: "主会话",
  childLabel: "子会话",
  messagesLabel: "对话历史 messages[]",
  childMessagesLabel: "对话历史（新开一份）",
  isolation: "隔离",
  notSpawned: "尚未启动",
  compressing: "把完整对话压成一段总结 ...",
  discarded: "中间过程已丢弃",
  taskPromptArc: "派单",
  summaryArc: "总结回传",
  cleanContext: "主会话 3 条原对话 + 1 条总结 = 上下文仍然干净",
  parentBase: [
    { id: "p1", label: "user: 8 种 PC 测度并行跑基准回归", color: "bg-blue-500" },
    { id: "p2", label: "assistant: 派 8 个子会话各跑一个口径", color: "bg-zinc-600" },
    { id: "p3", label: "tool_result: 已派 8 个子会话 (A1/A2/A3/A4/B1/B2/C/D)", color: "bg-emerald-500" },
  ],
  taskPrompt: { id: "task", label: "task: 用 PC_A1 经典版跑 reghdfe", color: "bg-purple-500" },
  childWork: [
    { id: "c1", label: "tool_use: 读 02_变量字典 A1 算法说明", color: "bg-amber-500" },
    { id: "c2", label: "tool_use: stata-mcp 跑 reghdfe firm+year FE", color: "bg-amber-500" },
  ],
  summary: { id: "summary", label: "summary: A1 β=0.0018***, t=3.74, 26874 obs", color: "bg-teal-500" },
  steps: [
    { title: "主会话的对话历史", description: "主会话已经累积了一些对话内容。" },
    { title: "派出子会话", description: "用 Task 工具派一个子会话，新开一份空白对话历史，只把任务描述传过去。" },
    { title: "子会话独立工作", description: "子会话有自己的对话历史，看不到主会话的内容。" },
    { title: "压成一段总结", description: "子会话内部几千字的对话被压成一段总结。" },
    { title: "总结回到主会话", description: "只有总结回传，子会话的完整对话被丢弃。" },
    { title: "主会话仍然干净", description: "主会话拿到的是一段简洁总结，没有被中间过程填满。" },
  ],
};

const COPY_EN: Copy = {
  title: "Subagent Context Isolation",
  parentLabel: "Parent Process",
  childLabel: "Child Process",
  messagesLabel: "messages[]",
  childMessagesLabel: "messages[] (fresh)",
  isolation: "ISOLATION",
  notSpawned: "not yet spawned",
  compressing: "Compressing full context into summary...",
  discarded: "context discarded",
  taskPromptArc: "task prompt",
  summaryArc: "summary",
  cleanContext: "3 original + 1 summary = clean context",
  parentBase: [
    { id: "p1", label: "user: run baseline for all 8 PC measures in parallel", color: "bg-blue-500" },
    { id: "p2", label: "assistant: dispatching 8 subagents, one per measure", color: "bg-zinc-600" },
    { id: "p3", label: "tool_result: 8 subagents launched (A1/A2/A3/A4/B1/B2/C/D)", color: "bg-emerald-500" },
  ],
  taskPrompt: { id: "task", label: "task: run reghdfe with PC_A1 classic", color: "bg-purple-500" },
  childWork: [
    { id: "c1", label: "tool_use: read A1 algorithm in variable dict", color: "bg-amber-500" },
    { id: "c2", label: "tool_use: stata-mcp reghdfe firm+year FE", color: "bg-amber-500" },
  ],
  summary: { id: "summary", label: "summary: A1 β=0.0018***, t=3.74, 26874 obs", color: "bg-teal-500" },
  steps: [
    { title: "Parent Context", description: "The parent agent has accumulated messages from the conversation." },
    { title: "Spawn Subagent", description: "Task tool creates a child with fresh messages[]. Only the task description is passed." },
    { title: "Independent Work", description: "The child has its own context. It doesn't see the parent's history." },
    { title: "Compress Result", description: "The child's full conversation compresses into one summary." },
    { title: "Return Summary", description: "Only the summary returns. The child's full context is discarded." },
    { title: "Clean Context", description: "The parent gets a clean summary without context bloat. This is fresh-context isolation via messages[]." },
  ],
};

export default function SubagentIsolation({ title }: { title?: string }) {
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
  } = useSteppedVisualization({ totalSteps: c.steps.length, autoPlayInterval: 2500 });

  const parentMessages: MessageBlock[] = (() => {
    const base = [...c.parentBase];
    if (currentStep >= 5) base.push(c.summary);
    return base;
  })();

  const childMessages: MessageBlock[] = (() => {
    if (currentStep < 1) return [];
    if (currentStep === 1) return [c.taskPrompt];
    if (currentStep === 2) return [c.taskPrompt, ...c.childWork];
    if (currentStep === 3) return [c.summary];
    return currentStep >= 4 ? [c.taskPrompt, ...c.childWork] : [];
  })();

  const showChildEmpty = currentStep === 0;
  const showArcToChild = currentStep === 1;
  const showCompression = currentStep === 3;
  const showArcToParent = currentStep === 4;
  const childDiscarded = currentStep >= 4;
  const childFaded = currentStep >= 4;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>

      <div
        className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
        style={{ minHeight: 500 }}
      >
        <div className="relative flex gap-4" style={{ minHeight: 340 }}>
          <div className="flex-1 rounded-xl border-2 border-blue-300 bg-blue-50/50 p-4 dark:border-blue-700 dark:bg-blue-950/20">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                {c.parentLabel}
              </span>
            </div>
            <div className="mb-2 font-mono text-xs text-zinc-400">
              {c.messagesLabel}
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {parentMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.4, delay: msg.id === "summary" ? 0.3 : 0 }}
                    className={`rounded-lg px-3 py-2 text-xs font-medium text-white shadow-sm ${msg.color}`}
                  >
                    {msg.label}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {currentStep >= 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 rounded border border-blue-200 bg-white/60 px-2 py-1 text-center text-xs text-blue-600 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
              >
                {c.cleanContext}
              </motion.div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-full w-px border-l-2 border-dashed border-zinc-300 dark:border-zinc-600" />
            <motion.div
              animate={{ opacity: currentStep >= 1 && currentStep <= 4 ? 1 : 0.4 }}
              className="rounded bg-zinc-200 px-2 py-1 text-center font-mono text-[10px] text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              {c.isolation}
            </motion.div>
            <div className="h-full w-px border-l-2 border-dashed border-zinc-300 dark:border-zinc-600" />
          </div>

          <div
            className={`flex-1 rounded-xl border-2 p-4 transition-colors duration-300 ${
              showChildEmpty
                ? "border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-600 dark:bg-zinc-800/30"
                : childDiscarded
                  ? "border-zinc-300 bg-zinc-100/50 dark:border-zinc-600 dark:bg-zinc-800/40"
                  : "border-purple-300 bg-purple-50/50 dark:border-purple-700 dark:bg-purple-950/20"
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  showChildEmpty ? "bg-zinc-300 dark:bg-zinc-600" : childDiscarded ? "bg-zinc-400 dark:bg-zinc-500" : "bg-purple-500"
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  showChildEmpty ? "text-zinc-400 dark:text-zinc-500" : childDiscarded ? "text-zinc-400 dark:text-zinc-500" : "text-purple-700 dark:text-purple-300"
                }`}
              >
                {c.childLabel}
              </span>
            </div>
            <div className="mb-2 font-mono text-xs text-zinc-400">
              {c.childMessagesLabel}
            </div>

            {showChildEmpty && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-24 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700"
              >
                <span className="text-xs text-zinc-400">{c.notSpawned}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <AnimatePresence>
                {childMessages.map((msg) => (
                  <motion.div
                    key={msg.id + "-child"}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: childFaded ? 0.3 : 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                    className={`rounded-lg px-3 py-2 text-xs font-medium text-white shadow-sm ${msg.color}`}
                  >
                    {msg.label}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {showCompression && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-center text-xs text-amber-700 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-300"
              >
                {c.compressing}
              </motion.div>
            )}

            {childDiscarded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 rounded border border-red-200 bg-red-50 px-2 py-1 text-center text-xs text-red-500 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
              >
                {c.discarded}
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {showArcToChild && (
              <motion.div
                initial={{ opacity: 0, x: "20%", y: "-10%" }}
                animate={{ opacity: 1, x: "55%", y: "-10%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                className="pointer-events-none absolute left-0 top-0"
                style={{ zIndex: 10 }}
              >
                <div className="rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                  {c.taskPromptArc}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showArcToParent && (
              <motion.div
                initial={{ opacity: 0, x: "75%", y: "60%" }}
                animate={{ opacity: 1, x: "15%", y: "60%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                className="pointer-events-none absolute left-0 top-0"
                style={{ zIndex: 10 }}
              >
                <div className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                  {c.summaryArc}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            stepTitle={c.steps[currentStep].title}
            stepDescription={c.steps[currentStep].description}
          />
        </div>
      </div>
    </section>
  );
}
