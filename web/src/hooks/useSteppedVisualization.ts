"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface SteppedVisualizationOptions {
  totalSteps: number;
  autoPlayInterval?: number; // ms, default 2000
  /** Start playing as soon as the component mounts. Default: true. */
  autoStart?: boolean;
  /** When the last step finishes, wrap back to step 0 instead of stopping. Default: true. */
  loop?: boolean;
  /** When user manually navigates with prev/next/reset, stop auto-play. Default: true. */
  pauseOnManual?: boolean;
}

interface SteppedVisualizationReturn {
  currentStep: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  reset: () => void;
  goToStep: (step: number) => void;
  isPlaying: boolean;
  toggleAutoPlay: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function useSteppedVisualization({
  totalSteps,
  autoPlayInterval = 2000,
  autoStart = true,
  loop = true,
  pauseOnManual = true,
}: SteppedVisualizationOptions): SteppedVisualizationReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    if (pauseOnManual) setIsPlaying(false);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps, pauseOnManual]);

  const prev = useCallback(() => {
    if (pauseOnManual) setIsPlaying(false);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, [pauseOnManual]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (pauseOnManual) setIsPlaying(false);
      setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
    },
    [totalSteps, pauseOnManual]
  );

  const toggleAutoPlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            if (loop) return 0;
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, autoPlayInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, totalSteps, autoPlayInterval, loop]);

  return {
    currentStep,
    totalSteps,
    next,
    prev,
    reset,
    goToStep,
    isPlaying,
    toggleAutoPlay,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
  };
}
