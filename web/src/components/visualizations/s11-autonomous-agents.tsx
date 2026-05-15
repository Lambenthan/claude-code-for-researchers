"use client";

import { motion } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useSvgPalette } from "@/hooks/useDarkMode";
import { useLocale } from "@/lib/i18n";

type Phase = "idle" | "poll" | "claim" | "work";

const FSM_CX = 110;
const FSM_CY = 110;
const FSM_R = 65;
const FSM_STATE_R = 22;

interface FSMStateDef {
  id: Phase;
  label: string;
  angle: number;
}

const FSM_TRANSITIONS: { from: Phase; to: Phase }[] = [
  { from: "idle", to: "poll" },
  { from: "poll", to: "claim" },
  { from: "claim", to: "work" },
  { from: "work", to: "idle" },
];

function fsmPos(angle: number) {
  return { x: FSM_CX + FSM_R * Math.cos(angle), y: FSM_CY + FSM_R * Math.sin(angle) };
}

const PHASE_COLORS: Record<Phase, string> = {
  idle: "#a1a1aa",
  poll: "#f59e0b",
  claim: "#3b82f6",
  work: "#10b981",
};

interface TaskRow {
  id: string;
  name: string;
  status: "unclaimed" | "active" | "complete";
  owner: string;
}

interface Copy {
  title: string;
  spatialView: string;
  fsmCycle: string;
  taskBoard: string;
  unclaimedSuffix: string;
  completeSuffix: string;
  taskCol: string;
  statusCol: string;
  ownerCol: string;
  statusUnclaimed: string;
  statusActive: string;
  statusComplete: string;
  initialTasks: TaskRow[];
  fsmStates: FSMStateDef[];
  steps: { title: string; desc: string }[];
}

const COPY_ZH: Copy = {
  title: "队友自治循环",
  spatialView: "空间视角",
  fsmCycle: "状态机循环",
  taskBoard: "任务板",
  unclaimedSuffix: "条未认领",
  completeSuffix: "条已完成",
  taskCol: "任务",
  statusCol: "状态",
  ownerCol: "认领人",
  statusUnclaimed: "未认领",
  statusActive: "进行中",
  statusComplete: "已完成",
  initialTasks: [
    { id: "T1", name: "PC_A1 替换跑表 10A", status: "unclaimed", owner: "-" },
    { id: "T2", name: "PC_B2 替换跑表 10A", status: "unclaimed", owner: "-" },
    { id: "T3", name: "PC 滞后 1 期跑表 10B", status: "unclaimed", owner: "-" },
    { id: "T4", name: "剔除疫情样本跑表 10C", status: "unclaimed", owner: "-" },
  ],
  fsmStates: [
    { id: "idle", label: "待命", angle: -Math.PI / 2 },
    { id: "poll", label: "扫板", angle: 0 },
    { id: "claim", label: "认领", angle: Math.PI / 2 },
    { id: "work", label: "干活", angle: Math.PI },
  ],
  steps: [
    { title: "自治队友", desc: "自治队友不需要协调员。它们靠'待命—扫板—认领—干活'四个状态自我管理。" },
    { title: "待命计时", desc: "每个待命的队友每隔几秒数一次。计时到了就主动扫一遍任务板。" },
    { title: "扫任务板", desc: "时间到了！队友读任务板，找还没人认领的活。" },
    { title: "认领", desc: "队友把自己的名字写到任务记录上。改名作为单台电脑上不可被打断的操作，自然避免并发冲突。" },
    { title: "干活", desc: "队友在自己的循环里处理认领的任务。" },
    { title: "并行扫板", desc: "多个队友各自扫各自认领，没有中央协调器。" },
    { title: "做完归位", desc: "任务完成。队友回到待命状态。循环再来一遍。" },
    { title: "自组织", desc: "3 个队友，零协调开销。扫板 + 计时 = 自发组织。" },
  ],
};

const COPY_EN: Copy = {
  title: "Autonomous Agent Cycle",
  spatialView: "Spatial View",
  fsmCycle: "FSM Cycle",
  taskBoard: "Task Board",
  unclaimedSuffix: "unclaimed",
  completeSuffix: "complete",
  taskCol: "Task",
  statusCol: "Status",
  ownerCol: "Owner",
  statusUnclaimed: "unclaimed",
  statusActive: "active",
  statusComplete: "complete",
  initialTasks: [
    { id: "T1", name: "Swap PC_A1, run table 10A", status: "unclaimed", owner: "-" },
    { id: "T2", name: "Swap PC_B2, run table 10A", status: "unclaimed", owner: "-" },
    { id: "T3", name: "Lag PC by 1y, run table 10B", status: "unclaimed", owner: "-" },
    { id: "T4", name: "Drop COVID years, table 10C", status: "unclaimed", owner: "-" },
  ],
  fsmStates: [
    { id: "idle", label: "idle", angle: -Math.PI / 2 },
    { id: "poll", label: "poll", angle: 0 },
    { id: "claim", label: "claim", angle: Math.PI / 2 },
    { id: "work", label: "work", angle: Math.PI },
  ],
  steps: [
    { title: "Self-Governing Agents", desc: "Autonomous agents need no coordinator. They govern themselves with an idle-poll-claim-work cycle." },
    { title: "Idle Timer", desc: "Each idle agent counts rounds. A timeout triggers self-directed task polling." },
    { title: "Poll Task Board", desc: "Timeout! The agent reads the task board looking for unclaimed work." },
    { title: "Claim Task", desc: "The agent writes its name to the task record. Atomic, no conflicts." },
    { title: "Work", desc: "The agent works on the claimed task using its own agent loop." },
    { title: "Independent Polling", desc: "Multiple agents poll and claim independently. No central coordinator needed." },
    { title: "Complete & Reset", desc: "Task done. Agent returns to idle. The cycle repeats." },
    { title: "Self-Organization", desc: "Three agents, zero coordination overhead. Polling + timeout = emergent organization." },
  ],
};

const BOARD_CX = 140;
const BOARD_CY = 90;
const AGENT_ORBIT = 85;
const AGENT_R = 20;
const AGENT_ANGLES = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];

function agentPos(index: number) {
  const angle = AGENT_ANGLES[index];
  return { x: BOARD_CX + AGENT_ORBIT * Math.cos(angle), y: BOARD_CY + AGENT_ORBIT * Math.sin(angle) };
}

interface AgentState {
  phase: Phase;
  timerFill: number;
  color: string;
  taskClaim: string | null;
}

function getAgentStates(step: number): AgentState[] {
  const idle: AgentState = { phase: "idle", timerFill: 0, color: PHASE_COLORS.idle, taskClaim: null };
  switch (step) {
    case 0: return [{ ...idle }, { ...idle }, { ...idle }];
    case 1: return [{ phase: "idle", timerFill: 0.6, color: PHASE_COLORS.idle, taskClaim: null }, { ...idle }, { ...idle }];
    case 2: return [{ phase: "poll", timerFill: 1.0, color: PHASE_COLORS.poll, taskClaim: null }, { ...idle }, { ...idle }];
    case 3: return [{ phase: "claim", timerFill: 0, color: PHASE_COLORS.claim, taskClaim: "T1" }, { ...idle }, { ...idle }];
    case 4: return [{ phase: "work", timerFill: 0, color: PHASE_COLORS.work, taskClaim: "T1" }, { ...idle }, { ...idle }];
    case 5: return [{ phase: "work", timerFill: 0, color: PHASE_COLORS.work, taskClaim: "T1" }, { phase: "claim", timerFill: 0, color: PHASE_COLORS.claim, taskClaim: "T2" }, { ...idle }];
    case 6: return [{ phase: "idle", timerFill: 0, color: PHASE_COLORS.idle, taskClaim: null }, { phase: "work", timerFill: 0, color: PHASE_COLORS.work, taskClaim: "T2" }, { ...idle }];
    case 7: return [{ phase: "idle", timerFill: 0, color: PHASE_COLORS.idle, taskClaim: null }, { phase: "work", timerFill: 0, color: PHASE_COLORS.work, taskClaim: "T2" }, { phase: "claim", timerFill: 0, color: PHASE_COLORS.claim, taskClaim: "T3" }];
    default: return [{ ...idle }, { ...idle }, { ...idle }];
  }
}

function getTaskStates(initialTasks: TaskRow[], step: number): TaskRow[] {
  const tasks = initialTasks.map((t) => ({ ...t }));
  if (step >= 3) { tasks[0].status = "active"; tasks[0].owner = "A"; }
  if (step >= 5) { tasks[1].status = "active"; tasks[1].owner = "B"; }
  if (step >= 6) { tasks[0].status = "complete"; }
  if (step >= 7) { tasks[2].status = "active"; tasks[2].owner = "C"; }
  return tasks;
}

function getActivePhase(step: number): Phase {
  if (step <= 1) return "idle";
  if (step === 2) return "poll";
  if (step === 3) return "claim";
  if (step === 4 || step === 5) return "work";
  if (step === 6) return "idle";
  return "claim";
}

function TimerRing({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: number }) {
  if (fill <= 0) return null;
  const circumference = 2 * Math.PI * (r + 4);
  const offset = circumference * (1 - fill);
  return (
    <motion.circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#f59e0b" strokeWidth={3} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
  );
}

function FSMArrow({ from, to, active, inactiveStroke, fsmStates }: { from: Phase; to: Phase; active: boolean; inactiveStroke: string; fsmStates: FSMStateDef[] }) {
  const fState = fsmStates.find((s) => s.id === from)!;
  const tState = fsmStates.find((s) => s.id === to)!;
  const fPos = fsmPos(fState.angle);
  const tPos = fsmPos(tState.angle);
  const dx = tPos.x - fPos.x;
  const dy = tPos.y - fPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;
  const x1 = fPos.x + ux * FSM_STATE_R;
  const y1 = fPos.y + uy * FSM_STATE_R;
  const x2 = tPos.x - ux * (FSM_STATE_R + 6);
  const y2 = tPos.y - uy * (FSM_STATE_R + 6);
  const perpX = -uy * 12;
  const perpY = ux * 12;
  const cx = (x1 + x2) / 2 + perpX;
  const cy = (y1 + y2) / 2 + perpY;
  return (
    <g>
      <path d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} fill="none" stroke={active ? PHASE_COLORS[to] : inactiveStroke} strokeWidth={active ? 2 : 1} markerEnd="url(#fsm-arrowhead)" />
    </g>
  );
}

export default function AutonomousAgents({ title }: { title?: string }) {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;

  const vis = useSteppedVisualization({ totalSteps: c.steps.length, autoPlayInterval: 2500 });
  const step = vis.currentStep;
  const palette = useSvgPalette();

  const agentStates = getAgentStates(step);
  const tasks = getTaskStates(c.initialTasks, step);
  const activePhase = getActivePhase(step);
  const agentNames = ["A", "B", "C"];
  const statusLabelMap: Record<TaskRow["status"], string> = {
    unclaimed: c.statusUnclaimed,
    active: c.statusActive,
    complete: c.statusComplete,
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 min-h-[500px]">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">{c.spatialView}</div>
            <svg viewBox="0 0 280 240" className="w-full">
              <rect x={BOARD_CX - 35} y={BOARD_CY - 20} width={70} height={40} rx={4} fill={palette.bgSubtle} stroke={palette.nodeStroke} strokeWidth={1} />
              <text x={BOARD_CX} y={BOARD_CY - 8} textAnchor="middle" fontSize={7} fontWeight={600} fill={palette.nodeText}>
                {c.taskBoard}
              </text>
              <text x={BOARD_CX} y={BOARD_CY + 4} textAnchor="middle" fontSize={6} fontFamily="monospace" fill={palette.labelFill}>
                {tasks.filter((t) => t.status === "unclaimed").length} {c.unclaimedSuffix}
              </text>
              <text x={BOARD_CX} y={BOARD_CY + 14} textAnchor="middle" fontSize={6} fontFamily="monospace" fill="#10b981">
                {tasks.filter((t) => t.status === "complete").length} {c.completeSuffix}
              </text>

              {agentStates.map((state, i) => {
                const pos = agentPos(i);
                const isPulsing = state.phase === "work";
                const isPolling = state.phase === "poll";
                return (
                  <g key={i}>
                    {isPolling && (
                      <motion.line x1={pos.x} y1={pos.y} x2={BOARD_CX} y2={BOARD_CY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
                    )}
                    {state.phase === "claim" && (
                      <motion.line x1={pos.x} y1={pos.y} x2={BOARD_CX} y2={BOARD_CY} stroke="#3b82f6" strokeWidth={2} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
                    )}
                    <TimerRing cx={pos.x} cy={pos.y} r={AGENT_R} fill={state.timerFill} />
                    <motion.circle cx={pos.x} cy={pos.y} r={AGENT_R} fill={state.color} stroke={state.phase === "work" ? "#059669" : palette.nodeStroke} strokeWidth={1.5} animate={{ scale: isPulsing ? [1, 1.1, 1] : 1, fill: state.color }} transition={isPulsing ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }} />
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={11} fontWeight={700}>
                      {agentNames[i]}
                    </text>
                    {state.taskClaim && (
                      <motion.text x={pos.x} y={pos.y + AGENT_R + 12} textAnchor="middle" fontSize={7} fontFamily="monospace" fill={state.phase === "work" ? "#10b981" : "#3b82f6"} fontWeight={600} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                        {state.taskClaim}
                      </motion.text>
                    )}
                  </g>
                );
              })}
            </svg>

            <div className="mt-2 border border-zinc-200 rounded dark:border-zinc-700 overflow-hidden">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800">
                    <th className="px-2 py-1 text-left font-medium text-zinc-500 dark:text-zinc-400">{c.taskCol}</th>
                    <th className="px-2 py-1 text-left font-medium text-zinc-500 dark:text-zinc-400">{c.statusCol}</th>
                    <th className="px-2 py-1 text-left font-medium text-zinc-500 dark:text-zinc-400">{c.ownerCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="px-2 py-1 font-mono text-zinc-700 dark:text-zinc-300">{task.name}</td>
                      <td className="px-2 py-1">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-medium ${task.status === "complete" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : task.status === "active" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                          {statusLabelMap[task.status]}
                        </span>
                      </td>
                      <td className="px-2 py-1 font-mono text-zinc-600 dark:text-zinc-400">{task.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">{c.fsmCycle}</div>
            <svg viewBox="0 0 220 220" className="w-full">
              <defs>
                <marker id="fsm-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={palette.arrowFill} />
                </marker>
              </defs>
              {FSM_TRANSITIONS.map((t) => {
                const isActive =
                  activePhase === t.from ||
                  (activePhase === t.to && t.from === FSM_TRANSITIONS.find((tr) => tr.to === activePhase)?.from);
                return (
                  <FSMArrow key={`${t.from}-${t.to}`} from={t.from} to={t.to} active={isActive} inactiveStroke={palette.nodeStroke} fsmStates={c.fsmStates} />
                );
              })}
              {c.fsmStates.map((state) => {
                const pos = fsmPos(state.angle);
                const isActive = state.id === activePhase;
                return (
                  <g key={state.id}>
                    <motion.circle cx={pos.x} cy={pos.y} r={FSM_STATE_R} fill={isActive ? PHASE_COLORS[state.id] : palette.nodeFill} stroke={isActive ? PHASE_COLORS[state.id] : palette.nodeStroke} strokeWidth={isActive ? 2 : 1} animate={{ fill: isActive ? PHASE_COLORS[state.id] : palette.nodeFill, scale: isActive ? 1.1 : 1 }} transition={{ duration: 0.4 }} />
                    <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={600} fill={isActive ? "white" : palette.nodeText}>
                      {state.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-2 flex flex-wrap gap-3 justify-center">
              {c.fsmStates.map((s) => (
                <div key={s.id} className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PHASE_COLORS[s.id] }} />
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{s.label}</span>
                </div>
              ))}
            </div>
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
