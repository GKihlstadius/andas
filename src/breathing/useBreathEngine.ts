// ============================================
// ANDAS - BREATHING ENGINE
// ============================================
// Core breathing session logic

import { useState, useEffect, useRef, useCallback } from 'react';
import { BreathPattern, BreathPhase, SessionState } from '../data/types';

interface BreathPhaseConfig {
  name: BreathPhase;
  duration: number;
}

interface UseBreathEngineConfig {
  pattern: BreathPattern;
  durationSeconds: number;
}

interface UseBreathEngineCallbacks {
  onPhaseChange?: (phase: BreathPhase) => void;
  onCycleComplete?: (count: number) => void;
  onSessionComplete?: (cycles: number) => void;
}

interface UseBreathEngineReturn {
  state: SessionState;
  start: () => void;
  stop: () => void;
  formatTimeRemaining: () => string;
}

export function useBreathEngine(
  config: UseBreathEngineConfig,
  callbacks: UseBreathEngineCallbacks = {}
): UseBreathEngineReturn {
  const { pattern, durationSeconds } = config;
  const { onPhaseChange, onCycleComplete, onSessionComplete } = callbacks;

  // Build phase sequence
  const phases = useRef<BreathPhaseConfig[]>([
    pattern.inhale > 0 && { name: 'inhale' as const, duration: pattern.inhale },
    pattern.holdIn > 0 && { name: 'holdIn' as const, duration: pattern.holdIn },
    pattern.exhale > 0 && { name: 'exhale' as const, duration: pattern.exhale },
    pattern.holdOut > 0 && { name: 'holdOut' as const, duration: pattern.holdOut },
  ].filter(Boolean) as BreathPhaseConfig[]);

  const [state, setState] = useState<SessionState>({
    phase: 'ready',
    phaseTimeRemaining: 3,
    totalElapsed: 0,
    cyclesCompleted: 0,
    progress: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIndexRef = useRef(0);

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'countdown', phaseTimeRemaining: 3 }));
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState((prev) => ({ ...prev, phase: 'complete' }));
  }, []);

  // Countdown effect
  useEffect(() => {
    if (state.phase !== 'countdown') return;

    const countdown = setInterval(() => {
      setState((prev) => {
        if (prev.phaseTimeRemaining <= 1) {
          clearInterval(countdown);
          const firstPhase = phases.current[0];
          onPhaseChange?.(firstPhase.name);
          return {
            ...prev,
            phase: firstPhase.name,
            phaseTimeRemaining: firstPhase.duration,
          };
        }
        return { ...prev, phaseTimeRemaining: prev.phaseTimeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [state.phase, onPhaseChange]);

  // Main breathing loop
  useEffect(() => {
    if (!['inhale', 'holdIn', 'exhale', 'holdOut'].includes(state.phase)) return;

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const newPhaseTime = prev.phaseTimeRemaining - 0.1;
        const newTotalElapsed = prev.totalElapsed + 0.1;
        const currentPhase = phases.current[phaseIndexRef.current];
        const newProgress = 1 - newPhaseTime / currentPhase.duration;

        // Phase transition
        if (newPhaseTime <= 0) {
          phaseIndexRef.current = (phaseIndexRef.current + 1) % phases.current.length;
          const nextPhase = phases.current[phaseIndexRef.current];
          const newCycles =
            phaseIndexRef.current === 0 ? prev.cyclesCompleted + 1 : prev.cyclesCompleted;

          if (phaseIndexRef.current === 0) {
            onCycleComplete?.(newCycles);
          }
          onPhaseChange?.(nextPhase.name);

          return {
            ...prev,
            phase: nextPhase.name,
            phaseTimeRemaining: nextPhase.duration,
            progress: 0,
            totalElapsed: newTotalElapsed,
            cyclesCompleted: newCycles,
          };
        }

        // Session complete
        if (newTotalElapsed >= durationSeconds) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setTimeout(() => onSessionComplete?.(prev.cyclesCompleted + 1), 500);
          return { ...prev, phase: 'complete', totalElapsed: durationSeconds };
        }

        return {
          ...prev,
          phaseTimeRemaining: newPhaseTime,
          progress: newProgress,
          totalElapsed: newTotalElapsed,
        };
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.phase, durationSeconds, onPhaseChange, onCycleComplete, onSessionComplete]);

  const formatTimeRemaining = useCallback(() => {
    const remaining = Math.max(0, durationSeconds - state.totalElapsed);
    const m = Math.floor(remaining / 60);
    const s = Math.floor(remaining % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [durationSeconds, state.totalElapsed]);

  return { state, start, stop, formatTimeRemaining };
}
