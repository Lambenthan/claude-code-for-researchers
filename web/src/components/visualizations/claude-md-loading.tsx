"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useLocale } from "@/lib/i18n";

interface MdFile {
  id: string;
  label: string;
  path: string;
  preview: string[];
  color: string;
}

interface Copy {
  title: string;
  filesystemHeader: string;
  systemPromptHeader: string;
  conversationHeader: string;
  walkUpLabel: string;
  loadedLabel: string;
  notLoadedLabel: string;
  compactingLabel: string;
  survivedLabel: string;
  files: MdFile[];
  steps: { title: string; description: string }[];
}

const COPY_ZH: Copy = {
  title: "CLAUDE.md 加载流程",
  filesystemHeader: "硬盘上的 CLAUDE.md 文件",
  systemPromptHeader: "系统提示词",
  conversationHeader: "对话历史",
  walkUpLabel: "向上扫描路径",
  loadedLabel: "已加载",
  notLoadedLabel: "未触发",
  compactingLabel: "auto-compact 触发 ...",
  survivedLabel: "CLAUDE.md 在系统提示词里，不受压缩影响",
  files: [
    {
      id: "user",
      label: "用户全局级",
      path: "~/.claude/CLAUDE.md",
      preview: [
        "# 我的全局偏好",
        "- 图字体：中文用 Heiti TC",
        "- commit 风格：用 Conventional Commits",
      ],
      color: "bg-purple-500",
    },
    {
      id: "project",
      label: "项目根级",
      path: "~/papers/pc-esg/CLAUDE.md",
      preview: [
        "# 耐心资本 → ESG 项目",
        "- 保护清单：耐心资本 / 稳定型机构投资者 / 关系型债权 ...",
        "- 主测度：A2（代飞 2025），稳健性走 A1 / B2 / C",
        "- 不要替我写正文 / 不要润色 / 不要降 AIGC",
      ],
      color: "bg-emerald-500",
    },
    {
      id: "subdir",
      label: "子目录级",
      path: "~/papers/pc-esg/05_分析代码/CLAUDE.md",
      preview: ["# 05_分析代码 子目录", "- do 文件按 do0–do10 编号", "- stata-mcp 跑前必须切到本目录"],
      color: "bg-amber-500",
    },
  ],
  steps: [
    {
      title: "启动前：文件躺在硬盘上",
      description:
        "硬盘上已经有三份 CLAUDE.md，按目录层级分布。Claude Code 还没启动，对话历史和系统提示词都是空的。",
    },
    {
      title: "运行 claude 启动会话",
      description:
        "Claude Code 启动时从当前目录开始往上找 CLAUDE.md：先 05_分析代码/，再 pc-esg/，再用户全局 ~/.claude/。三份都会被拾起。",
    },
    {
      title: "按层级拼到系统提示词",
      description:
        "三份 CLAUDE.md 按从最全局到最具体的顺序拼接进系统提示词。后加载的同名规则覆盖前面的。整个会话里 Claude 都看得到这份合并后的指令——保护清单、A2 主测度、写作纪律都在里面。",
    },
    {
      title: "对话开始累积",
      description:
        "你跟 Claude 来回讨论 do0–do6 的实证执行，对话历史一条一条积累。系统提示词里的 CLAUDE.md 内容始终在那里，每轮模型调用都看得到。",
    },
    {
      title: "auto-compact 触发",
      description:
        "工作内存接近上限时触发自动压缩。phase 1 的 Stata log 等过程数据被压成一段摘要，原始细节丢失。但系统提示词里的 CLAUDE.md 不在压缩范围里——它依然完整。",
    },
    {
      title: "压缩后规则仍然有效",
      description:
        "压缩后 phase 2 继续。Claude 仍然知道'保护清单 14 词不可替换'、'PC_A2 是主测度'、'不要润色正文'——这些规则就是从 CLAUDE.md 来的，每一轮都重新看得到。把关键约定放进 CLAUDE.md 比放进对话靠谱得多。",
    },
  ],
};

const COPY_EN: Copy = {
  title: "How CLAUDE.md Loads",
  filesystemHeader: "CLAUDE.md files on disk",
  systemPromptHeader: "System prompt",
  conversationHeader: "Conversation history",
  walkUpLabel: "Walking up the path",
  loadedLabel: "loaded",
  notLoadedLabel: "not triggered",
  compactingLabel: "auto-compact triggered ...",
  survivedLabel: "CLAUDE.md sits in the system prompt — compression cannot touch it",
  files: [
    {
      id: "user",
      label: "User global",
      path: "~/.claude/CLAUDE.md",
      preview: [
        "# My global prefs",
        "- Figure font: Times New Roman + Heiti TC",
        "- Commit style: Conventional Commits",
      ],
      color: "bg-purple-500",
    },
    {
      id: "project",
      label: "Project root",
      path: "~/papers/pc-esg/CLAUDE.md",
      preview: [
        "# Patient Capital → ESG",
        "- Protected terms: 耐心资本 / 稳定型机构投资者 / 关系型债权 ...",
        "- Primary measure: A2 (代飞 2025); robustness: A1 / B2 / C",
        "- Do not draft / polish / de-AIGC the paper text",
      ],
      color: "bg-emerald-500",
    },
    {
      id: "subdir",
      label: "Subdir",
      path: "~/papers/pc-esg/05_分析代码/CLAUDE.md",
      preview: ["# 05_分析代码 subdir", "- do-files numbered do0–do10", "- cd here before running stata-mcp"],
      color: "bg-amber-500",
    },
  ],
  steps: [
    {
      title: "Before launch: files sit on disk",
      description:
        "Three CLAUDE.md files exist on disk at different directory levels. Claude Code has not started; the system prompt and conversation history are both empty.",
    },
    {
      title: "Run claude to start the session",
      description:
        "On launch, Claude Code walks up from the current directory looking for CLAUDE.md files. It finds 05_分析代码/, then pc-esg/, then ~/.claude/. All three are picked up.",
    },
    {
      title: "Stitched into the system prompt",
      description:
        "The three files concatenate in priority order — most global to most specific. Later rules override earlier ones with the same key. The merged instructions (protected terms, A2 primary measure, writing discipline) stay in the system prompt for the whole session.",
    },
    {
      title: "Conversation starts to accumulate",
      description:
        "You and Claude exchange messages while running do0–do6. The conversation history grows turn by turn. The CLAUDE.md content remains in the system prompt and is visible on every model call.",
    },
    {
      title: "auto-compact triggers",
      description:
        "When working memory approaches its limit, auto-compact runs. Phase-1 Stata logs and intermediate diagnostics get summarized; raw details are dropped. But CLAUDE.md is in the system prompt — compression cannot touch it; it stays whole.",
    },
    {
      title: "Rules still in force after compaction",
      description:
        "Phase 2 continues. Claude still knows 'protected 14-term list', 'PC_A2 is the primary measure', 'no body-text polishing' — those rules come from CLAUDE.md and are re-read on every turn. Putting critical agreements in CLAUDE.md is far more reliable than leaving them in the conversation.",
    },
  ],
};

interface StepState {
  launched: boolean;
  loaded: boolean[];
  showWalkUp: boolean;
  systemPromptFilled: boolean;
  conversationVisible: boolean;
  compacting: boolean;
  postCompact: boolean;
}

const STEP_STATES: StepState[] = [
  { launched: false, loaded: [false, false, false], showWalkUp: false, systemPromptFilled: false, conversationVisible: false, compacting: false, postCompact: false },
  { launched: true,  loaded: [true,  true,  true ], showWalkUp: true,  systemPromptFilled: false, conversationVisible: false, compacting: false, postCompact: false },
  { launched: true,  loaded: [true,  true,  true ], showWalkUp: false, systemPromptFilled: true,  conversationVisible: false, compacting: false, postCompact: false },
  { launched: true,  loaded: [true,  true,  true ], showWalkUp: false, systemPromptFilled: true,  conversationVisible: true,  compacting: false, postCompact: false },
  { launched: true,  loaded: [true,  true,  true ], showWalkUp: false, systemPromptFilled: true,  conversationVisible: true,  compacting: true,  postCompact: false },
  { launched: true,  loaded: [true,  true,  true ], showWalkUp: false, systemPromptFilled: true,  conversationVisible: true,  compacting: false, postCompact: true  },
];

export default function ClaudeMdLoadingAnimation() {
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
  } = useSteppedVisualization({
    totalSteps: c.steps.length,
    autoPlayInterval: 4200,
  });

  const state = STEP_STATES[currentStep];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {c.title}
      </h2>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]" style={{ minHeight: 500 }}>
          {/* Left: filesystem layered CLAUDE.md files */}
          <div className="flex flex-col gap-3">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {c.filesystemHeader}
            </div>

            <div className="relative space-y-3">
              {c.files.map((file, i) => {
                const loaded = state.loaded[i];
                return (
                  <motion.div
                    key={file.id}
                    animate={{
                      opacity: 1,
                      x: 0,
                      borderColor: loaded ? undefined : "rgba(212, 212, 216, 0.6)",
                    }}
                    className={`relative rounded-lg border-2 p-3 transition-colors ${
                      loaded
                        ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/30"
                        : "border-zinc-200 bg-zinc-50/40 dark:border-zinc-700 dark:bg-zinc-800/30"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${file.color}`} />
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                          {file.label}
                        </span>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase ${
                          loaded
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                        }`}
                      >
                        {loaded ? c.loadedLabel : c.notLoadedLabel}
                      </span>
                    </div>
                    <div className="mb-1.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                      {file.path}
                    </div>
                    <div className="space-y-0.5 font-mono text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {file.preview.map((line, j) => (
                        <div key={j}>{line}</div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}

              {state.showWalkUp && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -right-2 top-0 flex h-full flex-col items-center"
                >
                  <div className="flex h-full w-1 flex-col justify-around rounded-full bg-gradient-to-b from-amber-200 via-emerald-200 to-purple-200 dark:from-amber-900 dark:via-emerald-900 dark:to-purple-900">
                    <div className="-mr-1.5 self-end rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {c.walkUpLabel} ↑
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: system prompt + conversation */}
          <div className="flex flex-col gap-3">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {c.systemPromptHeader}
            </div>

            <div
              className={`rounded-lg border-2 p-3 transition-colors ${
                state.systemPromptFilled
                  ? "border-blue-300 bg-blue-50/40 dark:border-blue-700 dark:bg-blue-950/30"
                  : "border-dashed border-zinc-300 bg-zinc-50/40 dark:border-zinc-700 dark:bg-zinc-800/30"
              }`}
              style={{ minHeight: 160 }}
            >
              {!state.systemPromptFilled && (
                <div className="text-xs italic text-zinc-400 dark:text-zinc-500">
                  {locale === "zh"
                    ? "（空，等待 CLAUDE.md 拼接）"
                    : "(empty, waiting for CLAUDE.md merge)"}
                </div>
              )}
              {state.systemPromptFilled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2 text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-300"
                >
                  {c.files.map((file) => (
                    <div key={file.id} className="border-l-2 pl-2" style={{ borderColor: "currentColor" }}>
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${file.color}`} />
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {file.label}
                        </span>
                      </div>
                      {file.preview.map((line, j) => (
                        <div key={j} className="font-mono">
                          {line}
                        </div>
                      ))}
                    </div>
                  ))}
                  {state.postCompact && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 rounded border border-emerald-300 bg-emerald-100/60 px-2 py-1 text-[10px] text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    >
                      ✓ {c.survivedLabel}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {c.conversationHeader}
            </div>
            <div className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50/40 p-3 dark:border-zinc-700 dark:bg-zinc-800/30">
              <AnimatePresence>
                {!state.conversationVisible && (
                  <div className="text-xs italic text-zinc-400 dark:text-zinc-500">
                    {locale === "zh" ? "（还没开始对话）" : "(no conversation yet)"}
                  </div>
                )}
                {state.conversationVisible && !state.compacting && !state.postCompact && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300"
                  >
                    <div>
                      <span className="text-blue-500">user:</span>{" "}
                      {locale === "zh" ? "跑 do6 基准回归" : "run do6 baseline"}
                    </div>
                    <div>
                      <span className="text-zinc-500">assistant:</span>{" "}
                      {locale === "zh" ? "PC_A2 主测度 β=0.0004, 26874 obs" : "PC_A2 primary β=0.0004, 26874 obs"}
                    </div>
                    <div>
                      <span className="text-blue-500">user:</span>{" "}
                      {locale === "zh" ? "跑 do7 IV/PSM" : "run do7 IV/PSM"}
                    </div>
                    <div className="text-zinc-400">...</div>
                    <div>
                      <span className="text-blue-500">user:</span>{" "}
                      {locale === "zh" ? "跑 do8 Myopia 机制" : "run do8 myopia mechanism"}
                    </div>
                  </motion.div>
                )}
                {state.compacting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2 text-[11px]"
                  >
                    <div className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      {c.compactingLabel}
                    </div>
                    <div className="text-zinc-400 line-through dark:text-zinc-600">
                      {locale === "zh" ? "do6 基准、do7 IV/PSM 中间 Stata log..." : "do6 baseline, do7 IV/PSM intermediate Stata logs..."}
                    </div>
                  </motion.div>
                )}
                {state.postCompact && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300"
                  >
                    <div className="rounded border border-zinc-300 bg-zinc-100 px-2 py-1 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {locale === "zh"
                        ? "[摘要] phase 1：26874 obs main_panel.dta；A2 β=0.0004；IV1 已矫正。phase 2 待启动 do8"
                        : "[summary] phase 1: 26874-obs main_panel.dta; A2 β=0.0004; IV1 corrected. Phase 2 do8 pending"}
                    </div>
                    <div>
                      <span className="text-blue-500">user:</span>{" "}
                      {locale === "zh" ? "继续 do8 Myopia 机制" : "continue with do8 myopia mechanism"}
                    </div>
                    <div>
                      <span className="text-zinc-500">assistant:</span>{" "}
                      {locale === "zh"
                        ? "好的，按保护清单 / A2 主测度 / 不润色规则继续"
                        : "Continuing with protected-terms / A2 primary measure / no-polish rules"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-5">
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
