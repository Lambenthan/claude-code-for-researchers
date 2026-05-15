"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useSvgPalette } from "@/hooks/useDarkMode";
import { useLocale } from "@/lib/i18n";

const SVG_W = 560;
const SVG_H = 340;
const AGENT_R = 40;
const TRAY_W = 72;
const TRAY_H = 22;
const TRAY_OFFSET_Y = AGENT_R + 14;
const MSG_W = 60;
const MSG_H = 20;

interface AgentDef {
  id: string;
  label: string;
  cx: number;
  cy: number;
  inbox: string;
}

interface Copy {
  title: string;
  agents: AgentDef[];
  taskMsg: string;
  resultMsg: string;
  feedbackMsg: string;
  configTitle: string;
  configBody: string;
  fsRoot: string;
  steps: { title: string; desc: string }[];
}

const COPY_ZH: Copy = {
  title: "评审小组邮箱",
  agents: [
    { id: "lead", label: "作者", cx: SVG_W / 2, cy: 70, inbox: "author.jsonl" },
    { id: "coder", label: "方法评审", cx: 140, cy: 230, inbox: "method.jsonl" },
    { id: "reviewer", label: "统计评审", cx: SVG_W - 140, cy: 230, inbox: "stat.jsonl" },
  ],
  taskMsg: "派 method 评审看识别策略",
  resultMsg: "意见已落 method.jsonl",
  feedbackMsg: "汇总两份评审",
  configTitle: "team.config",
  configBody: "members: [method, stat]",
  fsRoot: ".team/pc-esg-review/",
  steps: [
    { title: "评审小组", desc: "评审小组用作者 + 多评审的结构。每个队友有一份文件邮箱。" },
    { title: "作者派单", desc: "通信都通过邮箱：往收件人的 .jsonl 文件追加一条消息。" },
    { title: "队友读邮箱", desc: "每个队友在每轮模型调用前先扫自己的邮箱，新消息进入上下文。" },
    { title: "独立工作", desc: "每个队友各自跑自己的循环，互不阻塞。" },
    { title: "传结果", desc: "结果走同一套邮箱机制——所有通信都通过文件。" },
    { title: "形成闭环", desc: "邮箱模式支持任何通信结构：线性、广播、轮询。" },
    { title: "基于文件的协作", desc: "没有共享内存、没有锁。所有协调都靠 append-only 文件。简单、可靠、随时能看。" },
  ],
};

const COPY_EN: Copy = {
  title: "Agent Team Mailboxes",
  agents: [
    { id: "lead", label: "Author", cx: SVG_W / 2, cy: 70, inbox: "author.jsonl" },
    { id: "coder", label: "Method", cx: 140, cy: 230, inbox: "method.jsonl" },
    { id: "reviewer", label: "Stats", cx: SVG_W - 140, cy: 230, inbox: "stats.jsonl" },
  ],
  taskMsg: "review identification",
  resultMsg: "comments saved",
  feedbackMsg: "merge both reviews",
  configTitle: "team.config",
  configBody: "members: [method, stats]",
  fsRoot: ".team/pc-esg-review/",
  steps: [
    { title: "The Team", desc: "Teams use a leader-worker pattern. Each teammate has a file-based mailbox inbox." },
    { title: "Lead Assigns Work", desc: "Communication is async: write a message to the recipient's .jsonl inbox file." },
    { title: "Read Inbox", desc: "Teammates poll their inbox before each LLM call. New messages become context." },
    { title: "Independent Work", desc: "Each teammate runs its own agent loop independently." },
    { title: "Pass Result", desc: "Results flow through the same mailbox mechanism. All communication is via files." },
    { title: "Feedback Loop", desc: "The mailbox pattern supports any communication topology: linear, broadcast, round-robin." },
    { title: "File-Based Coordination", desc: "No shared memory, no locks. All coordination through append-only files. Simple, robust, debuggable." },
  ],
};

function agentGlows(agentId: string, step: number): boolean {
  if (step === 1 && agentId === "lead") return true;
  if (step === 2 && agentId === "coder") return true;
  if (step === 3 && agentId === "coder") return true;
  if (step === 4 && agentId === "coder") return true;
  if (step === 5 && agentId === "reviewer") return true;
  return false;
}

function trayHasMessage(agentId: string, step: number): boolean {
  if (step === 2 && agentId === "coder") return true;
  if (step === 4 && agentId === "reviewer") return false;
  if (step === 5 && agentId === "reviewer") return true;
  return false;
}

function TravelingMessage({
  fromX,
  fromY,
  toX,
  toY,
  label,
  delay = 0,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label: string;
  delay?: number;
}) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 0.8],
        x: [fromX - MSG_W / 2, fromX - MSG_W / 2, toX - MSG_W / 2, toX - MSG_W / 2],
        y: [fromY - MSG_H / 2, fromY - MSG_H / 2, toY - MSG_H / 2, toY - MSG_H / 2],
      }}
      transition={{ duration: 1.4, delay, times: [0, 0.1, 0.7, 1], ease: "easeInOut" }}
    >
      <rect width={MSG_W} height={MSG_H} rx={4} fill="#f59e0b" />
      <text x={MSG_W / 2} y={MSG_H / 2 + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={8} fontWeight={600}>
        {label}
      </text>
    </motion.g>
  );
}

function TraceLine({ from, to, strokeColor, agents }: { from: string; to: string; strokeColor: string; agents: AgentDef[] }) {
  const a = agents.find((x) => x.id === from)!;
  const b = agents.find((x) => x.id === to)!;
  const f = { x: a.cx, y: a.cy + TRAY_OFFSET_Y + TRAY_H / 2 };
  const t = { x: b.cx, y: b.cy + TRAY_OFFSET_Y + TRAY_H / 2 };
  return (
    <motion.line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={strokeColor} strokeWidth={1.5} strokeDasharray="6 4" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 0.6 }} />
  );
}

export default function AgentTeams({ title }: { title?: string }) {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;
  const AGENTS = c.agents;
  const agentById = (id: string) => AGENTS.find((a) => a.id === id)!;

  const vis = useSteppedVisualization({ totalSteps: c.steps.length, autoPlayInterval: 2500 });
  const step = vis.currentStep;
  const palette = useSvgPalette();

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 min-h-[500px]">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
              <defs>
                <filter id="agent-glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {step === 6 && (
                <>
                  <TraceLine from="lead" to="coder" strokeColor={palette.edgeStroke} agents={AGENTS} />
                  <TraceLine from="coder" to="reviewer" strokeColor={palette.edgeStroke} agents={AGENTS} />
                  <TraceLine from="reviewer" to="lead" strokeColor={palette.edgeStroke} agents={AGENTS} />
                </>
              )}

              {AGENTS.map((agent) => {
                const glowing = agentGlows(agent.id, step);
                const pulsing = step === 3 && agent.id === "coder";
                return (
                  <g key={agent.id}>
                    <motion.circle
                      cx={agent.cx}
                      cy={agent.cy}
                      r={AGENT_R}
                      fill={glowing ? "#3b82f6" : palette.edgeStroke}
                      stroke={glowing ? "#60a5fa" : palette.labelFill}
                      strokeWidth={2}
                      animate={{
                        scale: pulsing ? [1, 1.08, 1] : 1,
                        fill: glowing ? "#3b82f6" : palette.edgeStroke,
                      }}
                      transition={pulsing ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
                      filter={glowing ? "url(#agent-glow)" : undefined}
                    />
                    <text x={agent.cx} y={agent.cy + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={11} fontWeight={700}>
                      {agent.label}
                    </text>
                    <rect
                      x={agent.cx - TRAY_W / 2}
                      y={agent.cy + TRAY_OFFSET_Y}
                      width={TRAY_W}
                      height={TRAY_H}
                      rx={3}
                      fill={trayHasMessage(agent.id, step) ? "#fef3c7" : palette.nodeFill}
                      stroke={trayHasMessage(agent.id, step) ? "#f59e0b" : palette.nodeStroke}
                      strokeWidth={1}
                    />
                    <text x={agent.cx} y={agent.cy + TRAY_OFFSET_Y + TRAY_H / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={8} fontFamily="monospace" fill={palette.labelFill}>
                      {agent.inbox}
                    </text>
                  </g>
                );
              })}

              {step === 0 && (
                <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <rect x={12} y={12} width={140} height={44} rx={4} fill="#f0f9ff" stroke="#bae6fd" strokeWidth={1} />
                  <text x={20} y={28} fontSize={9} fontFamily="monospace" fill="#0284c7" fontWeight={600}>
                    {c.configTitle}
                  </text>
                  <text x={20} y={42} fontSize={8} fontFamily="monospace" fill="#0369a1">
                    {c.configBody}
                  </text>
                </motion.g>
              )}

              <AnimatePresence>
                {step === 1 && (
                  <TravelingMessage
                    key="msg-lead-coder"
                    fromX={agentById("lead").cx}
                    fromY={agentById("lead").cy + AGENT_R}
                    toX={agentById("coder").cx}
                    toY={agentById("coder").cy + TRAY_OFFSET_Y + TRAY_H / 2}
                    label={c.taskMsg}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {step === 2 && (
                  <TravelingMessage
                    key="msg-inbox-coder"
                    fromX={agentById("coder").cx}
                    fromY={agentById("coder").cy + TRAY_OFFSET_Y + TRAY_H / 2}
                    toX={agentById("coder").cx}
                    toY={agentById("coder").cy}
                    label={c.taskMsg}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {step === 3 && (
                  <motion.g key="result-msg" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.4 }}>
                    <rect x={agentById("coder").cx + AGENT_R + 8} y={agentById("coder").cy - MSG_H / 2} width={MSG_W + 10} height={MSG_H} rx={4} fill="#10b981" />
                    <text x={agentById("coder").cx + AGENT_R + 8 + (MSG_W + 10) / 2} y={agentById("coder").cy + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={8} fontWeight={600}>
                      {c.resultMsg}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {step === 4 && (
                  <TravelingMessage
                    key="msg-coder-reviewer"
                    fromX={agentById("coder").cx + AGENT_R + 8 + (MSG_W + 10) / 2}
                    fromY={agentById("coder").cy}
                    toX={agentById("reviewer").cx}
                    toY={agentById("reviewer").cy + TRAY_OFFSET_Y + TRAY_H / 2}
                    label={c.resultMsg}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {step === 5 && (
                  <>
                    <TravelingMessage
                      key="msg-reviewer-read"
                      fromX={agentById("reviewer").cx}
                      fromY={agentById("reviewer").cy + TRAY_OFFSET_Y + TRAY_H / 2}
                      toX={agentById("reviewer").cx}
                      toY={agentById("reviewer").cy}
                      label={c.resultMsg}
                      delay={0}
                    />
                    <TravelingMessage
                      key="msg-reviewer-lead"
                      fromX={agentById("reviewer").cx}
                      fromY={agentById("reviewer").cy}
                      toX={agentById("lead").cx}
                      toY={agentById("lead").cy + TRAY_OFFSET_Y + TRAY_H / 2}
                      label={c.feedbackMsg}
                      delay={1.0}
                    />
                  </>
                )}
              </AnimatePresence>

              {step === 6 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                  <rect x={SVG_W / 2 - 110} y={SVG_H - 80} width={220} height={68} rx={6} fill={palette.bgSubtle} stroke={palette.nodeStroke} strokeWidth={1} />
                  <text x={SVG_W / 2 - 96} y={SVG_H - 60} fontSize={8} fontFamily="monospace" fill={palette.labelFill}>
                    {c.fsRoot}
                  </text>
                  {AGENTS.map((a, i) => (
                    <text key={a.id} x={SVG_W / 2 - 82} y={SVG_H - 48 + i * 12} fontSize={8} fontFamily="monospace" fill="#60a5fa">
                      {a.inbox}
                    </text>
                  ))}
                </motion.g>
              )}
            </svg>
          </div>
        </div>

        <div className="mt-4">
          <StepControls
            currentStep={vis.currentStep}
            totalSteps={vis.totalSteps}
            onPrev={vis.prev}
            onNext={vis.next}
            onReset={vis.reset}
            isPlaying={vis.isPlaying}
            onToggleAutoPlay={vis.toggleAutoPlay}
            stepTitle={c.steps[step].title}
            stepDescription={c.steps[step].desc}
          />
        </div>
      </div>
    </section>
  );
}
