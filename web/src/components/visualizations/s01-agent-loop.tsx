"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useSvgPalette } from "@/hooks/useDarkMode";
import { useLocale } from "@/lib/i18n";

interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "rect" | "diamond";
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

interface MessageBlock {
  role: string;
  detail: string;
  colorClass: string;
}

interface Copy {
  title: string;
  whileHeader: string;
  messagesHeader: string;
  empty: string;
  lengthLabel: string;
  iter2Label: string;
  nodes: Record<string, string>;
  edgeLabels: { tool_use: string; end_turn: string };
  messagesPerStep: (MessageBlock | null)[][];
  stepInfo: { title: string; desc: string }[];
}

const COPY_ZH: Copy = {
  title: "主循环",
  whileHeader: 'while (stop_reason === "tool_use")',
  messagesHeader: "对话历史 messages[]",
  empty: "[ 空 ]",
  lengthLabel: "长度",
  iter2Label: "第 2 轮",
  nodes: {
    start: "开始",
    api_call: "调模型",
    check: "stop_reason?",
    execute: "执行工具",
    append: "结果回流",
    end: "退出循环",
  },
  edgeLabels: { tool_use: "调工具", end_turn: "无工具" },
  messagesPerStep: [
    [{ role: "user", detail: "按 CLAUDE.md 第二节保护清单审计 07_论文写作 下的术语混用", colorClass: "bg-blue-500 dark:bg-blue-600" }],
    [],
    [],
    [{ role: "assistant", detail: "tool_use: grep '耐心资本' 07_论文写作/", colorClass: "bg-zinc-600 dark:bg-zinc-500" }],
    [{ role: "tool_result", detail: "ch1.tex:47, ch2.tex:118, ch3.tex:23 ...", colorClass: "bg-emerald-500 dark:bg-emerald-600" }],
    [
      { role: "assistant", detail: "tool_use: grep '长期资本\\|长线资金' 07_论文写作/", colorClass: "bg-zinc-600 dark:bg-zinc-500" },
      { role: "tool_result", detail: "ch2.tex:42 '长期资本', ch4.tex:88 '长线资金' ...", colorClass: "bg-emerald-500 dark:bg-emerald-600" }
    ],
    [{ role: "assistant", detail: "end_turn: audit-protected-terms.md 已落盘", colorClass: "bg-purple-500 dark:bg-purple-600" }],
  ],
  stepInfo: [
    { title: "用户给一句审计指令", desc: "你说'按 CLAUDE.md 保护清单扫一下耐心资本是否被替换'。这句话作为 user 消息进入对话历史，循环从这里开始。" },
    { title: "循环启动", desc: "Claude Code 进入主循环。读取对话历史，准备发给模型。" },
    { title: "调模型", desc: "把含你指令的对话内容整份发给模型。模型决定下一步该做什么。" },
    { title: "stop_reason: tool_use", desc: "模型选择先用 grep 扫一遍 07_论文写作 找出所有'耐心资本'的位置。" },
    { title: "工具结果回流", desc: "grep 找到 14 处保护词原文位置，结果加进对话历史。下一轮模型能看到这份清单。" },
    { title: "再来一轮 · 扫禁用同义词", desc: "模型再扫一次'长期资本''长线资金'等被禁同义词的位置。两份清单一起进对话历史。" },
    { title: "stop_reason: end_turn", desc: "模型把保护词原文与混用位置写成 audit-protected-terms.md 给你看，由你决定是否统一回保护词。模型不再调工具，循环退出。" },
  ],
};

const COPY_EN: Copy = {
  title: "The Agent While-Loop",
  whileHeader: 'while (stop_reason === "tool_use")',
  messagesHeader: "messages[]",
  empty: "[ empty ]",
  lengthLabel: "length",
  iter2Label: "iter #2",
  nodes: {
    start: "Start",
    api_call: "API Call",
    check: "stop_reason?",
    execute: "Execute Tool",
    append: "Append Result",
    end: "Break / Done",
  },
  edgeLabels: { tool_use: "tool_use", end_turn: "end_turn" },
  messagesPerStep: [
    [{ role: "user", detail: "Audit protected-term usage in chapters/ against CLAUDE.md §2", colorClass: "bg-blue-500 dark:bg-blue-600" }],
    [],
    [],
    [{ role: "assistant", detail: "tool_use: grep 'patient capital' chapters/", colorClass: "bg-zinc-600 dark:bg-zinc-500" }],
    [{ role: "tool_result", detail: "ch1.tex:47, ch2.tex:118, ch3.tex:23 ...", colorClass: "bg-emerald-500 dark:bg-emerald-600" }],
    [
      { role: "assistant", detail: "tool_use: grep 'long-term capital\\|long horizon fund' chapters/", colorClass: "bg-zinc-600 dark:bg-zinc-500" },
      { role: "tool_result", detail: "ch2.tex:42, ch4.tex:88 ...", colorClass: "bg-emerald-500 dark:bg-emerald-600" },
    ],
    [{ role: "assistant", detail: "end_turn: audit-protected-terms.md saved", colorClass: "bg-purple-500 dark:bg-purple-600" }],
  ],
  stepInfo: [
    { title: "User sends an audit request", desc: "You ask Claude Code to scan whether 'patient capital' has been substituted by banned synonyms. The message enters the conversation; the loop starts." },
    { title: "Loop starts", desc: "Claude Code reads the conversation history and prepares the call to the model." },
    { title: "Call the model", desc: "Send all messages — including your instruction — to the LLM. It decides what to do next." },
    { title: "stop_reason: tool_use", desc: "The model picks grep to scan chapters/ for every occurrence of the protected term first." },
    { title: "Tool result flows back", desc: "grep finds 14 occurrences. The list joins the conversation history; the model sees it next turn." },
    { title: "Loop again · scan banned synonyms", desc: "The model also scans for banned synonyms like 'long-term capital'. Both lists land in the conversation history." },
    { title: "stop_reason: end_turn", desc: "The model writes both scans to audit-protected-terms.md for you to decide whether to revert each banned synonym. No further tool calls; the loop exits." },
  ],
};

function buildNodes(c: Copy): FlowNode[] {
  return [
    { id: "start", label: c.nodes.start, x: 160, y: 30, w: 120, h: 40, type: "rect" },
    { id: "api_call", label: c.nodes.api_call, x: 160, y: 110, w: 120, h: 40, type: "rect" },
    { id: "check", label: c.nodes.check, x: 160, y: 200, w: 140, h: 50, type: "diamond" },
    { id: "execute", label: c.nodes.execute, x: 160, y: 300, w: 120, h: 40, type: "rect" },
    { id: "append", label: c.nodes.append, x: 160, y: 380, w: 120, h: 40, type: "rect" },
    { id: "end", label: c.nodes.end, x: 380, y: 200, w: 120, h: 40, type: "rect" },
  ];
}

const EDGES: FlowEdge[] = [
  { from: "start", to: "api_call" },
  { from: "api_call", to: "check" },
  { from: "check", to: "execute", label: "tool_use" },
  { from: "execute", to: "append" },
  { from: "append", to: "api_call" },
  { from: "check", to: "end", label: "end_turn" },
];

const ACTIVE_NODES_PER_STEP: string[][] = [
  [],
  ["start"],
  ["api_call"],
  ["check", "execute"],
  ["execute", "append"],
  ["api_call", "check", "execute", "append"],
  ["check", "end"],
];

const ACTIVE_EDGES_PER_STEP: string[][] = [
  [],
  [],
  ["start->api_call"],
  ["api_call->check", "check->execute"],
  ["execute->append"],
  ["append->api_call", "api_call->check", "check->execute", "execute->append"],
  ["api_call->check", "check->end"],
];

function getNode(nodes: FlowNode[], id: string): FlowNode {
  return nodes.find((n) => n.id === id)!;
}

function edgePath(nodes: FlowNode[], fromId: string, toId: string): string {
  const from = getNode(nodes, fromId);
  const to = getNode(nodes, toId);

  if (fromId === "append" && toId === "api_call") {
    const startX = from.x - from.w / 2;
    const startY = from.y;
    const endX = to.x - to.w / 2;
    const endY = to.y;
    return `M ${startX} ${startY} L ${startX - 50} ${startY} L ${endX - 50} ${endY} L ${endX} ${endY}`;
  }

  if (fromId === "check" && toId === "end") {
    const startX = from.x + from.w / 2;
    const startY = from.y;
    const endX = to.x - to.w / 2;
    const endY = to.y;
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  const startX = from.x;
  const startY = from.y + from.h / 2;
  const endX = to.x;
  const endY = to.y - to.h / 2;
  return `M ${startX} ${startY} L ${endX} ${endY}`;
}

export default function AgentLoop({ title }: { title?: string }) {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;
  const NODES = buildNodes(c);

  const {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    isPlaying,
    toggleAutoPlay,
  } = useSteppedVisualization({ totalSteps: 7, autoPlayInterval: 2500 });

  const palette = useSvgPalette();
  const activeNodes = ACTIVE_NODES_PER_STEP[currentStep];
  const activeEdges = ACTIVE_EDGES_PER_STEP[currentStep];

  const visibleMessages: MessageBlock[] = [];
  for (let s = 0; s <= currentStep; s++) {
    for (const msg of c.messagesPerStep[s]) {
      if (msg) visibleMessages.push(msg);
    }
  }

  const stepInfo = c.stepInfo[currentStep];

  return (
    <section className="min-h-[500px] space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="w-full lg:w-[60%]">
            <div className="mb-2 font-mono text-xs text-zinc-400 dark:text-zinc-500">
              {c.whileHeader}
            </div>
            <svg
              viewBox="0 0 500 440"
              className="w-full rounded-md border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
              style={{ minHeight: 300 }}
            >
              <defs>
                <filter id="glow-blue">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.7" />
                </filter>
                <filter id="glow-purple">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#a855f7" floodOpacity="0.7" />
                </filter>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill={palette.arrowFill} />
                </marker>
                <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill={palette.activeEdgeStroke} />
                </marker>
              </defs>

              {EDGES.map((edge) => {
                const key = `${edge.from}->${edge.to}`;
                const isActive = activeEdges.includes(key);
                const d = edgePath(NODES, edge.from, edge.to);
                const localizedLabel = edge.label === "tool_use" ? c.edgeLabels.tool_use : edge.label === "end_turn" ? c.edgeLabels.end_turn : edge.label;
                return (
                  <g key={key}>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke={isActive ? palette.activeEdgeStroke : palette.edgeStroke}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                      animate={{
                        stroke: isActive ? palette.activeEdgeStroke : palette.edgeStroke,
                        strokeWidth: isActive ? 2.5 : 1.5,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                    {localizedLabel && (
                      <text
                        x={
                          edge.from === "check" && edge.to === "end"
                            ? (getNode(NODES, "check").x + getNode(NODES, "end").x) / 2
                            : getNode(NODES, edge.from).x + 75
                        }
                        y={
                          edge.from === "check" && edge.to === "end"
                            ? getNode(NODES, "check").y - 10
                            : (getNode(NODES, edge.from).y + getNode(NODES, edge.to).y) / 2
                        }
                        textAnchor="middle"
                        className="fill-zinc-400 text-[10px] dark:fill-zinc-500"
                      >
                        {localizedLabel}
                      </text>
                    )}
                  </g>
                );
              })}

              {NODES.map((node) => {
                const isActive = activeNodes.includes(node.id);
                const isEnd = node.id === "end";
                const filterAttr = isActive ? (isEnd ? "url(#glow-purple)" : "url(#glow-blue)") : "none";

                if (node.type === "diamond") {
                  const cx = node.x;
                  const cy = node.y;
                  const hw = node.w / 2;
                  const hh = node.h / 2;
                  const points = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
                  return (
                    <g key={node.id}>
                      <motion.polygon
                        points={points}
                        rx={6}
                        fill={isActive ? palette.activeNodeFill : palette.nodeFill}
                        stroke={isActive ? palette.activeNodeStroke : palette.nodeStroke}
                        strokeWidth={1.5}
                        filter={filterAttr}
                        animate={{
                          fill: isActive ? palette.activeNodeFill : palette.nodeFill,
                          stroke: isActive ? palette.activeNodeStroke : palette.nodeStroke,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                      <motion.text
                        x={cx}
                        y={cy + 4}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight={600}
                        fontFamily="monospace"
                        animate={{ fill: isActive ? palette.activeNodeText : palette.nodeText }}
                        transition={{ duration: 0.4 }}
                      >
                        {node.label}
                      </motion.text>
                    </g>
                  );
                }

                return (
                  <g key={node.id}>
                    <motion.rect
                      x={node.x - node.w / 2}
                      y={node.y - node.h / 2}
                      width={node.w}
                      height={node.h}
                      rx={8}
                      fill={isActive ? (isEnd ? palette.endNodeFill : palette.activeNodeFill) : palette.nodeFill}
                      stroke={isActive ? (isEnd ? palette.endNodeStroke : palette.activeNodeStroke) : palette.nodeStroke}
                      strokeWidth={1.5}
                      filter={filterAttr}
                      animate={{
                        fill: isActive ? (isEnd ? palette.endNodeFill : palette.activeNodeFill) : palette.nodeFill,
                        stroke: isActive ? (isEnd ? palette.endNodeStroke : palette.activeNodeStroke) : palette.nodeStroke,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                    <motion.text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={600}
                      fontFamily="monospace"
                      animate={{ fill: isActive ? palette.activeNodeText : palette.nodeText }}
                      transition={{ duration: 0.4 }}
                    >
                      {node.label}
                    </motion.text>
                  </g>
                );
              })}

              {currentStep >= 5 && (
                <motion.text
                  x={60}
                  y={130}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="monospace"
                  fill="#3b82f6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {c.iter2Label}
                </motion.text>
              )}
            </svg>
          </div>

          <div className="w-full lg:w-[40%]">
            <div className="mb-2 font-mono text-xs text-zinc-400 dark:text-zinc-500">
              {c.messagesHeader}
            </div>
            <div className="min-h-[300px] space-y-2 rounded-md border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <AnimatePresence mode="popLayout">
                {visibleMessages.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-600"
                  >
                    {c.empty}
                  </motion.div>
                )}
                {visibleMessages.map((msg, i) => (
                  <motion.div
                    key={`${msg.role}-${msg.detail}-${i}`}
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, type: "spring", bounce: 0.3 }}
                    className={`rounded-md px-3 py-2 ${msg.colorClass}`}
                  >
                    <div className="font-mono text-[11px] font-semibold text-white">
                      {msg.role}
                    </div>
                    <div className="mt-0.5 text-[10px] text-white/80">
                      {msg.detail}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {visibleMessages.length > 0 && (
                <div className="mt-3 border-t border-zinc-200 pt-2 dark:border-zinc-700">
                  <span className="font-mono text-[10px] text-zinc-400">
                    {c.lengthLabel}: {visibleMessages.length}
                  </span>
                </div>
              )}
            </div>
          </div>
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
