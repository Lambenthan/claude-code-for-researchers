"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useLocale } from "@/lib/i18n";

type TaskStatus = "pending" | "in_progress" | "done";

interface Task {
  id: number;
  label: string;
  status: TaskStatus;
}

interface Copy {
  title: string;
  pendingCol: string;
  inProgressCol: string;
  doneCol: string;
  nagLabel: string;
  nagMessage: string;
  progress: string;
  complete: string;
  statusLabels: Record<TaskStatus, string>;
  baseTasks: { id: number; label: string }[];
  steps: { title: string; desc: string }[];
}

const COPY_ZH: Copy = {
  title: "待办清单与提醒系统",
  pendingCol: "待办",
  inProgressCol: "进行中",
  doneCol: "已完成",
  nagLabel: "提醒计时器",
  nagMessage: '系统提醒："你还有未完成的任务，先做一条吧！"',
  progress: "进度",
  complete: "条完成",
  statusLabels: { pending: "待办", in_progress: "进行中", done: "完成" },
  baseTasks: [
    { id: 1, label: "do0_setup 建宏与样本剔除" },
    { id: 2, label: "do1_esg_import 灌华证 ESG" },
    { id: 3, label: "do2_csmar_vars 构造控制变量" },
    { id: 4, label: "do3_myopia_merge 合并 MDA 短视" },
  ],
  steps: [
    { title: "拉出清单", desc: "TodoWrite 让模型把任务清单写出来。所有任务初始状态都是待办。" },
    { title: "第 1 轮 — 空转", desc: "模型在做别的事，没动清单。提醒计时器加 1。" },
    { title: "第 2 轮 — 还在空转", desc: "两轮没动清单。压力上来了。" },
    { title: "提醒！", desc: "达到阈值！系统注入提醒：'你还有待办任务，先做一条吧！'" },
    { title: "做完一条", desc: "模型完成第 1 条。计时器归零——动清单就重置压力。" },
    { title: "自发推进", desc: "模型学会这个模式后，开始主动接下一条不用催。" },
    { title: "全部完成", desc: "可见清单 + 提醒压力 = 长任务稳定推进。" },
  ],
};

const COPY_EN: Copy = {
  title: "TodoWrite Nag System",
  pendingCol: "Pending",
  inProgressCol: "In Progress",
  doneCol: "Done",
  nagLabel: "Nag Timer",
  nagMessage: 'SYSTEM: "You have pending tasks. Pick one up now!"',
  progress: "Progress",
  complete: "complete",
  statusLabels: { pending: "pending", in_progress: "in progress", done: "done" },
  baseTasks: [
    { id: 1, label: "do0_setup: macros & sample filter" },
    { id: 2, label: "do1_esg_import: load Huazheng ESG" },
    { id: 3, label: "do2_csmar_vars: build controls" },
    { id: 4, label: "do3_myopia_merge: merge MDA myopia" },
  ],
  steps: [
    { title: "The Plan", desc: "TodoWrite gives the model a visible plan. All tasks start as pending." },
    { title: "Round 1 -- Idle", desc: "The model does work but doesn't touch its todos. The nag counter increments." },
    { title: "Round 2 -- Still Idle", desc: "Two rounds without progress. Pressure builds." },
    { title: "NAG!", desc: "Threshold reached! System message injected: 'You have pending tasks. Pick one up now!'" },
    { title: "Task Complete", desc: "The model completes the task. Timer stays at 0 -- working on todos resets the counter." },
    { title: "Self-Directed", desc: "Once the model learns the pattern, it picks up tasks voluntarily." },
    { title: "Mission Accomplished", desc: "Visible plan + nag pressure = reliable task completion." },
  ],
};

const STATUS_PER_STEP: TaskStatus[][] = [
  ["pending", "pending", "pending", "pending"],
  ["pending", "pending", "pending", "pending"],
  ["pending", "pending", "pending", "pending"],
  ["in_progress", "pending", "pending", "pending"],
  ["done", "pending", "pending", "pending"],
  ["done", "in_progress", "pending", "pending"],
  ["done", "done", "done", "in_progress"],
];

const NAG_TIMER_PER_STEP = [0, 1, 2, 3, 0, 0, 0];
const NAG_THRESHOLD = 3;
const NAG_FIRES_PER_STEP = [false, false, false, true, false, false, false];

function KanbanColumn({
  title,
  tasks,
  statusLabels,
  accentClass,
  headerBg,
}: {
  title: string;
  tasks: Task[];
  statusLabels: Record<TaskStatus, string>;
  accentClass: string;
  headerBg: string;
}) {
  return (
    <div className="flex min-h-[280px] flex-1 flex-col rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
      <div className={`rounded-t-lg px-3 py-2 text-center text-xs font-bold uppercase tracking-wider ${headerBg}`}>
        {title}
        <span className={`ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${accentClass}`}>
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} statusLabels={statusLabels} />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-xs text-zinc-400 dark:text-zinc-600">
            --
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, statusLabels }: { task: Task; statusLabels: Record<TaskStatus, string> }) {
  const statusStyles: Record<TaskStatus, string> = {
    pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  };
  const borderStyles: Record<TaskStatus, string> = {
    pending: "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800",
    in_progress: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30",
    done: "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30",
  };
  return (
    <motion.div
      layout
      layoutId={`task-${task.id}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`rounded-md border p-2.5 ${borderStyles[task.status]}`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">#{task.id}</span>
        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${statusStyles[task.status]}`}>
          {statusLabels[task.status]}
        </span>
      </div>
      <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{task.label}</div>
    </motion.div>
  );
}

function NagGauge({ value, max, firing, label }: { value: number; max: number; firing: boolean; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor =
    value === 0
      ? "bg-zinc-300 dark:bg-zinc-600"
      : value === 1
        ? "bg-green-400 dark:bg-green-500"
        : value === 2
          ? "bg-yellow-400 dark:bg-yellow-500"
          : "bg-red-500 dark:bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{value}/{max}</span>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%`, ...(firing ? { scale: [1, 1.05, 1] } : {}) }}
          transition={{ width: { duration: 0.5, ease: "easeOut" }, scale: { duration: 0.3, repeat: 2 } }}
        />
        {firing && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            transition={{ duration: 1 }}
          />
        )}
      </div>
    </div>
  );
}

export default function TodoWrite({ title }: { title?: string }) {
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
  } = useSteppedVisualization({ totalSteps: 7, autoPlayInterval: 2500 });

  const tasks: Task[] = c.baseTasks.map((bt, i) => ({
    ...bt,
    status: STATUS_PER_STEP[currentStep][i],
  }));
  const nagValue = NAG_TIMER_PER_STEP[currentStep];
  const nagFires = NAG_FIRES_PER_STEP[currentStep];
  const stepInfo = c.steps[currentStep];

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <section className="min-h-[500px] space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 space-y-2">
          <NagGauge value={nagValue} max={NAG_THRESHOLD} firing={nagFires} label={c.nagLabel} />
          <AnimatePresence>
            {nagFires && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-300"
              >
                {c.nagMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3">
          <KanbanColumn
            title={c.pendingCol}
            tasks={pendingTasks}
            statusLabels={c.statusLabels}
            accentClass="bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
            headerBg="bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          />
          <KanbanColumn
            title={c.inProgressCol}
            tasks={inProgressTasks}
            statusLabels={c.statusLabels}
            accentClass="bg-amber-200 text-amber-700 dark:bg-amber-800 dark:text-amber-200"
            headerBg="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          />
          <KanbanColumn
            title={c.doneCol}
            tasks={doneTasks}
            statusLabels={c.statusLabels}
            accentClass="bg-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200"
            headerBg="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
          />
        </div>

        <div className="mt-3 flex items-center justify-between rounded-md bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {c.progress}: {doneTasks.length}/{tasks.length} {c.complete}
          </span>
          <div className="flex gap-0.5">
            {tasks.map((t) => (
              <div
                key={t.id}
                className={`h-2 w-6 rounded-sm ${
                  t.status === "done"
                    ? "bg-emerald-500"
                    : t.status === "in_progress"
                      ? "bg-amber-400"
                      : "bg-zinc-300 dark:bg-zinc-600"
                }`}
              />
            ))}
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
