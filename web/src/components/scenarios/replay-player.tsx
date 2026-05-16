"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  User,
  Wrench,
  CheckCircle2,
  Bot,
  Lightbulb,
  StickyNote,
  Square,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSteppedVisualization } from "@/hooks/useSteppedVisualization";
import type { ReplayStep } from "@/lib/scenarios";

interface ReplayPlayerProps {
  steps: ReplayStep[];
  labels: ReplayLabels;
}

export interface ReplayLabels {
  title: string;
  subtitle: string;
  reset: string;
  prev: string;
  next: string;
  play: string;
  pause: string;
  speed: string;
  step: string;
  roleUser: string;
  roleAssistant: string;
  roleToolUse: string;
  roleToolResult: string;
  roleThinking: string;
  roleNote: string;
  roleStop: string;
}

const SPEED_OPTIONS = [
  { label: "0.5×", value: 3200 },
  { label: "1×", value: 1600 },
  { label: "2×", value: 800 },
  { label: "4×", value: 400 },
];

export function ReplayPlayer({ steps, labels }: ReplayPlayerProps) {
  const [speedIdx, setSpeedIdx] = useState(1);
  const interval = SPEED_OPTIONS[speedIdx]?.value ?? 1600;
  const {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    isPlaying,
    toggleAutoPlay,
  } = useSteppedVisualization({
    totalSteps: steps.length,
    autoPlayInterval: interval,
    autoStart: false,
    loop: false,
    pauseOnManual: true,
  });

  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (!listRef.current) return;
    const target = listRef.current.querySelector<HTMLLIElement>(
      `li[data-step-index="${currentStep}"]`
    );
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentStep]);

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <header className="flex items-baseline justify-between gap-4 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white dark:bg-zinc-100 dark:text-zinc-900">
              replay
            </span>
            <h3 className="text-sm font-semibold tracking-tight">
              {labels.title}
            </h3>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {labels.subtitle}
          </p>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          {labels.step} {currentStep + 1}/{totalSteps}
        </div>
      </header>

      <ol
        ref={listRef}
        className="max-h-[28rem] overflow-y-auto px-2 py-3 text-sm"
      >
        <AnimatePresence initial={false}>
          {steps.map((step, i) => {
            const visible = i <= currentStep;
            const active = i === currentStep;
            return (
              <motion.li
                key={`s-${i}`}
                data-step-index={i}
                initial={false}
                animate={{
                  opacity: visible ? 1 : 0.18,
                  y: 0,
                }}
                transition={{ duration: 0.25 }}
                className={
                  "rounded-md px-3 py-2 transition-colors " +
                  (active
                    ? "bg-blue-50 ring-1 ring-blue-300 dark:bg-blue-950/40 dark:ring-blue-700"
                    : visible
                      ? "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                      : "")
                }
              >
                <StepRow step={step} labels={labels} active={active} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      <footer className="flex items-center justify-between gap-3 border-t border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <div className="flex items-center gap-1">
          <button
            onClick={reset}
            title={labels.reset}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={prev}
            disabled={currentStep === 0}
            title={labels.prev}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={toggleAutoPlay}
            title={isPlaying ? labels.pause : labels.play}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={next}
            disabled={currentStep >= totalSteps - 1}
            title={labels.next}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <SkipForward size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500">{labels.speed}</span>
          <div className="flex gap-1 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-700">
            {SPEED_OPTIONS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSpeedIdx(i)}
                className={
                  "rounded px-2 py-0.5 font-mono text-[11px] transition-colors " +
                  (i === speedIdx
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200")
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </section>
  );
}

function roleStyle(role: ReplayStep["role"]) {
  switch (role) {
    case "user":
      return {
        Icon: User,
        badge:
          "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
        accent: "border-l-violet-300 dark:border-l-violet-700",
      };
    case "assistant":
      return {
        Icon: Bot,
        badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
        accent: "border-l-sky-300 dark:border-l-sky-700",
      };
    case "tool_use":
      return {
        Icon: Wrench,
        badge:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
        accent: "border-l-amber-300 dark:border-l-amber-700",
      };
    case "tool_result":
      return {
        Icon: CheckCircle2,
        badge:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        accent: "border-l-emerald-300 dark:border-l-emerald-700",
      };
    case "thinking":
      return {
        Icon: Lightbulb,
        badge:
          "bg-zinc-100 italic text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
        accent: "border-l-zinc-300 dark:border-l-zinc-700",
      };
    case "note":
      return {
        Icon: StickyNote,
        badge: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
        accent: "border-l-zinc-200 dark:border-l-zinc-800",
      };
    case "stop":
      return {
        Icon: Square,
        badge:
          "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
        accent: "border-l-zinc-400 dark:border-l-zinc-600",
      };
    default:
      return {
        Icon: StickyNote,
        badge: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
        accent: "border-l-zinc-200 dark:border-l-zinc-800",
      };
  }
}

function roleLabel(role: ReplayStep["role"], labels: ReplayLabels) {
  switch (role) {
    case "user":
      return labels.roleUser;
    case "assistant":
      return labels.roleAssistant;
    case "tool_use":
      return labels.roleToolUse;
    case "tool_result":
      return labels.roleToolResult;
    case "thinking":
      return labels.roleThinking;
    case "note":
      return labels.roleNote;
    case "stop":
      return labels.roleStop;
    default:
      return role;
  }
}

function StepRow({
  step,
  labels,
  active,
}: {
  step: ReplayStep;
  labels: ReplayLabels;
  active: boolean;
}) {
  const { Icon, badge, accent } = roleStyle(step.role);
  return (
    <div className={"border-l-2 pl-3 " + accent}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span
          className={
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
            badge
          }
        >
          <Icon size={11} />
          {roleLabel(step.role, labels)}
        </span>
        {step.agent && (
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {step.agent}
          </span>
        )}
        {step.tool && (
          <span className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-[10px] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            {step.tool}
          </span>
        )}
        {step.t && (
          <span className="ml-auto font-mono text-[10px] text-zinc-400">
            {step.t}
          </span>
        )}
        {active && (
          <span className="ml-auto inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
        )}
      </div>
      <StepBody step={step} />
    </div>
  );
}

function StepBody({ step }: { step: ReplayStep }) {
  if (step.role === "tool_use") {
    return (
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-zinc-50 px-3 py-1.5 font-mono text-[12px] leading-relaxed text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
        {step.args ?? ""}
      </pre>
    );
  }
  if (step.role === "tool_result") {
    return (
      <div className="text-[13px] leading-relaxed text-emerald-900 dark:text-emerald-100">
        {step.result ?? ""}
      </div>
    );
  }
  if (step.role === "stop") {
    return (
      <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
        stop_reason = {step.reason ?? "end_turn"}
      </div>
    );
  }
  return (
    <div className="text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-200">
      {step.text ?? ""}
    </div>
  );
}
