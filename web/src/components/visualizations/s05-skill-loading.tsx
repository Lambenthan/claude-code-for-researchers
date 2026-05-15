"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import { StepControls } from "@/components/visualizations/shared/step-controls";
import { useLocale } from "@/lib/i18n";

interface SkillEntry {
  name: string;
  summary: string;
  fullTokens: number;
  content: string[];
}

interface Copy {
  title: string;
  systemPrompt: string;
  alwaysPresent: string;
  availableSkills: string;
  userTypes: string;
  toolResult: string;
  mechanismNote: string;
  layer1Label: string;
  layer1Value: string;
  layer2Label: string;
  layer2Value: string;
  tokensLabel: string;
  skills: SkillEntry[];
  steps: { title: string; description: string }[];
}

const COPY_ZH: Copy = {
  title: "Skill 按需加载",
  systemPrompt: "系统提示词",
  alwaysPresent: "常驻",
  availableSkills: "# 已装 Skill",
  userTypes: "用户输入：",
  toolResult: "工具结果",
  mechanismNote:
    "Skill 工具把规则全文作为工具结果回到对话。模型在下一轮看到这段内容，按规则推进。系统提示词里只有索引摘要，不被规则全文撑大。",
  layer1Label: "第 1 层",
  layer1Value: "常驻，约 120 token",
  layer2Label: "第 2 层",
  layer2Value: "按需加载，每条 300-500 token",
  tokensLabel: "Token",
  skills: [
    {
      name: "/paper-protect-terminology",
      summary: "跨文件改写或术语统一前先列保护清单",
      fullTokens: 350,
      content: [
        "1. 复读 CLAUDE.md 第二节的 14 词保护清单（耐心资本 / 稳定型机构投资者 等）",
        "2. 扫所有 07_论文写作/ 文件定位每个保护词的实际写法",
        "3. 列出被替换为禁用同义词的位置（长期资本 / 长线资金 等）",
        "4. 给用户清单逐处确认后才统一回保护词",
      ],
    },
    {
      name: "/paper-backup-before-word",
      summary: "改 .docx 前先 cp 一份带时间戳的备份",
      fullTokens: 290,
      content: [
        "1. 检测 .docx 文件路径",
        "2. cp file.docx file.bak.YYYYMMDD-HHMMSS.docx",
        "3. 若可，优先用 markitdown 转 LaTeX 再编辑",
        "4. 操作完成后提醒用户打开 Word 验证完整性",
      ],
    },
    {
      name: "/paper-pilot-before-batch",
      summary: "≥30 条目的批量任务先在 3-5 个样本上跑",
      fullTokens: 320,
      content: [
        "1. 识别批量任务规模（如稳健性 13 组、参考文献 62 条）",
        "2. 随机抽 3-5 条做小样本试跑",
        "3. 把试跑结果返给用户验证逻辑",
        "4. 用户确认后才全量执行",
      ],
    },
    {
      name: "/paper-verify-before-handoff",
      summary: "交付前跑硬检查清单",
      fullTokens: 480,
      content: [
        "1. 术语一致性（CLAUDE.md 保护清单）",
        "2. 引用完整性（references.bib vs 正文 \\cite）",
        "3. 数据正确性（_NUMBERS.md vs 表格 / log）",
        "4. 图表编号、内部交叉引用、AIGC 模式自查",
      ],
    },
  ],
  steps: [
    {
      title: "第 1 层：索引常驻",
      description: "所有已装 skill 在系统提示词里只占一行索引：名字 + 一句话描述。",
    },
    {
      title: "Skill 触发",
      description: "模型识别到用户的指令匹配某个 skill 的描述，决定加载它。",
    },
    {
      title: "第 2 层：注入规则全文",
      description: "SKILL.md 的全文作为工具结果注入对话，不进系统提示词。",
    },
    {
      title: "规则已在上下文",
      description: "规则像普通的工具返回一样出现在对话里，模型按它走下一步。",
    },
    {
      title: "可叠加多个 skill",
      description: "多个 skill 可以陆续加载。索引一直在，规则全文按场景出现、过后随对话历史压缩。",
    },
    {
      title: "两层架构",
      description: "第 1 层常驻、占空间小；第 2 层按需加载、内容详细。两层职责清楚分开。",
    },
  ],
};

const COPY_EN: Copy = {
  title: "On-Demand Skill Loading",
  systemPrompt: "System Prompt",
  alwaysPresent: "always present",
  availableSkills: "# Available Skills",
  userTypes: "User types:",
  toolResult: "tool_result",
  mechanismNote:
    "The Skill tool returns content as a tool_result message. The model sees it in context and follows the instructions. No system prompt bloat.",
  layer1Label: "LAYER 1",
  layer1Value: "Always present, ~120 tokens",
  layer2Label: "LAYER 2",
  layer2Value: "On demand, ~300-500 tokens each",
  tokensLabel: "Tokens",
  skills: [
    {
      name: "/paper-protect-terminology",
      summary: "Read CLAUDE.md term-lock list before any cross-file edit",
      fullTokens: 350,
      content: [
        "1. Re-read the 14-term protected list in CLAUDE.md §2",
        "2. Scan chapters/ for each protected term's actual wording",
        "3. List positions where a banned synonym appears (long-term capital, etc.)",
        "4. Confirm each position with the user before any unified replace",
      ],
    },
    {
      name: "/paper-backup-before-word",
      summary: "cp a timestamped backup before editing any .docx",
      fullTokens: 290,
      content: [
        "1. Detect the .docx file path",
        "2. cp file.docx file.bak.YYYYMMDD-HHMMSS.docx",
        "3. Prefer markitdown to convert to LaTeX before editing if possible",
        "4. Remind the user to open Word and verify integrity",
      ],
    },
    {
      name: "/paper-pilot-before-batch",
      summary: "Run any ≥30-item batch task on a 3-5 sample first",
      fullTokens: 320,
      content: [
        "1. Detect batch size (13 robustness specs, 62 BibTeX entries, etc.)",
        "2. Randomly sample 3-5 items and run them",
        "3. Return the pilot results to the user for logic verification",
        "4. Run the full batch only after explicit user approval",
      ],
    },
    {
      name: "/paper-verify-before-handoff",
      summary: "Hard checklist before handing the paper to advisor / journal",
      fullTokens: 480,
      content: [
        "1. Terminology consistency (CLAUDE.md protected list)",
        "2. Citation completeness (references.bib vs body \\cite)",
        "3. Data correctness (_NUMBERS.md vs tables / logs)",
        "4. Figure numbering, cross-refs, AIGC self-check",
      ],
    },
  ],
  steps: [
    {
      title: "Layer 1: Compact Summaries",
      description:
        "All skills are summarized in the system prompt. Compact, always present.",
    },
    {
      title: "Skill Invocation",
      description:
        "The model recognizes a skill invocation and triggers the Skill tool.",
    },
    {
      title: "Layer 2: Full Injection",
      description:
        "The full skill instructions are injected as a tool_result, not into the system prompt.",
    },
    {
      title: "In Context Now",
      description:
        "The detailed instructions appear as if a tool returned them. The model follows them precisely.",
    },
    {
      title: "Stack Skills",
      description:
        "Multiple skills can be loaded. Only summaries are permanent; full content comes and goes.",
    },
    {
      title: "Two-Layer Architecture",
      description:
        "Layer 1: always present, tiny. Layer 2: loaded on demand, detailed. Elegant separation.",
    },
  ],
};

const TOKEN_STATES = [120, 120, 440, 440, 780, 780];
const MAX_TOKEN_DISPLAY = 1000;

export default function SkillLoading({ title }: { title?: string }) {
  const locale = useLocale();
  const c = locale === "zh" ? COPY_ZH : COPY_EN;
  const SKILLS = c.skills;
  const STEPS = c.steps;

  const {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    isPlaying,
    toggleAutoPlay,
  } = useSteppedVisualization({ totalSteps: STEPS.length, autoPlayInterval: 2500 });

  const tokenCount = TOKEN_STATES[currentStep];
  const highlightedSkill = currentStep >= 1 && currentStep <= 3 ? 0 : currentStep >= 4 ? 1 : -1;
  const showFirstContent = currentStep >= 2;
  const showSecondContent = currentStep >= 4;
  const firstContentFaded = currentStep >= 5;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title || c.title}
      </h2>

      <div
        className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
        style={{ minHeight: 500 }}
      >
        <div className="flex gap-6">
          {/* Main content area */}
          <div className="flex-1 space-y-4">
            {/* System Prompt Block */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-zinc-400" />
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  {c.systemPrompt}
                </span>
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 dark:bg-zinc-800">
                  {c.alwaysPresent}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-300 bg-zinc-900 p-4 dark:border-zinc-600">
                <div className="mb-2 font-mono text-[10px] text-zinc-500">
                  {c.availableSkills}
                </div>
                <div className="space-y-1.5">
                  {SKILLS.map((skill, i) => {
                    const isHighlighted = i === highlightedSkill;
                    return (
                      <motion.div
                        key={skill.name}
                        animate={{
                          boxShadow: isHighlighted
                            ? "0 0 12px 2px rgba(59, 130, 246, 0.5)"
                            : "0 0 0 0px rgba(59, 130, 246, 0)",
                        }}
                        transition={{ duration: 0.4 }}
                        className={`rounded px-3 py-1.5 font-mono text-xs transition-colors ${
                          isHighlighted
                            ? "bg-blue-900/60 text-blue-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        <span className="font-semibold text-zinc-200">
                          {skill.name}
                        </span>
                        {" - "}
                        {skill.summary}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* User invocation indicator */}
            <AnimatePresence>
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-950/30"
                >
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {c.userTypes}
                  </span>
                  <code className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                    {SKILLS[0].name}
                  </code>
                </motion.div>
              )}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-950/30"
                >
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {c.userTypes}
                  </span>
                  <code className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                    {SKILLS[1].name}
                  </code>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connecting arrow */}
            <AnimatePresence>
              {(showFirstContent || showSecondContent) && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-px bg-blue-400 dark:bg-blue-500" />
                    <div className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-blue-400 dark:border-t-blue-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Skill Content Blocks */}
            <div className="space-y-3">
              <AnimatePresence>
                {showFirstContent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: firstContentFaded ? 0.4 : 1,
                      height: "auto",
                    }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border-2 border-blue-300 bg-white p-4 dark:border-blue-700 dark:bg-zinc-800">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                            SKILL.md: {SKILLS[0].name}
                          </span>
                        </div>
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                          {c.toolResult}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {SKILLS[0].content.map((line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{
                              opacity: firstContentFaded ? 0.5 : 1,
                              x: 0,
                            }}
                            transition={{ delay: i * 0.08 }}
                            className="font-mono text-xs text-zinc-600 dark:text-zinc-300"
                          >
                            {line}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showSecondContent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border-2 border-purple-300 bg-white p-4 dark:border-purple-700 dark:bg-zinc-800">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500" />
                          <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                            SKILL.md: {SKILLS[1].name}
                          </span>
                        </div>
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[10px] text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                          {c.toolResult}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {SKILLS[1].content.map((line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="font-mono text-xs text-zinc-600 dark:text-zinc-300"
                          >
                            {line}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mechanism annotation on step 3 */}
            <AnimatePresence>
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                >
                  {c.mechanismNote}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Final overview label on step 5 */}
            <AnimatePresence>
              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex-1 rounded border border-zinc-200 bg-zinc-50 p-2 text-center dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {c.layer1Label}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300">
                      {c.layer1Value}
                    </div>
                  </div>
                  <div className="flex-1 rounded border border-blue-200 bg-blue-50 p-2 text-center dark:border-blue-700 dark:bg-blue-900/20">
                    <div className="text-[10px] font-semibold text-blue-500 dark:text-blue-400">
                      {c.layer2Label}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-300">
                      {c.layer2Value}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Token Gauge */}
          <div className="flex w-16 flex-col items-center">
            <div className="mb-1 text-center font-mono text-[10px] text-zinc-400">
              {c.tokensLabel}
            </div>
            <div
              className="relative w-8 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
              style={{ height: 300 }}
            >
              <motion.div
                animate={{
                  height: `${(tokenCount / MAX_TOKEN_DISPLAY) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute bottom-0 w-full rounded-full ${
                  tokenCount > 600
                    ? "bg-amber-500"
                    : tokenCount > 300
                      ? "bg-blue-500"
                      : "bg-emerald-500"
                }`}
              />
            </div>
            <motion.div
              key={tokenCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mt-2 text-center font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-300"
            >
              {tokenCount}
            </motion.div>
          </div>
        </div>

        {/* Step Controls */}
        <div className="mt-6">
          <StepControls
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrev={prev}
            onNext={next}
            onReset={reset}
            isPlaying={isPlaying}
            onToggleAutoPlay={toggleAutoPlay}
            stepTitle={STEPS[currentStep].title}
            stepDescription={STEPS[currentStep].description}
          />
        </div>
      </div>
    </section>
  );
}
