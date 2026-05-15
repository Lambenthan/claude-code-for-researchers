"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useDarkMode, useSvgPalette } from "@/hooks/useDarkMode";
import { useLocale } from "@/lib/i18n";

type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";

interface TaskNode {
  id: string;
  label: string;
  x: number;
  y: number;
  deps: string[];
}

interface Copy {
  title: string;
  statusLabels: Record<TaskStatus, string>;
  legendLabels: Record<TaskStatus, string>;
  blockedNote: string;
  persistencePath: string;
  persistenceDesc: string;
  tasks: TaskNode[];
  steps: { title: string; description: string }[];
}

const COPY_ZH: Copy = {
  title: "任务依赖图",
  statusLabels: { pending: "待办", in_progress: "进行中", completed: "已完成", blocked: "被阻挡" },
  legendLabels: { pending: "待办", in_progress: "进行中", completed: "已完成", blocked: "被阻挡" },
  blockedNote: "被阻挡：等 T3 完成",
  persistencePath: ".tasks/tasks.json",
  persistenceDesc: "落到磁盘——上下文压缩也不丢",
  tasks: [
    { id: "T1", label: "do4 拼面板", x: 80, y: 160, deps: [] },
    { id: "T2", label: "do6 基准回归", x: 280, y: 80, deps: ["T1"] },
    { id: "T3", label: "do7 IV/PSM", x: 280, y: 240, deps: ["T1"] },
    { id: "T4", label: "do8 机制检验", x: 480, y: 160, deps: ["T2", "T3"] },
    { id: "T5", label: "do9-10 稳健性", x: 650, y: 160, deps: ["T4"] },
  ],
  steps: [
    {
      title: "任务存成文件",
      description: "任务以 JSON 文件形式落到磁盘，跨会话保留，不像 TodoWrite 那样会随上下文压缩被裁掉。",
    },
    {
      title: "开始 T1",
      description: "do4 拼 main_panel.dta 没有依赖，可以立即开始。",
    },
    {
      title: "T1 完成",
      description: "main_panel.dta 落盘后自动解锁下游：基准回归 T2 与 IV/PSM T3。",
    },
    {
      title: "并行推进",
      description: "T2 基准回归与 T3 IV/PSM 互相不依赖，两个 agent 可以同时跑各自目录。",
    },
    {
      title: "部分解锁",
      description: "T4 机制检验同时依赖 T2 主因果效应与 T3 内生性矫正，必须等两者完成。",
    },
    {
      title: "完全解锁",
      description: "T2、T3 都完成。T4 现在可以推进，把 Myopia 通道接到主因果链上。",
    },
    {
      title: "依赖图全部解开",
      description: "T5 稳健性矩阵跑完，整张依赖图解完。磁盘持久化让这套流程能跨周推进。",
    },
  ],
};

const COPY_EN: Copy = {
  title: "Task Dependency Graph",
  statusLabels: { pending: "pending", in_progress: "in_progress", completed: "done", blocked: "blocked" },
  legendLabels: { pending: "pending", in_progress: "in_progress", completed: "completed", blocked: "blocked" },
  blockedNote: "Blocked: waiting on T3",
  persistencePath: ".tasks/tasks.json",
  persistenceDesc: "Persisted to disk -- survives context compaction",
  tasks: [
    { id: "T1", label: "do4 assemble panel", x: 80, y: 160, deps: [] },
    { id: "T2", label: "do6 baseline", x: 280, y: 80, deps: ["T1"] },
    { id: "T3", label: "do7 IV/PSM", x: 280, y: 240, deps: ["T1"] },
    { id: "T4", label: "do8 mechanism", x: 480, y: 160, deps: ["T2", "T3"] },
    { id: "T5", label: "do9-10 robustness", x: 650, y: 160, deps: ["T4"] },
  ],
  steps: [
    { title: "File-Based Tasks", description: "Tasks are stored in JSON files on disk. They survive context compaction — unlike TodoWrite, which dies with the session." },
    { title: "Start T1", description: "do4 assembles main_panel.dta. No blockers, can start immediately." },
    { title: "T1 Complete", description: "Once main_panel.dta lands, downstream tasks (T2 baseline, T3 IV/PSM) automatically unblock." },
    { title: "Parallel Work", description: "Baseline and IV/PSM do not depend on each other. Two agents can run them in parallel worktrees." },
    { title: "Partial Unblock", description: "Mechanism test (T4) needs both the baseline causal effect (T2) and the endogeneity-corrected estimate (T3) before it can proceed." },
    { title: "Fully Unblocked", description: "T2 and T3 both done. T4 mechanism test can now hook the myopia channel onto the main causal chain." },
    { title: "Graph Resolved", description: "T5 robustness matrix completes. File-based persistence lets this whole flow run across weeks of sessions." },
  ],
};

const NODE_W = 140;
const NODE_H = 50;

function getTaskStatus(taskId: string, step: number): TaskStatus {
  const statusMap: Record<string, TaskStatus[]> = {
    T1: ["pending", "in_progress", "completed", "completed", "completed", "completed", "completed"],
    T2: ["pending", "pending", "pending", "in_progress", "completed", "completed", "completed"],
    T3: ["pending", "pending", "pending", "in_progress", "in_progress", "completed", "completed"],
    T4: ["pending", "pending", "pending", "pending", "blocked", "in_progress", "completed"],
    T5: ["pending", "pending", "pending", "pending", "pending", "pending", "completed"],
  };
  return statusMap[taskId]?.[step] ?? "pending";
}

function isEdgeActive(fromId: string, toId: string, step: number): boolean {
  const fromStatus = getTaskStatus(fromId, step);
  const toStatus = getTaskStatus(toId, step);
  return fromStatus === "completed" && (toStatus === "in_progress" || toStatus === "completed");
}

function getStatusColor(status: TaskStatus) {
  switch (status) {
    case "pending":
      return { fill: "#e2e8f0", darkFill: "#27272a", stroke: "#cbd5e1", darkStroke: "#3f3f46", text: "#475569", darkText: "#d4d4d8" };
    case "in_progress":
      return { fill: "#fef3c7", darkFill: "#451a0340", stroke: "#f59e0b", darkStroke: "#d97706", text: "#b45309", darkText: "#fbbf24" };
    case "completed":
      return { fill: "#d1fae5", darkFill: "#06402740", stroke: "#10b981", darkStroke: "#059669", text: "#047857", darkText: "#34d399" };
    case "blocked":
      return { fill: "#fecaca", darkFill: "#45050540", stroke: "#ef4444", darkStroke: "#dc2626", text: "#dc2626", darkText: "#f87171" };
  }
}

function buildCurvePath(x1: number, y1: number, x2: number, y2: number): string {
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}

export default function TaskSystem({ title }: { title?: string }) {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;
  const TASKS = c.tasks;

  const {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    isPlaying,
    toggleAutoPlay,
  } = useSteppedVisualization({ totalSteps: 7, autoPlayInterval: 2500 });

  const isDark = useDarkMode();
  const palette = useSvgPalette();

  const edges = useMemo(() => {
    const result: { fromId: string; toId: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const task of TASKS) {
      for (const depId of task.deps) {
        const dep = TASKS.find((t) => t.id === depId);
        if (!dep) continue;
        result.push({
          fromId: dep.id,
          toId: task.id,
          x1: dep.x + NODE_W,
          y1: dep.y + NODE_H / 2,
          x2: task.x,
          y2: task.y + NODE_H / 2,
        });
      }
    }
    return result;
  }, [TASKS]);

  const stepInfo = c.steps[currentStep];

  return (
    <section className="min-h-[500px] space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <svg viewBox="0 0 800 340" className="w-full" aria-label="Task DAG">
          <defs>
            <marker id="arrowGray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={palette.arrowFill} />
            </marker>
            <marker id="arrowGreen" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
            <marker id="arrowRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
            <filter id="glowAmber" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#f59e0b" floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowGreen" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor="#10b981" floodOpacity="0.3" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {edges.map(({ fromId, toId, x1, y1, x2, y2 }) => {
            const active = isEdgeActive(fromId, toId, currentStep);
            const toStatus = getTaskStatus(toId, currentStep);
            const isBlocked = toStatus === "blocked";
            let markerEnd = "url(#arrowGray)";
            let strokeColor = palette.arrowFill;
            if (active) {
              markerEnd = "url(#arrowGreen)";
              strokeColor = "#10b981";
            } else if (isBlocked) {
              markerEnd = "url(#arrowRed)";
              strokeColor = "#ef4444";
            }
            return (
              <motion.path
                key={`${fromId}-${toId}`}
                d={buildCurvePath(x1, y1, x2, y2)}
                fill="none"
                markerEnd={markerEnd}
                animate={{
                  stroke: strokeColor,
                  strokeWidth: active ? 2.5 : 1.5,
                  strokeDasharray: isBlocked ? "6 4" : "none",
                }}
                transition={{ duration: 0.5 }}
              />
            );
          })}

          {TASKS.map((task) => {
            const status = getTaskStatus(task.id, currentStep);
            const colors = getStatusColor(status);
            const statusLabel = c.statusLabels[status];
            const isActive = status === "in_progress";
            const isComplete = status === "completed";

            let filterAttr: string | undefined;
            if (isActive) filterAttr = "url(#glowAmber)";
            else if (isComplete) filterAttr = "url(#glowGreen)";

            return (
              <g key={task.id} filter={filterAttr}>
                <motion.rect
                  x={task.x}
                  y={task.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  animate={{
                    fill: isDark ? colors.darkFill : colors.fill,
                    stroke: isDark ? colors.darkStroke : colors.stroke,
                  }}
                  strokeWidth={isActive ? 2 : 1.5}
                  transition={{ duration: 0.4 }}
                />
                <text x={task.x + NODE_W / 2} y={task.y + 20} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill={isDark ? colors.darkText : colors.text}>
                  {task.label}
                </text>
                <text x={task.x + NODE_W / 2} y={task.y + 38} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="monospace" fill={isDark ? colors.darkText : colors.text} opacity={0.8}>
                  {statusLabel}
                </text>
              </g>
            );
          })}

          {currentStep === 4 && (
            <motion.g initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <rect x={445} y={118} width={170} height={22} rx={4} fill={isDark ? "#451a03" : "#fef2f2"} stroke={isDark ? "#dc2626" : "#fca5a5"} strokeWidth={1} />
              <text x={530} y={132} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="monospace" fill={isDark ? "#f87171" : "#dc2626"}>
                {c.blockedNote}
              </text>
            </motion.g>
          )}
        </svg>

        <div className="mt-3 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
          <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
          </svg>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-medium text-zinc-600 dark:text-zinc-300">{c.persistencePath}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{c.persistenceDesc}</span>
          </div>
          <motion.div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          {(["pending", "in_progress", "completed", "blocked"] as TaskStatus[]).map((s) => {
            const bg = s === "pending" ? "bg-zinc-300 dark:bg-zinc-600" : s === "in_progress" ? "bg-amber-400 dark:bg-amber-600" : s === "completed" ? "bg-emerald-400 dark:bg-emerald-600" : "bg-red-400 dark:bg-red-600";
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded ${bg}`} />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{c.legendLabels[s]}</span>
              </div>
            );
          })}
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
        stepDescription={stepInfo.description}
      />
    </section>
  );
}
