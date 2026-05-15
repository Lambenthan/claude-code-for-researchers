"use client";

import { motion } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useLocale } from "@/lib/i18n";

type TaskStatus = "pending" | "in_progress" | "completed";

interface TaskRow {
  id: number;
  subject: string;
  status: TaskStatus;
  worktree: string;
}

interface WorktreeRow {
  name: string;
  branch: string;
  task: string;
  state: "none" | "active" | "kept" | "removed";
}

interface Lane {
  name: string;
  files: string[];
  highlight?: boolean;
}

interface StepState {
  title: string;
  desc: string;
  tasks: TaskRow[];
  worktrees: WorktreeRow[];
  lanes: Lane[];
  op: string;
}

interface Copy {
  title: string;
  taskBoardHeader: string;
  worktreeIndexHeader: string;
  executionLanesHeader: string;
  noWorktrees: string;
  noChanges: string;
  taskPrefix: string;
  worktreePrefix: string;
  statusLabels: Record<TaskStatus, string>;
  steps: StepState[];
}

const COPY_ZH: Copy = {
  title: "工作树任务隔离",
  taskBoardHeader: "任务板 (.tasks)",
  worktreeIndexHeader: "工作树索引 (.worktrees/index.json)",
  executionLanesHeader: "执行通道",
  noWorktrees: "还没有工作树",
  noChanges: "（无改动）",
  taskPrefix: "任务",
  worktreePrefix: "工作树",
  statusLabels: { pending: "待办", in_progress: "进行中", completed: "已完成" },
  steps: [
    {
      title: "单工作目录的痛",
      desc: "两个任务同时进行，但它们都要改同一个目录，必然冲突。",
      op: "task_create x2",
      tasks: [
        { id: 1, subject: "ESG 离散评级稳健性版", status: "in_progress", worktree: "" },
        { id: 2, subject: "E/S/G 三分项版", status: "in_progress", worktree: "" },
      ],
      worktrees: [],
      lanes: [
        { name: "主仓库", files: ["do6_baseline.do", "do6_baseline.do"], highlight: true },
        { name: "wt/pc-esg-discrete", files: [] },
        { name: "wt/pc-esg-subscores", files: [] },
      ],
    },
    {
      title: "为任务 1 分配通道",
      desc: "建一个工作树通道，绑定到任务 1 上，主权清晰。",
      op: "worktree_create(name='pc-esg-discrete', task_id=1)",
      tasks: [
        { id: 1, subject: "ESG 离散评级稳健性版", status: "in_progress", worktree: "pc-esg-discrete" },
        { id: 2, subject: "E/S/G 三分项版", status: "in_progress", worktree: "" },
      ],
      worktrees: [
        { name: "pc-esg-discrete", branch: "wt/pc-esg-discrete", task: "#1", state: "active" },
      ],
      lanes: [
        { name: "主仓库", files: ["do6_baseline.do"] },
        { name: "wt/pc-esg-discrete", files: ["do6_baseline.do"], highlight: true },
        { name: "wt/pc-esg-subscores", files: [] },
      ],
    },
    {
      title: "为任务 2 分配通道",
      desc: "通道创建和任务绑定可以分两步做。任务 2 在通道创建后再绑定上。",
      op: "worktree_create(name='pc-esg-subscores')\ntask_bind_worktree(task_id=2, worktree='pc-esg-subscores')",
      tasks: [
        { id: 1, subject: "ESG 离散评级稳健性版", status: "in_progress", worktree: "pc-esg-discrete" },
        { id: 2, subject: "E/S/G 三分项版", status: "in_progress", worktree: "pc-esg-subscores" },
      ],
      worktrees: [
        { name: "pc-esg-discrete", branch: "wt/pc-esg-discrete", task: "#1", state: "active" },
        { name: "pc-esg-subscores", branch: "wt/pc-esg-subscores", task: "#2", state: "active" },
      ],
      lanes: [
        { name: "主仓库", files: [] },
        { name: "wt/pc-esg-discrete", files: ["do6_baseline.do"] },
        { name: "wt/pc-esg-subscores", files: ["do6_baseline.do"], highlight: true },
      ],
    },
    {
      title: "在隔离通道里跑命令",
      desc: "每条命令按选中的通道目录路由，不和主目录冲突。",
      op: "worktree_run('pc-esg-discrete', 'stata do do6_baseline.do')",
      tasks: [
        { id: 1, subject: "ESG 离散评级稳健性版", status: "in_progress", worktree: "pc-esg-discrete" },
        { id: 2, subject: "E/S/G 三分项版", status: "in_progress", worktree: "pc-esg-subscores" },
      ],
      worktrees: [
        { name: "pc-esg-discrete", branch: "wt/pc-esg-discrete", task: "#1", state: "active" },
        { name: "pc-esg-subscores", branch: "wt/pc-esg-subscores", task: "#2", state: "active" },
      ],
      lanes: [
        { name: "主仓库", files: [] },
        { name: "wt/pc-esg-discrete", files: ["do6_baseline.do", "baseline_discrete.log"], highlight: true },
        { name: "wt/pc-esg-subscores", files: ["do6_baseline.do", "baseline_subscores.log"] },
      ],
    },
    {
      title: "保留一个通道，关掉另一个",
      desc: "收尾时可以分别处理：pc-esg-subscores 保留继续用，pc-esg-discrete 删掉并把任务 1 标完成。",
      op: "worktree_keep('pc-esg-subscores')\nworktree_remove('pc-esg-discrete', complete_task=true)\nworktree_events(limit=10)",
      tasks: [
        { id: 1, subject: "ESG 离散评级稳健性版", status: "completed", worktree: "" },
        { id: 2, subject: "E/S/G 三分项版", status: "in_progress", worktree: "pc-esg-subscores" },
      ],
      worktrees: [
        { name: "pc-esg-discrete", branch: "wt/pc-esg-discrete", task: "#1", state: "removed" },
        { name: "pc-esg-subscores", branch: "wt/pc-esg-subscores", task: "#2", state: "kept" },
      ],
      lanes: [
        { name: "主仓库", files: [] },
        { name: "wt/pc-esg-discrete", files: [] },
        { name: "wt/pc-esg-subscores", files: ["do6_baseline.do"], highlight: true },
      ],
    },
    {
      title: "隔离 + 协调 + 事件",
      desc: "任务板是共享真相，工作树通道做执行隔离，事件流提供可审计的旁路追踪。",
      op: "task_list + worktree_list + worktree_events",
      tasks: [
        { id: 1, subject: "ESG 离散评级稳健性版", status: "completed", worktree: "" },
        { id: 2, subject: "E/S/G 三分项版", status: "in_progress", worktree: "pc-esg-subscores" },
      ],
      worktrees: [
        { name: "pc-esg-discrete", branch: "wt/pc-esg-discrete", task: "#1", state: "removed" },
        { name: "pc-esg-subscores", branch: "wt/pc-esg-subscores", task: "#2", state: "kept" },
      ],
      lanes: [
        { name: "主仓库", files: [] },
        { name: "wt/pc-esg-discrete", files: [] },
        { name: "wt/pc-esg-subscores", files: ["do6_baseline.do"], highlight: true },
      ],
    },
  ],
};

const COPY_EN: Copy = {
  title: "Worktree Task Isolation",
  taskBoardHeader: "Task Board (.tasks)",
  worktreeIndexHeader: "Worktree Index (.worktrees/index.json)",
  executionLanesHeader: "Execution Lanes",
  noWorktrees: "no worktrees yet",
  noChanges: "(no changes)",
  taskPrefix: "task",
  worktreePrefix: "worktree",
  statusLabels: { pending: "pending", in_progress: "in_progress", completed: "completed" },
  steps: [
    {
      title: "Single Workspace Pain",
      desc: "Two parallel manuscript versions are active, but both would touch the same files in one directory and collide.",
      op: "task_create x2",
      tasks: [
        { id: 1, subject: "ESG-discrete robustness", status: "in_progress", worktree: "" },
        { id: 2, subject: "E/S/G subscores", status: "in_progress", worktree: "" },
      ],
      worktrees: [],
      lanes: [
        { name: "main", files: ["do6_baseline.do", "do6_baseline.do"], highlight: true },
        { name: "wt/pc-esg-discrete", files: [] },
        { name: "wt/pc-esg-subscores", files: [] },
      ],
    },
    {
      title: "Allocate Lane for Task 1",
      desc: "Create a worktree lane and associate it with task 1 for clear ownership.",
      op: "worktree_create(name='pc-esg-discrete', task_id=1)",
      tasks: [
        { id: 1, subject: "ESG-discrete robustness", status: "in_progress", worktree: "pc-esg-discrete" },
        { id: 2, subject: "E/S/G subscores", status: "in_progress", worktree: "" },
      ],
      worktrees: [
        { name: "pc-esg-discrete", branch: "wt/pc-esg-discrete", task: "#1", state: "active" },
      ],
      lanes: [
        { name: "main", files: ["do6_baseline.do"] },
        { name: "wt/pc-esg-discrete", files: ["do6_baseline.do"], highlight: true },
        { name: "wt/pc-esg-subscores", files: [] },
      ],
    },
    {
      title: "Allocate Lane for Task 2",
      desc: "Lane creation and task association can be separate. Here task 2 binds after lane creation.",
      op: "worktree_create(name='pc-esg-subscores')\ntask_bind_worktree(task_id=2, worktree='pc-esg-subscores')",
      tasks: [
        { id: 1, subject: "ESG-discrete robustness", status: "in_progress", worktree: "pc-esg-discrete" },
        { id: 2, subject: "E/S/G subscores", status: "in_progress", worktree: "pc-esg-subscores" },
      ],
      worktrees: [
        { name: "pc-esg-discrete", branch: "wt/pc-esg-discrete", task: "#1", state: "active" },
        { name: "pc-esg-subscores", branch: "wt/pc-esg-subscores", task: "#2", state: "active" },
      ],
      lanes: [
        { name: "main", files: [] },
        { name: "wt/pc-esg-discrete", files: ["do6_baseline.do"] },
        { name: "wt/pc-esg-subscores", files: ["do6_baseline.do"], highlight: true },
      ],
    },
    {
      title: "Run Commands in Isolated Lanes",
      desc: "Each command routes by selected lane directory, not by the shared root.",
      op: "worktree_run('pc-esg-discrete', 'stata do do6_baseline.do')",
      tasks: [
        { id: 1, subject: "ESG-discrete robustness", status: "in_progress", worktree: "pc-esg-discrete" },
        { id: 2, subject: "E/S/G subscores", status: "in_progress", worktree: "pc-esg-subscores" },
      ],
      worktrees: [
        { name: "pc-esg-discrete", branch: "wt/pc-esg-discrete", task: "#1", state: "active" },
        { name: "pc-esg-subscores", branch: "wt/pc-esg-subscores", task: "#2", state: "active" },
      ],
      lanes: [
        { name: "main", files: [] },
        { name: "wt/pc-esg-discrete", files: ["do6_baseline.do", "baseline_discrete.log"], highlight: true },
        { name: "wt/pc-esg-subscores", files: ["do6_baseline.do", "baseline_subscores.log"] },
      ],
    },
    {
      title: "Keep One Lane, Close Another",
      desc: "Closeout can mix decisions: keep pc-esg-subscores active for follow-up, remove pc-esg-discrete and mark task 1 done.",
      op: "worktree_keep('pc-esg-subscores')\nworktree_remove('pc-esg-discrete', complete_task=true)\nworktree_events(limit=10)",
      tasks: [
        { id: 1, subject: "ESG-discrete robustness", status: "completed", worktree: "" },
        { id: 2, subject: "E/S/G subscores", status: "in_progress", worktree: "pc-esg-subscores" },
      ],
      worktrees: [
        { name: "pc-esg-discrete", branch: "wt/pc-esg-discrete", task: "#1", state: "removed" },
        { name: "pc-esg-subscores", branch: "wt/pc-esg-subscores", task: "#2", state: "kept" },
      ],
      lanes: [
        { name: "main", files: [] },
        { name: "wt/pc-esg-discrete", files: [] },
        { name: "wt/pc-esg-subscores", files: ["do6_baseline.do"], highlight: true },
      ],
    },
    {
      title: "Isolation + Coordination + Events",
      desc: "The board tracks shared truth, worktree lanes isolate execution, and events provide auditable side-channel traces.",
      op: "task_list + worktree_list + worktree_events",
      tasks: [
        { id: 1, subject: "ESG-discrete robustness", status: "completed", worktree: "" },
        { id: 2, subject: "E/S/G subscores", status: "in_progress", worktree: "pc-esg-subscores" },
      ],
      worktrees: [
        { name: "pc-esg-discrete", branch: "wt/pc-esg-discrete", task: "#1", state: "removed" },
        { name: "pc-esg-subscores", branch: "wt/pc-esg-subscores", task: "#2", state: "kept" },
      ],
      lanes: [
        { name: "main", files: [] },
        { name: "wt/pc-esg-discrete", files: [] },
        { name: "wt/pc-esg-subscores", files: ["do6_baseline.do"], highlight: true },
      ],
    },
  ],
};

function statusClass(status: TaskStatus): string {
  if (status === "completed") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (status === "in_progress") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
}

function worktreeClass(state: WorktreeRow["state"]): string {
  if (state === "active") return "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20";
  if (state === "kept") return "border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-900/20";
  if (state === "removed") return "border-zinc-200 bg-zinc-100 opacity-70 dark:border-zinc-700 dark:bg-zinc-800";
  return "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900";
}

export default function WorktreeTaskIsolation({ title }: { title?: string }) {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;
  const STEPS = c.steps;

  const vis = useSteppedVisualization({ totalSteps: STEPS.length, autoPlayInterval: 2600 });
  const step = STEPS[vis.currentStep];

  return (
    <section className="min-h-[500px] space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 font-mono text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
          {step.op}
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-md border border-zinc-200 dark:border-zinc-700">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {c.taskBoardHeader}
            </div>
            <div className="space-y-2 p-2">
              {step.tasks.map((task) => (
                <motion.div
                  key={`${task.id}-${task.status}-${task.worktree}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded border border-zinc-200 p-2 text-xs dark:border-zinc-700"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">#{task.id}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${statusClass(task.status)}`}>
                      {c.statusLabels[task.status]}
                    </span>
                  </div>
                  <div className="mt-1 font-medium text-zinc-800 dark:text-zinc-100">{task.subject}</div>
                  <div className="mt-1 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                    {c.worktreePrefix}: {task.worktree || "-"}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-zinc-200 dark:border-zinc-700">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {c.worktreeIndexHeader}
            </div>
            <div className="space-y-2 p-2">
              {step.worktrees.length === 0 && (
                <div className="rounded border border-dashed border-zinc-300 px-3 py-4 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  {c.noWorktrees}
                </div>
              )}
              {step.worktrees.map((wt) => (
                <motion.div
                  key={`${wt.name}-${wt.state}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded border p-2 text-xs ${worktreeClass(wt.state)}`}
                >
                  <div className="font-mono text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">{wt.name}</div>
                  <div className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">{wt.branch}</div>
                  <div className="mt-1 text-[10px] text-zinc-600 dark:text-zinc-300">{c.taskPrefix}: {wt.task}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-zinc-200 dark:border-zinc-700">
            <div className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {c.executionLanesHeader}
            </div>
            <div className="space-y-2 p-2">
              {step.lanes.map((lane) => (
                <motion.div
                  key={`${lane.name}-${lane.files.join(",")}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded border p-2 text-xs ${
                    lane.highlight
                      ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                      : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                  }`}
                >
                  <div className="font-mono text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">{lane.name}</div>
                  <div className="mt-1 space-y-1 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                    {lane.files.length === 0 ? (
                      <div>{c.noChanges}</div>
                    ) : (
                      lane.files.map((f) => <div key={f}>{f}</div>)
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/60">
          <div className="font-medium text-zinc-800 dark:text-zinc-100">{step.title}</div>
          <div className="text-zinc-600 dark:text-zinc-300">{step.desc}</div>
        </div>
      </div>

      <StepControls
        currentStep={vis.currentStep}
        totalSteps={vis.totalSteps}
        onPrev={vis.prev}
        onNext={vis.next}
        onReset={vis.reset}
        isPlaying={vis.isPlaying}
        onToggleAutoPlay={vis.toggleAutoPlay}
        stepTitle={step.title}
        stepDescription={step.desc}
      />
    </section>
  );
}
