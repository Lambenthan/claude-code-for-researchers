"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useSvgPalette } from "@/hooks/useDarkMode";
import { useLocale } from "@/lib/i18n";

interface ToolDef {
  name: string;
  desc: string;
}

interface Copy {
  title: string;
  incoming: string;
  waiting: string;
  allActive: string;
  tools: ToolDef[];
  requests: (string | null)[];
  steps: { title: string; desc: string }[];
}

const COPY_ZH: Copy = {
  title: "工具调度对照表",
  incoming: "进来的请求：",
  waiting: "等待 tool_call ...",
  allActive: "全部工具就绪",
  tools: [
    { name: "read", desc: "读文件内容" },
    { name: "bash", desc: "跑 shell 命令" },
    { name: "grep", desc: "全文搜索" },
    { name: "write", desc: "写审计报告" },
  ],
  requests: [
    '{ name: "read", input: { path: "chapters/ch3.tex" } }',
    '{ name: "read", input: { path: "chapters/ch3.tex" } }',
    '{ name: "bash", input: { cmd: "pdftotext fig3-1.pdf" } }',
    '{ name: "grep", input: { pattern: "因变量" } }',
    '{ name: "write", input: { path: "audit-term.md" } }',
    null,
  ],
  steps: [
    { title: "请求进来", desc: "你说'核对 chap3.tex 方法部分和图 3-1 的标签是否对得上'。背后涉及读正文、抽 PDF、搜词、写报告几种操作。第一个 tool_use 请求送到调度器：让 read 看 chap3.tex。" },
    { title: "路由到 read", desc: "请求里 name 字段是 read，调度器去对照表里找 run_read 函数，按 input 跑。" },
    { title: "路由到 bash", desc: "图是 PDF，模型切换到 bash 调 pdftotext 把里面文字抽出来。同样的对照表，不同的执行函数。" },
    { title: "路由到 grep", desc: "模型用 grep 扫全文找'因变量'出现位置。每个工具最后都返回一个 tool_result，加进对话历史。" },
    { title: "路由到 write", desc: "对照完成后用 write 把不一致清单落成一份 audit-term.md。加新工具的代价就是在对照表里加一行。" },
    { title: "核心要点", desc: "while 循环保持不变。新工具进来就是对照表多一行——模型自己学会什么时候调用它。" },
  ],
};

const COPY_EN: Copy = {
  title: "Tool Dispatch Map",
  incoming: "Incoming:",
  waiting: "waiting for tool_call...",
  allActive: "All routes active",
  tools: [
    { name: "bash", desc: "Execute shell commands" },
    { name: "read_file", desc: "Read file contents" },
    { name: "grep", desc: "Search across files" },
    { name: "write_file", desc: "Write an audit report" },
  ],
  requests: [
    '{ name: "read", input: { path: "chapters/ch3.tex" } }',
    '{ name: "read", input: { path: "chapters/ch3.tex" } }',
    '{ name: "bash", input: { cmd: "pdftotext fig3-1.pdf" } }',
    '{ name: "grep", input: { pattern: "dependent variable" } }',
    '{ name: "write_file", input: { path: "audit-term.md" } }',
    null,
  ],
  steps: [
    { title: "A request comes in", desc: "You ask: 'check whether chap3.tex methodology matches the labels in figure 3-1'. That single instruction will route through read, bash, grep, and write. First tool_use: read chap3.tex." },
    { title: "Route: read", desc: "tool_call.name = 'read'. The dispatcher looks up run_read in the table and runs it with the given input." },
    { title: "Route: bash", desc: "The figure is a PDF. The model switches to bash to run pdftotext and extract the figure's text. Same table, different handler." },
    { title: "Route: grep", desc: "Model uses grep to find every 'dependent variable' occurrence. Each tool returns a tool_result that joins the conversation." },
    { title: "Route: write_file", desc: "After the comparison, write_file drops the mismatched list into audit-term.md. Adding a new tool = adding one entry to the dispatch map." },
    { title: "The key insight", desc: "The while loop stays the same. You only grow the dispatch map. The model learns when to invoke each tool from training." },
  ],
};

const ACTIVE_TOOL_PER_STEP: number[] = [-1, 0, 1, 2, 3, 4];
const SVG_WIDTH = 600;
const SVG_HEIGHT = 320;
const DISPATCHER_X = SVG_WIDTH / 2;
const DISPATCHER_Y = 60;
const DISPATCHER_W = 160;
const DISPATCHER_H = 50;
const CARD_Y = 230;
const CARD_W = 110;
const CARD_H = 65;
const CARD_GAP = 20;

function getCardX(toolsLen: number, index: number): number {
  const totalWidth = toolsLen * CARD_W + (toolsLen - 1) * CARD_GAP;
  const startX = (SVG_WIDTH - totalWidth) / 2;
  return startX + index * (CARD_W + CARD_GAP) + CARD_W / 2;
}

export default function ToolDispatch({ title }: { title?: string }) {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;
  const TOOLS = c.tools;

  const {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    isPlaying,
    toggleAutoPlay,
  } = useSteppedVisualization({ totalSteps: 6, autoPlayInterval: 2500 });

  const palette = useSvgPalette();
  const activeToolIdx = ACTIVE_TOOL_PER_STEP[currentStep];
  const request = c.requests[currentStep];
  const stepInfo = c.steps[currentStep];
  const isAllActive = activeToolIdx === 4;

  return (
    <section className="min-h-[500px] space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex min-h-[32px] items-center gap-2">
          <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {c.incoming}
          </span>
          <AnimatePresence mode="wait">
            {request && (
              <motion.code
                key={request}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
                className="rounded bg-blue-100 px-2.5 py-1 font-mono text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
              >
                {request}
              </motion.code>
            )}
            {!request && currentStep === 0 && (
              <motion.span
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="text-xs text-zinc-400 dark:text-zinc-600"
              >
                {c.waiting}
              </motion.span>
            )}
            {isAllActive && (
              <motion.span
                key="all-routes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400"
              >
                {c.allActive}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full rounded-md border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
          style={{ minHeight: 240 }}
        >
          <defs>
            <filter id="dispatch-glow">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.6" />
            </filter>
            <filter id="card-glow-orange">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f97316" floodOpacity="0.6" />
            </filter>
            <filter id="card-glow-sky">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#0ea5e9" floodOpacity="0.6" />
            </filter>
            <filter id="card-glow-emerald">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.6" />
            </filter>
            <filter id="card-glow-violet">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#8b5cf6" floodOpacity="0.6" />
            </filter>
            <marker id="dispatch-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={palette.activeEdgeStroke} />
            </marker>
            <marker id="dispatch-arrow-dim" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={palette.arrowFill} />
            </marker>
          </defs>

          <motion.rect
            x={DISPATCHER_X - DISPATCHER_W / 2}
            y={DISPATCHER_Y - DISPATCHER_H / 2}
            width={DISPATCHER_W}
            height={DISPATCHER_H}
            rx={10}
            strokeWidth={2}
            animate={{
              fill: currentStep > 0 ? palette.activeNodeFill : palette.nodeFill,
              stroke: currentStep > 0 ? palette.activeNodeStroke : palette.nodeStroke,
            }}
            filter={currentStep > 0 ? "url(#dispatch-glow)" : "none"}
            transition={{ duration: 0.4 }}
          />
          <motion.text
            x={DISPATCHER_X}
            y={DISPATCHER_Y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight={700}
            fontFamily="monospace"
            animate={{ fill: currentStep > 0 ? palette.activeNodeText : palette.nodeText }}
            transition={{ duration: 0.4 }}
          >
            dispatch(name)
          </motion.text>

          {TOOLS.map((tool, i) => {
            const cardX = getCardX(TOOLS.length, i);
            const isActive = isAllActive || i === activeToolIdx;
            const lineColor = isActive ? palette.activeEdgeStroke : palette.edgeStroke;
            return (
              <motion.line
                key={`line-${tool.name}`}
                x1={DISPATCHER_X}
                y1={DISPATCHER_Y + DISPATCHER_H / 2}
                x2={cardX}
                y2={CARD_Y - CARD_H / 2}
                strokeWidth={isActive ? 2.5 : 1.5}
                markerEnd={isActive ? "url(#dispatch-arrow)" : "url(#dispatch-arrow-dim)"}
                animate={{ stroke: lineColor, strokeWidth: isActive ? 2.5 : 1.5 }}
                transition={{ duration: 0.4 }}
              />
            );
          })}

          {TOOLS.map((tool, i) => {
            const cardX = getCardX(TOOLS.length, i);
            const isActive = isAllActive || i === activeToolIdx;
            const glowFilters = ["url(#card-glow-orange)", "url(#card-glow-sky)", "url(#card-glow-emerald)", "url(#card-glow-violet)"];
            const activeColors = ["#f97316", "#0ea5e9", "#10b981", "#8b5cf6"];
            const activeBorders = ["#ea580c", "#0284c7", "#059669", "#7c3aed"];
            return (
              <g key={tool.name}>
                <motion.rect
                  x={cardX - CARD_W / 2}
                  y={CARD_Y - CARD_H / 2}
                  width={CARD_W}
                  height={CARD_H}
                  rx={8}
                  strokeWidth={2}
                  animate={{
                    fill: isActive ? activeColors[i] : palette.nodeFill,
                    stroke: isActive ? activeBorders[i] : palette.nodeStroke,
                  }}
                  filter={isActive ? glowFilters[i] : "none"}
                  transition={{ duration: 0.4 }}
                />
                <motion.text
                  x={cardX}
                  y={CARD_Y - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="monospace"
                  animate={{ fill: isActive ? "#ffffff" : palette.nodeText }}
                  transition={{ duration: 0.4 }}
                >
                  {tool.name}
                </motion.text>
                <motion.text
                  x={cardX}
                  y={CARD_Y + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={8}
                  fontFamily="sans-serif"
                  animate={{ fill: isActive ? "rgba(255,255,255,0.8)" : palette.labelFill }}
                  transition={{ duration: 0.4 }}
                >
                  {tool.desc}
                </motion.text>
              </g>
            );
          })}

          {isAllActive && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <circle
                cx={getCardX(TOOLS.length, 3) + CARD_W / 2 + 30}
                cy={CARD_Y}
                r={16}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
              <text
                x={getCardX(TOOLS.length, 3) + CARD_W / 2 + 30}
                y={CARD_Y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={18}
                fontWeight={700}
                fill="#3b82f6"
              >
                +
              </text>
            </motion.g>
          )}
        </svg>

        <div className="mt-3 rounded-md bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
          <code className="block font-mono text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            <span className="text-blue-600 dark:text-blue-400">const</span> handlers = {"{"}
            {TOOLS.map((tool, i) => {
              const isActive = isAllActive || i === activeToolIdx;
              return (
                <motion.span
                  key={tool.name}
                  animate={{
                    color: isActive ? "#3b82f6" : undefined,
                    fontWeight: isActive ? 700 : 400,
                  }}
                  className="text-zinc-600 dark:text-zinc-300"
                >
                  {" "}{tool.name},
                </motion.span>
              );
            })}
            {" }{"}{"}"};
          </code>
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
