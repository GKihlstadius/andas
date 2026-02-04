// ============================================
// ANDAS - USER STATE MANAGEMENT
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserState,
  SessionFeedback,
  Capacities,
  AdaptiveFlags,
  SessionRecord,
} from '../data/types';
import { onboardingQuestions, getExerciseById } from '../data/exercises';
import { safeLoad, safeSave, clearStorage } from './persistentStorage';

/**
 * Default user state
 */
export const DEFAULT_USER_STATE: UserState = {
  id: '',
  onboardingCompleted: false,
  baseline: 'neutral',
  sensitivity: 'medium',
  contraindications: {
    breathHolds: false,
    fastBreathing: false,
  },
  capacities: {
    calmBreathing: 2,
    focusStability: 2,
    energyRegulation: 2,
    holdTolerance: 2,
  },
  adaptiveFlags: {
    avoidFastBreathing: false,
    reduceIntensity: false,
    suggestGrounding: false,
    extendIntegration: false,
  },
  currentDayInProgram: 1,
  lastSessionDate: null,
  sessionHistory: [],
};

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Context type
 */
interface UserStateContextType {
  userState: UserState;
  isLoading: boolean;
  completeOnboarding: (answers: Record<string, string>) => Promise<void>;
  recordSession: (
    exerciseId: string,
    durationMinutes: number,
    cycles: number,
    feedback: SessionFeedback | null,
    wasEarlyExit: boolean
  ) => Promise<void>;
  resetUserState: () => Promise<void>;
}

const UserStateContext = createContext<UserStateContextType | null>(null);

/**
 * Provider component
 */
export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [userState, setUserState] = useState<UserState>(DEFAULT_USER_STATE);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from storage
  useEffect(() => {
    loadUserState();
  }, []);

  const loadUserState = async () => {
    const result = await safeLoad<UserState>({ ...DEFAULT_USER_STATE, id: generateId() });
    
    if (result.data) {
      setUserState(result.data);
      
      // Log for debugging (remove in production)
      if (result.usedFallback) {
        console.log('UserState: Recovered from backup');
      }
      if (result.error) {
        console.warn('UserState: Storage error, using default:', result.error.message);
      }
    } else {
      // Critical error - use default
      setUserState({ ...DEFAULT_USER_STATE, id: generateId() });
    }
    
    setIsLoading(false);
  };

  const saveUserState = async (state: UserState) => {
    const result = await safeSave(state);
    
    if (!result.success && result.error) {
      console.error('Failed to save user state:', result.error.message);
      // Non-critical: app continues to work, data just won't persist
    }
  };

  const completeOnboarding = useCallback(async (answers: Record<string, string>) => {
    let newState = { ...userState };

    // Process each answer
    Object.entries(answers).forEach(([questionId, answerId]) => {
      const question = onboardingQuestions.find((q) => q.id === questionId);
      if (!question) return;

      const option = question.options.find((o) => o.id === answerId);
      if (!option) return;

      // Apply effects
      if (option.effects.baseline) {
        newState.baseline = option.effects.baseline;
      }
      if (option.effects.sensitivity) {
        newState.sensitivity = option.effects.sensitivity;
      }
      if (option.effects.contraindications) {
        newState.contraindications = {
          ...newState.contraindications,
          ...option.effects.contraindications,
        };
      }
      if (option.effects.capacities) {
        newState.capacities = {
          ...newState.capacities,
          ...option.effects.capacities,
        };
      }
    });

    newState.onboardingCompleted = true;
    setUserState(newState);
    await saveUserState(newState);
  }, [userState]);

  const recordSession = useCallback(
    async (
      exerciseId: string,
      durationMinutes: number,
      cycles: number,
      feedback: SessionFeedback | null,
      wasEarlyExit: boolean
    ) => {
      const exercise = getExerciseById(exerciseId);
      if (!exercise) return;

      const record: SessionRecord = {
        id: generateId(),
        exerciseId,
        timestamp: new Date().toISOString(),
        durationMinutes,
        completedCycles: cycles,
        feedback,
        wasEarlyExit,
      };

      // Update capacities based on feedback
      let newCapacities = { ...userState.capacities };
      let newFlags = { ...userState.adaptiveFlags };

      if (!wasEarlyExit && feedback) {
        if (feedback === 'calmer') {
          // Positive - increase capacities
          newCapacities.calmBreathing = Math.min(5, newCapacities.calmBreathing + 0.2);
          newFlags.reduceIntensity = false;
          newFlags.suggestGrounding = false;
        } else if (feedback === 'moreActivated') {
          // Negative - set protective flags
          newFlags.reduceIntensity = true;
          newFlags.suggestGrounding = true;
          newFlags.extendIntegration = true;
          if (exercise.safety.requiresFastBreathingTolerance) {
            newFlags.avoidFastBreathing = true;
          }
        }
      }

      const newState: UserState = {
        ...userState,
        capacities: newCapacities,
        adaptiveFlags: newFlags,
        lastSessionDate: record.timestamp,
        sessionHistory: [record, ...userState.sessionHistory].slice(0, 100),
      };

      setUserState(newState);
      await saveUserState(newState);
    },
    [userState]
  );

  const resetUserState = useCallback(async () => {
    const newState = { ...DEFAULT_USER_STATE, id: generateId() };
    setUserState(newState);
    await clearStorage();
  }, []);

  return (
    <UserStateContext.Provider
      value={{
        userState,
        isLoading,
        completeOnboarding,
        recordSession,
        resetUserState,
      }}
    >
      {children}
    </UserStateContext.Provider>
  );
}

/**
 * Hook to access user state
 */
export function useUserState(): UserStateContextType {
  const context = useContext(UserStateContext);
  if (!context) {
    throw new Error('useUserState must be used within UserStateProvider');
  }
  return context;
}
