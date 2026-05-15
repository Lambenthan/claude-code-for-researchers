"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useSvgPalette } from "@/hooks/useDarkMode";
import { useLocale } from "@/lib/i18n";

type Protocol = "shutdown" | "plan";

const SVG_W = 560;
const SVG_H = 360;
const LIFELINE_LEFT_X = 140;
const LIFELINE_RIGHT_X = 420;
const LIFELINE_TOP = 60;
const LIFELINE_BOTTOM = 330;
const ACTIVATION_W = 12;
const ARROW_Y_START = 110;
const ARROW_Y_GAP = 70;

const REQUEST_ID = "req_abc";

interface Copy {
  title: string;
  shutdownTab: string;
  planTab: string;
  leftLabel: string;
  rightLabel: string;
  approveLabel: string;
  rejectLabel: string;
  exitLabel: string;
  planHeader: string;
  planItems: string[];
  shutdownSteps: { title: string; desc: string }[];
  planSteps: { title: string; desc: string }[];
}

const COPY_ZH: Copy = {
  title: "团队协议有限状态机",
  shutdownTab: "关机协议",
  planTab: "方案审批协议",
  leftLabel: "主对话",
  rightLabel: "队友",
  approveLabel: "同意",
  rejectLabel: "拒绝",
  exitLabel: "退出",
  planHeader: "方案：",
  planItems: ["1. 跑 do7_iv_psm: IV1+IV2 联合 Hansen J", "2. PSM 1:1 + reghdfe 估处理效应", "3. 跑 Placebo 500 次置换"],
  shutdownSteps: [
    { title: "评审小组关机", desc: "你的评审小组讨论完毕，要让 method_reviewer 安全关机。这种'请求 + 响应'的协议靠 request_id 把请求和响应配对。" },
    { title: "发出关机请求", desc: "主对话发起关机请求，request_id 用来认领后续响应。" },
    { title: "队友判断", desc: "队友可以同意也可以拒绝。它不是强制 kill，是协商。" },
    { title: "同意，安全退出", desc: "响应里带同一个 request_id，对得上原请求；队友安全退出。" },
  ],
  planSteps: [
    { title: "高风险脚本审批", desc: "do7_iv_psm 是高风险脚本（涉及 IV 工具变量选择 + PSM 匹配方案），队友必须先提交方案给主对话审批再动手。" },
    { title: "提交方案", desc: "队友把 IV/PSM 方案写好——IV1 用同行业 PC 均值、IV2 用前十大股东、PSM 1:1 不放回——发给主对话审核。" },
    { title: "审核决定", desc: "主对话同意或拒绝并附反馈，比如 'IV2 的 Hansen J p=0.057 临近阈值，建议 IV1 单独跑'。同一套请求-响应模式。" },
  ],
};

const COPY_EN: Copy = {
  title: "FSM Team Protocols",
  shutdownTab: "Shutdown Protocol",
  planTab: "Plan Approval Protocol",
  leftLabel: "Leader",
  rightLabel: "Teammate",
  approveLabel: "approve",
  rejectLabel: "reject",
  exitLabel: "exit",
  planHeader: "Plan:",
  planItems: ["1. Run do7_iv_psm: IV1+IV2 joint Hansen J", "2. PSM 1:1 + reghdfe treatment effect", "3. Run Placebo 500 permutations"],
  shutdownSteps: [
    { title: "Structured Protocols", desc: "Protocols define structured message exchanges with correlated request IDs." },
    { title: "Shutdown Request", desc: "The leader initiates shutdown. The request_id links the request to its response." },
    { title: "Teammate Decides", desc: "The teammate can accept or reject. It's not a forced kill — it's a polite request." },
    { title: "Approved", desc: "Same request_id in the response. Teammate exits cleanly." },
  ],
  planSteps: [
    { title: "High-risk Script Approval", desc: "do7_iv_psm is high-risk (it picks instrumental variables and the PSM matching scheme). The teammate must submit a plan and get approval before running it." },
    { title: "Submit Plan", desc: "The teammate writes the IV/PSM plan — IV1 industry-mean PC, IV2 top-10 shareholder sum, PSM 1:1 without replacement — and sends it for review." },
    { title: "Leader Reviews", desc: "Leader approves or rejects with feedback (e.g., 'IV2 Hansen J p=0.057 is borderline, run IV1 alone'). Same request-response pattern." },
  ],
};

function SequenceArrow({
  y, direction, label, tagLabel, color, tagBg, tagStroke, tagText,
}: {
  y: number;
  direction: "right" | "left";
  label: string;
  tagLabel?: string;
  color: string;
  tagBg?: string;
  tagStroke?: string;
  tagText?: string;
}) {
  const fromX = direction === "right" ? LIFELINE_LEFT_X + ACTIVATION_W / 2 : LIFELINE_RIGHT_X - ACTIVATION_W / 2;
  const toX = direction === "right" ? LIFELINE_RIGHT_X - ACTIVATION_W / 2 : LIFELINE_LEFT_X + ACTIVATION_W / 2;
  const arrowTip = direction === "right" ? toX - 6 : toX + 6;
  const labelX = (fromX + toX) / 2;
  return (
    <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <line x1={fromX} y1={y} x2={toX} y2={y} stroke={color} strokeWidth={2} />
      <polygon points={`${toX},${y} ${arrowTip},${y - 4} ${arrowTip},${y + 4}`} fill={color} />
      <text x={labelX} y={y - 10} textAnchor="middle" fontSize={8} fontFamily="monospace" fontWeight={600} fill={color}>
        {label}
      </text>
      {tagLabel && (
        <g>
          <rect x={labelX - 36} y={y + 4} width={72} height={16} rx={3} fill={tagBg || "#f5f3ff"} stroke={tagStroke || "#c4b5fd"} strokeWidth={0.5} />
          <text x={labelX} y={y + 14} textAnchor="middle" fontSize={6} fontFamily="monospace" fill={tagText || "#7c3aed"}>
            {tagLabel}
          </text>
        </g>
      )}
    </motion.g>
  );
}

function DecisionBox({ x, y, approveLabel, rejectLabel }: { x: number; y: number; approveLabel: string; rejectLabel: string }) {
  const size = 14;
  return (
    <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
      <polygon points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={7} fontWeight={700} fill="#92400e">?</text>
      <text x={x + size + 6} y={y - 4} fontSize={7} fontFamily="monospace" fill="#10b981">{approveLabel}</text>
      <text x={x + size + 6} y={y + 6} fontSize={7} fontFamily="monospace" fill="#ef4444">{rejectLabel}</text>
    </motion.g>
  );
}

function ActivationBar({ x, yStart, yEnd, color }: { x: number; yStart: number; yEnd: number; color: string }) {
  return (
    <motion.rect x={x - ACTIVATION_W / 2} y={yStart} width={ACTIVATION_W} height={yEnd - yStart} rx={2} fill={color} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 0.4 }} />
  );
}

export default function TeamProtocols({ title }: { title?: string }) {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;

  const [protocol, setProtocol] = useState<Protocol>("shutdown");
  const steps = protocol === "shutdown" ? c.shutdownSteps : c.planSteps;
  const totalSteps = steps.length;

  const vis = useSteppedVisualization({ totalSteps, autoPlayInterval: 2500 });
  const step = vis.currentStep;
  const palette = useSvgPalette();

  const switchProtocol = (p: Protocol) => {
    setProtocol(p);
    vis.reset();
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 min-h-[500px]">
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => switchProtocol("shutdown")}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${protocol === "shutdown" ? "bg-blue-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"}`}
          >
            {c.shutdownTab}
          </button>
          <button
            onClick={() => switchProtocol("plan")}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${protocol === "plan" ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"}`}
          >
            {c.planTab}
          </button>
        </div>

        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
          <defs>
            <marker id="seq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={palette.arrowFill} />
            </marker>
          </defs>

          <rect x={LIFELINE_LEFT_X - 40} y={20} width={80} height={28} rx={6} fill="#3b82f6" />
          <text x={LIFELINE_LEFT_X} y={37} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={11} fontWeight={700}>
            {c.leftLabel}
          </text>

          <rect x={LIFELINE_RIGHT_X - 40} y={20} width={80} height={28} rx={6} fill="#8b5cf6" />
          <text x={LIFELINE_RIGHT_X} y={37} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={11} fontWeight={700}>
            {c.rightLabel}
          </text>

          <line x1={LIFELINE_LEFT_X} y1={LIFELINE_TOP} x2={LIFELINE_LEFT_X} y2={LIFELINE_BOTTOM} stroke={palette.edgeStroke} strokeWidth={1} strokeDasharray="6 4" />
          <line x1={LIFELINE_RIGHT_X} y1={LIFELINE_TOP} x2={LIFELINE_RIGHT_X} y2={LIFELINE_BOTTOM} stroke={palette.edgeStroke} strokeWidth={1} strokeDasharray="6 4" />

          <AnimatePresence mode="wait">
            {protocol === "shutdown" && (
              <g key="shutdown">
                {step >= 1 && (
                  <ActivationBar x={LIFELINE_LEFT_X} yStart={ARROW_Y_START - 10} yEnd={step >= 3 ? ARROW_Y_START + ARROW_Y_GAP * 2 + 20 : ARROW_Y_START + 30} color="#3b82f6" />
                )}
                {step >= 1 && (
                  <ActivationBar x={LIFELINE_RIGHT_X} yStart={ARROW_Y_START - 5} yEnd={step >= 3 ? ARROW_Y_START + ARROW_Y_GAP * 2 + 15 : ARROW_Y_START + ARROW_Y_GAP + 20} color="#8b5cf6" />
                )}
                {step >= 1 && (
                  <SequenceArrow y={ARROW_Y_START} direction="right" label="shutdown_request" tagLabel={`request_id: ${REQUEST_ID}`} color="#3b82f6" tagBg={palette.bgSubtle} tagStroke={palette.nodeStroke} tagText={palette.nodeText} />
                )}
                {step >= 2 && (
                  <DecisionBox x={LIFELINE_RIGHT_X + 50} y={ARROW_Y_START + ARROW_Y_GAP} approveLabel={c.approveLabel} rejectLabel={c.rejectLabel} />
                )}
                {step >= 3 && (
                  <SequenceArrow y={ARROW_Y_START + ARROW_Y_GAP * 2} direction="left" label="shutdown_response { approve: true }" tagLabel={`request_id: ${REQUEST_ID}`} color="#10b981" tagBg={palette.bgSubtle} tagStroke={palette.nodeStroke} tagText={palette.nodeText} />
                )}
                {step >= 3 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <line x1={LIFELINE_RIGHT_X - 10} y1={ARROW_Y_START + ARROW_Y_GAP * 2 + 20} x2={LIFELINE_RIGHT_X + 10} y2={ARROW_Y_START + ARROW_Y_GAP * 2 + 36} stroke="#ef4444" strokeWidth={2} />
                    <line x1={LIFELINE_RIGHT_X + 10} y1={ARROW_Y_START + ARROW_Y_GAP * 2 + 20} x2={LIFELINE_RIGHT_X - 10} y2={ARROW_Y_START + ARROW_Y_GAP * 2 + 36} stroke="#ef4444" strokeWidth={2} />
                    <text x={LIFELINE_RIGHT_X + 24} y={ARROW_Y_START + ARROW_Y_GAP * 2 + 32} fontSize={8} fill="#ef4444" fontWeight={600}>{c.exitLabel}</text>
                  </motion.g>
                )}
              </g>
            )}

            {protocol === "plan" && (
              <g key="plan">
                {step >= 1 && (
                  <ActivationBar x={LIFELINE_RIGHT_X} yStart={ARROW_Y_START - 10} yEnd={step >= 2 ? ARROW_Y_START + ARROW_Y_GAP * 2 + 15 : ARROW_Y_START + 30} color="#8b5cf6" />
                )}
                {step >= 1 && (
                  <ActivationBar x={LIFELINE_LEFT_X} yStart={ARROW_Y_START - 5} yEnd={step >= 2 ? ARROW_Y_START + ARROW_Y_GAP * 2 + 15 : ARROW_Y_START + ARROW_Y_GAP + 10} color="#3b82f6" />
                )}
                {step >= 1 && (
                  <SequenceArrow y={ARROW_Y_START} direction="left" label="exit_plan_mode { plan }" tagLabel={`request_id: ${REQUEST_ID}`} color="#8b5cf6" tagBg={palette.bgSubtle} tagStroke={palette.nodeStroke} tagText={palette.nodeText} />
                )}
                {step >= 1 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <rect x={20} y={ARROW_Y_START + 20} width={110} height={60} rx={4} fill={palette.bgSubtle} stroke={palette.nodeStroke} strokeWidth={0.5} />
                    <text x={28} y={ARROW_Y_START + 34} fontSize={8} fontFamily="monospace" fill={palette.nodeText} fontWeight={600}>
                      {c.planHeader}
                    </text>
                    {c.planItems.map((item, i) => (
                      <text key={i} x={28} y={ARROW_Y_START + 46 + i * 10} fontSize={7} fontFamily="monospace" fill={palette.labelFill}>
                        {item}
                      </text>
                    ))}
                  </motion.g>
                )}
                {step >= 2 && (
                  <SequenceArrow y={ARROW_Y_START + ARROW_Y_GAP * 2} direction="right" label="plan_approval_response { approve: true }" tagLabel={`request_id: ${REQUEST_ID}`} color="#10b981" tagBg={palette.bgSubtle} tagStroke={palette.nodeStroke} tagText={palette.nodeText} />
                )}
                {step >= 2 && (
                  <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                    <circle cx={LIFELINE_RIGHT_X + 40} cy={ARROW_Y_START + ARROW_Y_GAP * 2} r={10} fill="#10b981" />
                    <text x={LIFELINE_RIGHT_X + 40} y={ARROW_Y_START + ARROW_Y_GAP * 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="white" fontWeight={700}>OK</text>
                  </motion.g>
                )}
              </g>
            )}
          </AnimatePresence>
        </svg>

        <div className="mt-4">
          <StepControls
            currentStep={vis.currentStep}
            totalSteps={vis.totalSteps}
            onPrev={vis.prev}
            onNext={vis.next}
            onReset={vis.reset}
            isPlaying={vis.isPlaying}
            onToggleAutoPlay={vis.toggleAutoPlay}
            stepTitle={steps[step].title}
            stepDescription={steps[step].desc}
          />
        </div>
      </div>
    </section>
  );
}
