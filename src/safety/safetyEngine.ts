// ============================================
// ANDAS - SAFETY ENGINE
// ============================================
// Core safety logic. Must be consulted before any exercise.

import {
  Exercise,
  UserState,
  BreathPattern,
  SafetyCheckResult,
  IntegrationConfig,
} from '../data/types';
import { exercises, integrationTexts } from '../data/exercises';

/**
 * Check if an exercise is safe for this user
 */
export function checkExerciseSafety(
  exercise: Exercise,
  userState: UserState
): SafetyCheckResult {
  const { contraindications, capacities, baseline, sensitivity, adaptiveFlags } = userState;
  const { safety } = exercise;

  // Check hard contraindications first
  if (safety.contraindicated.breathHolds && contraindications.breathHolds) {
    return {
      allowed: false,
      reason: 'breathHolds',
      alternativeId: safety.traumaSafeAlternativeId,
      adaptedPattern: null,
    };
  }

  if (safety.contraindicated.fastBreathing && contraindications.fastBreathing) {
    return {
      allowed: false,
      reason: 'fastBreathing',
      alternativeId: safety.traumaSafeAlternativeId,
      adaptedPattern: null,
    };
  }

  // Check if adaptive flags block this
  if (adaptiveFlags.avoidFastBreathing && safety.requiresFastBreathingTolerance) {
    return {
      allowed: false,
      reason: 'adaptiveBlock',
      alternativeId: safety.traumaSafeAlternativeId,
      adaptedPattern: null,
    };
  }

  // Check capacity requirements
  const minCap = safety.minimumCapacity;
  if (minCap.calmBreathing && capacities.calmBreathing < minCap.calmBreathing) {
    return {
      allowed: false,
      reason: 'insufficientCapacity',
      alternativeId: safety.traumaSafeAlternativeId,
      adaptedPattern: null,
    };
  }
  if (minCap.focusStability && capacities.focusStability < minCap.focusStability) {
    return {
      allowed: false,
      reason: 'insufficientCapacity',
      alternativeId: safety.traumaSafeAlternativeId,
      adaptedPattern: null,
    };
  }
  if (minCap.energyRegulation && capacities.energyRegulation < minCap.energyRegulation) {
    return {
      allowed: false,
      reason: 'insufficientCapacity',
      alternativeId: safety.traumaSafeAlternativeId,
      adaptedPattern: null,
    };
  }

  // Check hold tolerance - adapt instead of block
  if (minCap.holdTolerance && capacities.holdTolerance < minCap.holdTolerance) {
    const adaptedPattern = adaptPatternForLowHoldTolerance(
      exercise.pattern,
      capacities.holdTolerance
    );
    return {
      allowed: true,
      reason: 'adaptedPattern',
      alternativeId: null,
      adaptedPattern,
    };
  }

  // Check intensity vs baseline
  if (baseline === 'overstimulated' && safety.maxIntensity > 2) {
    return {
      allowed: false,
      reason: 'tooIntenseForBaseline',
      alternativeId: safety.traumaSafeAlternativeId || 'coherent',
      adaptedPattern: null,
    };
  }

  if (baseline === 'stressed' && safety.maxIntensity > 3) {
    return {
      allowed: false,
      reason: 'tooIntenseForBaseline',
      alternativeId: safety.traumaSafeAlternativeId,
      adaptedPattern: null,
    };
  }

  // Check sensitivity-based adaptations
  if (sensitivity === 'high') {
    const adaptedPattern = adaptPatternForHighSensitivity(exercise.pattern);
    return {
      allowed: true,
      reason: 'adaptedForSensitivity',
      alternativeId: null,
      adaptedPattern,
    };
  }

  // If intensity should be reduced (adaptive flag)
  if (adaptiveFlags.reduceIntensity && safety.maxIntensity > 2) {
    const adaptedPattern = reducePatternIntensity(exercise.pattern);
    return {
      allowed: true,
      reason: 'adaptedForRecovery',
      alternativeId: null,
      adaptedPattern,
    };
  }

  // Exercise is safe as-is
  return {
    allowed: true,
    reason: null,
    alternativeId: null,
    adaptedPattern: null,
  };
}

/**
 * Adapt pattern for users with low hold tolerance
 */
function adaptPatternForLowHoldTolerance(
  pattern: BreathPattern,
  holdTolerance: number
): BreathPattern {
  const holdMultiplier = holdTolerance / 5;
  return {
    inhale: pattern.inhale,
    holdIn: Math.max(0, Math.round(pattern.holdIn * holdMultiplier)),
    exhale: pattern.exhale,
    holdOut: Math.max(0, Math.round(pattern.holdOut * holdMultiplier)),
  };
}

/**
 * Adapt pattern for high sensitivity users
 */
function adaptPatternForHighSensitivity(pattern: BreathPattern): BreathPattern {
  return {
    inhale: Math.min(pattern.inhale, 4),
    holdIn: Math.min(pattern.holdIn, 2),
    exhale: Math.min(pattern.exhale, 6),
    holdOut: Math.min(pattern.holdOut, 1),
  };
}

/**
 * Reduce pattern intensity for recovery
 */
function reducePatternIntensity(pattern: BreathPattern): BreathPattern {
  return {
    inhale: pattern.inhale,
    holdIn: Math.floor(pattern.holdIn * 0.7),
    exhale: pattern.exhale,
    holdOut: Math.floor(pattern.holdOut * 0.7),
  };
}

/**
 * Get safe exercises for a category
 */
export function getSafeExercisesForCategory(
  category: Exercise['category'],
  userState: UserState
): Array<{ exercise: Exercise; safetyResult: SafetyCheckResult }> {
  return exercises
    .filter((e) => e.category === category)
    .map((exercise) => ({
      exercise,
      safetyResult: checkExerciseSafety(exercise, userState),
    }))
    .sort((a, b) => {
      // Allowed first, then by intensity
      if (a.safetyResult.allowed !== b.safetyResult.allowed) {
        return a.safetyResult.allowed ? -1 : 1;
      }
      return a.exercise.safety.maxIntensity - b.exercise.safety.maxIntensity;
    });
}

/**
 * Get recommended exercise based on user state
 */
export function getRecommendedExercise(userState: UserState): Exercise {
  const { baseline, adaptiveFlags } = userState;

  // If overstimulated or needs grounding, always recommend trauma-safe
  if (baseline === 'overstimulated' || adaptiveFlags.suggestGrounding) {
    return exercises.find((e) => e.id === 'trauma-safe') || exercises[0];
  }

  // Get safe exercises from LUGN category
  const safeExercises = getSafeExercisesForCategory('lugn', userState)
    .filter((e) => e.safetyResult.allowed);

  // Return first safe exercise or fallback
  return safeExercises[0]?.exercise || exercises.find((e) => e.id === 'coherent')!;
}

/**
 * Calculate recommended session duration
 */
export function getRecommendedDuration(
  exercise: Exercise,
  userState: UserState
): { minutes: number; rounds: number | null } {
  const { capacities, baseline, sensitivity } = userState;
  const baseMinutes = exercise.defaultMinutes || 3;
  const baseRounds = exercise.defaultRounds;

  let multiplier = 1;
  if (baseline === 'overstimulated') multiplier = 0.6;
  else if (baseline === 'stressed') multiplier = 0.8;
  if (sensitivity === 'high') multiplier *= 0.8;

  // Increase based on capacities
  const capacityBonus = (capacities.calmBreathing + capacities.focusStability) / 10;
  multiplier *= 1 + capacityBonus * 0.5;

  if (baseRounds) {
    return {
      minutes: 0,
      rounds: Math.max(2, Math.round(baseRounds * multiplier)),
    };
  }

  return {
    minutes: Math.max(2, Math.round(baseMinutes * multiplier)),
    rounds: null,
  };
}

/**
 * Get integration config based on session
 */
export function getIntegrationConfig(
  userState: UserState,
  exerciseIntensity: number
): IntegrationConfig {
  const { adaptiveFlags, baseline } = userState;

  let duration = 30;
  if (exerciseIntensity >= 3) duration = 45;
  if (adaptiveFlags.extendIntegration) duration = 60;
  if (baseline === 'overstimulated') duration = 60;

  // Select random texts
  const shuffled = [...integrationTexts].sort(() => Math.random() - 0.5);

  return {
    durationSeconds: duration,
    texts: shuffled.slice(0, 3),
    showMicroAction: !adaptiveFlags.suggestGrounding,
  };
}
