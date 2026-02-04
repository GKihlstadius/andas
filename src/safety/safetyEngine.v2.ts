// ============================================
// ANDAS - SAFETY ENGINE v2.0
// ============================================
// Enhanced safety logic with better separation of concerns
// and more sophisticated adaptation strategies

import {
  Exercise,
  UserState,
  BreathPattern,
  SafetyCheckResult,
  IntegrationConfig,
  NervousSystemBaseline,
  Sensitivity,
  SessionRecord,
} from '../data/types';
import { exercises, integrationTexts } from '../data/exercises';

// ============================================
// SAFETY DECISION TYPES
// ============================================

export type SafetyDecision = 
  | { type: 'allow'; pattern: BreathPattern }
  | { type: 'block'; reason: BlockReason; alternativeId: string | null }
  | { type: 'adapt'; adaptation: AdaptationType; pattern: BreathPattern };

export type BlockReason =
  | 'breathHolds'
  | 'fastBreathing'
  | 'adaptiveBlock'
  | 'insufficientCapacity'
  | 'tooIntenseForBaseline'
  | 'recentNegativeExperience';

export type AdaptationType =
  | 'reducedHoldTolerance'
  | 'highSensitivity'
  | 'recoveryMode'
  | 'baselineAdjusted';

// ============================================
// SESSION CONTEXT FOR ADAPTIVE DECISIONS
// ============================================

export interface SessionContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  daysSinceLastSession: number | null;
  recentFeedback: 'calmer' | 'same' | 'moreActivated' | null;
  consecutiveNegativeExperiences: number;
  streakDays: number;
}

// ============================================
// CAPACITY PROGRESSION LOGIC
// ============================================

interface CapacityProgression {
  current: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  sessionsToNextLevel: number;
}

export function calculateCapacityProgression(
  capacityName: keyof UserState['capacities'],
  userState: UserState
): CapacityProgression {
  const current = userState.capacities[capacityName];
  const relevantSessions = userState.sessionHistory
    .filter(s => s.exerciseId === getExerciseForCapacity(capacityName))
    .slice(0, 10);

  // Calculate trend from recent sessions
  const trend = calculateTrend(relevantSessions);
  
  // Estimate sessions to next level based on positive feedback rate
  const positiveRate = calculatePositiveFeedbackRate(relevantSessions);
  const sessionsToNext = positiveRate > 0 
    ? Math.ceil((5 - current) / (positiveRate * 0.2))
    : Infinity;

  return {
    current,
    target: Math.min(5, current + 1),
    trend,
    sessionsToNextLevel: sessionsToNext,
  };
}

function getExerciseForCapacity(capacity: keyof UserState['capacities']): string {
  const mapping: Record<string, string> = {
    calmBreathing: 'coherent',
    focusStability: 'box',
    energyRegulation: 'physiological-sigh',
    holdTolerance: '478',
  };
  return mapping[capacity] || 'coherent';
}

function calculateTrend(sessions: SessionRecord[]): 'improving' | 'stable' | 'declining' {
  if (sessions.length < 3) return 'stable';
  
  const recent = sessions.slice(0, 3);
  const positiveCount = recent.filter(s => s.feedback === 'calmer').length;
  const negativeCount = recent.filter(s => s.feedback === 'moreActivated').length;
  
  if (positiveCount >= 2) return 'improving';
  if (negativeCount >= 2) return 'declining';
  return 'stable';
}

function calculatePositiveFeedbackRate(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0.5;
  const positive = sessions.filter(s => s.feedback === 'calmer').length;
  return positive / sessions.length;
}

// ============================================
// ENHANCED SAFETY CHECK
// ============================================

export function checkExerciseSafetyV2(
  exercise: Exercise,
  userState: UserState,
  context?: SessionContext
): SafetyDecision {
  const { contraindications, capacities, baseline, sensitivity, adaptiveFlags } = userState;
  const { safety } = exercise;

  // 1. HARD CONTRAINDICATIONS (never override)
  if (safety.contraindicated.breathHolds && contraindications.breathHolds) {
    return {
      type: 'block',
      reason: 'breathHolds',
      alternativeId: safety.traumaSafeAlternativeId,
    };
  }

  if (safety.contraindicated.fastBreathing && contraindications.fastBreathing) {
    return {
      type: 'block',
      reason: 'fastBreathing',
      alternativeId: safety.traumaSafeAlternativeId,
    };
  }

  // 2. ADAPTIVE FLAGS (learned from user history)
  if (adaptiveFlags.avoidFastBreathing && safety.requiresFastBreathingTolerance) {
    return {
      type: 'block',
      reason: 'adaptiveBlock',
      alternativeId: safety.traumaSafeAlternativeId,
    };
  }

  // 3. RECENT NEGATIVE EXPERIENCES (context-aware)
  if (context && context.consecutiveNegativeExperiences >= 2) {
    if (safety.maxIntensity > 2) {
      return {
        type: 'block',
        reason: 'recentNegativeExperience',
        alternativeId: 'trauma-safe',
      };
    }
  }

  // 4. CAPACITY-BASED ADAPTATIONS
  const minCap = safety.minimumCapacity;
  
  // Check if we should adapt rather than block
  if (minCap.holdTolerance && capacities.holdTolerance < minCap.holdTolerance) {
    const adaptedPattern = adaptPatternForLowHoldTolerance(
      exercise.pattern,
      capacities.holdTolerance
    );
    return {
      type: 'adapt',
      adaptation: 'reducedHoldTolerance',
      pattern: adaptedPattern,
    };
  }

  // Block if other capacities insufficient
  if (minCap.calmBreathing && capacities.calmBreathing < minCap.calmBreathing) {
    return {
      type: 'block',
      reason: 'insufficientCapacity',
      alternativeId: safety.traumaSafeAlternativeId,
    };
  }

  // 5. BASELINE-BASED DECISIONS
  if (baseline === 'overstimulated' && safety.maxIntensity > 2) {
    return {
      type: 'block',
      reason: 'tooIntenseForBaseline',
      alternativeId: safety.traumaSafeAlternativeId || 'coherent',
    };
  }

  if (baseline === 'stressed' && safety.maxIntensity > 3) {
    return {
      type: 'block',
      reason: 'tooIntenseForBaseline',
      alternativeId: safety.traumaSafeAlternativeId,
    };
  }

  // 6. SENSITIVITY ADAPTATIONS
  if (sensitivity === 'high') {
    const adaptedPattern = adaptPatternForHighSensitivity(exercise.pattern);
    return {
      type: 'adapt',
      adaptation: 'highSensitivity',
      pattern: adaptedPattern,
    };
  }

  // 7. RECOVERY MODE
  if (adaptiveFlags.reduceIntensity && safety.maxIntensity > 2) {
    const adaptedPattern = reducePatternIntensity(exercise.pattern);
    return {
      type: 'adapt',
      adaptation: 'recoveryMode',
      pattern: adaptedPattern,
    };
  }

  // 8. ALLOW AS-IS
  return {
    type: 'allow',
    pattern: exercise.pattern,
  };
}

// ============================================
// PATTERN ADAPTATION FUNCTIONS
// ============================================

function adaptPatternForLowHoldTolerance(
  pattern: BreathPattern,
  holdTolerance: number
): BreathPattern {
  const holdMultiplier = Math.max(0.3, holdTolerance / 5);
  return {
    inhale: pattern.inhale,
    holdIn: Math.max(0, Math.round(pattern.holdIn * holdMultiplier)),
    exhale: pattern.exhale,
    holdOut: Math.max(0, Math.round(pattern.holdOut * holdMultiplier)),
  };
}

function adaptPatternForHighSensitivity(pattern: BreathPattern): BreathPattern {
  return {
    inhale: Math.min(pattern.inhale, 4),
    holdIn: Math.min(pattern.holdIn, 2),
    exhale: Math.min(pattern.exhale, 6),
    holdOut: Math.min(pattern.holdOut, 1),
  };
}

function reducePatternIntensity(pattern: BreathPattern): BreathPattern {
  return {
    inhale: pattern.inhale,
    holdIn: Math.floor(pattern.holdIn * 0.6),
    exhale: pattern.exhale,
    holdOut: Math.floor(pattern.holdOut * 0.6),
  };
}

// ============================================
// RECOMMENDATION ENGINE
// ============================================

export interface RecommendationResult {
  exercise: Exercise;
  decision: SafetyDecision;
  reasoning: string;
  alternatives: Exercise[];
}

export function getRecommendedExerciseV2(
  userState: UserState,
  context?: SessionContext
): RecommendationResult {
  const { baseline, adaptiveFlags, capacities } = userState;

  // Priority 1: Crisis mode
  if (baseline === 'overstimulated' || adaptiveFlags.suggestGrounding) {
    const traumaSafe = exercises.find(e => e.id === 'trauma-safe')!;
    return {
      exercise: traumaSafe,
      decision: { type: 'allow', pattern: traumaSafe.pattern },
      reasoning: 'Nervous system needs grounding - trauma-safe exercise prioritized',
      alternatives: getSafeAlternatives('lugn', userState, 2),
    };
  }

  // Priority 2: Recovery mode
  if (adaptiveFlags.reduceIntensity) {
    const safeExercises = getSafeExercisesForCategoryV2('lugn', userState, context)
      .filter(r => r.decision.type !== 'block')
      .filter(r => r.exercise.safety.maxIntensity <= 2);
    
    if (safeExercises.length > 0) {
      const selected = safeExercises[0];
      return {
        exercise: selected.exercise,
        decision: selected.decision,
        reasoning: 'Recovery mode - low intensity exercise selected',
        alternatives: safeExercises.slice(1, 3).map(r => r.exercise),
      };
    }
  }

  // Priority 3: Progressive challenge
  const safeExercises = getSafeExercisesForCategoryV2('lugn', userState, context)
    .filter(r => r.decision.type !== 'block');

  if (safeExercises.length > 0) {
    // Select based on capacity progression
    const targetCapacity = getTargetCapacity(userState);
    const selected = safeExercises.find(r => 
      r.exercise.safety.minimumCapacity[targetCapacity]
    ) || safeExercises[0];

    return {
      exercise: selected.exercise,
      decision: selected.decision,
      reasoning: `Progressive challenge targeting ${targetCapacity}`,
      alternatives: safeExercises.slice(1, 3).map(r => r.exercise),
    };
  }

  // Fallback
  const coherent = exercises.find(e => e.id === 'coherent')!;
  return {
    exercise: coherent,
    decision: { type: 'allow', pattern: coherent.pattern },
    reasoning: 'Fallback to safe default',
    alternatives: [],
  };
}

function getTargetCapacity(userState: UserState): keyof UserState['capacities'] {
  const capacities = userState.capacities;
  const lowest = (Object.entries(capacities) as [keyof typeof capacities, number][])
    .sort((a, b) => a[1] - b[1])[0];
  return lowest[0];
}

function getSafeAlternatives(
  category: Exercise['category'],
  userState: UserState,
  count: number
): Exercise[] {
  return exercises
    .filter(e => e.category === category)
    .filter(e => e.safety.maxIntensity <= 2)
    .slice(0, count);
}

// ============================================
// EXERCISE LISTING WITH SAFETY
// ============================================

export interface SafeExerciseResult {
  exercise: Exercise;
  decision: SafetyDecision;
  displayStatus: 'available' | 'adapted' | 'blocked';
}

export function getSafeExercisesForCategoryV2(
  category: Exercise['category'],
  userState: UserState,
  context?: SessionContext
): SafeExerciseResult[] {
  return exercises
    .filter(e => e.category === category)
    .map(exercise => {
      const decision = checkExerciseSafetyV2(exercise, userState, context);
      const displayStatus = getDisplayStatus(decision);
      return { exercise, decision, displayStatus };
    })
    .sort((a, b) => {
      // Sort: available first, then adapted, then blocked
      const statusOrder = { available: 0, adapted: 1, blocked: 2 };
      if (statusOrder[a.displayStatus] !== statusOrder[b.displayStatus]) {
        return statusOrder[a.displayStatus] - statusOrder[b.displayStatus];
      }
      return a.exercise.safety.maxIntensity - b.exercise.safety.maxIntensity;
    });
}

function getDisplayStatus(decision: SafetyDecision): 'available' | 'adapted' | 'blocked' {
  switch (decision.type) {
    case 'allow': return 'available';
    case 'adapt': return 'adapted';
    case 'block': return 'blocked';
  }
}

// ============================================
// DURATION RECOMMENDATIONS
// ============================================

export interface DurationRecommendation {
  minutes: number;
  rounds: number | null;
  reasoning: string;
}

export function getRecommendedDurationV2(
  exercise: Exercise,
  userState: UserState,
  context?: SessionContext
): DurationRecommendation {
  const { capacities, baseline, sensitivity } = userState;
  const baseMinutes = exercise.defaultMinutes || 3;
  const baseRounds = exercise.defaultRounds;

  let multiplier = 1;
  const factors: string[] = [];

  // Baseline adjustments
  if (baseline === 'overstimulated') {
    multiplier *= 0.6;
    factors.push('overstimulated baseline');
  } else if (baseline === 'stressed') {
    multiplier *= 0.8;
    factors.push('stressed baseline');
  }

  // Sensitivity adjustments
  if (sensitivity === 'high') {
    multiplier *= 0.8;
    factors.push('high sensitivity');
  }

  // Capacity bonus (gradual progression)
  const avgCapacity = (capacities.calmBreathing + capacities.focusStability) / 2;
  if (avgCapacity > 3) {
    multiplier *= 1.2;
    factors.push('higher capacity');
  }

  // Time of day adjustments
  if (context?.timeOfDay === 'night') {
    multiplier *= 0.8;
    factors.push('nighttime');
  }

  // Streak bonus (gentle encouragement)
  if (context && context.streakDays > 7) {
    multiplier *= 1.1;
    factors.push('practice streak');
  }

  if (baseRounds) {
    return {
      minutes: 0,
      rounds: Math.max(2, Math.round(baseRounds * multiplier)),
      reasoning: factors.join(', ') || 'default',
    };
  }

  return {
    minutes: Math.max(2, Math.round(baseMinutes * multiplier)),
    rounds: null,
    reasoning: factors.join(', ') || 'default',
  };
}

// ============================================
// INTEGRATION CONFIGURATION
// ============================================

export function getIntegrationConfigV2(
  userState: UserState,
  exerciseIntensity: number,
  sessionContext?: SessionContext
): IntegrationConfig {
  const { adaptiveFlags, baseline, sessionHistory } = userState;

  // Base duration
  let duration = 30;

  // Intensity-based
  if (exerciseIntensity >= 3) duration = 45;
  if (exerciseIntensity >= 4) duration = 60;

  // Adaptive flags
  if (adaptiveFlags.extendIntegration) duration = Math.max(duration, 60);

  // Baseline-based
  if (baseline === 'overstimulated') duration = 60;

  // First-time user
  if (sessionHistory.length < 3) duration = 45;

  // Select contextually appropriate texts
  const texts = selectIntegrationTexts(userState, sessionContext);

  return {
    durationSeconds: duration,
    texts,
    showMicroAction: !adaptiveFlags.suggestGrounding && baseline !== 'overstimulated',
  };
}

function selectIntegrationTexts(
  userState: UserState,
  context?: SessionContext
): string[] {
  const shuffled = [...integrationTexts].sort(() => Math.random() - 0.5);
  
  // For overstimulated users, prioritize grounding texts
  if (userState.baseline === 'overstimulated') {
    return [
      'Känn fötterna mot golvet.',
      'Du är här. Just nu.',
      'Låt kroppen landa.',
    ];
  }

  return shuffled.slice(0, 3);
}

// ============================================
// BACKWARD COMPATIBILITY
// ============================================

export function checkExerciseSafety(
  exercise: Exercise,
  userState: UserState
): SafetyCheckResult {
  const decision = checkExerciseSafetyV2(exercise, userState);
  
  switch (decision.type) {
    case 'allow':
    case 'adapt':
      return {
        allowed: true,
        reason: decision.type === 'adapt' ? getAdaptationReason(decision.adaptation) : null,
        alternativeId: null,
        adaptedPattern: decision.type === 'adapt' ? decision.pattern : null,
      };
    case 'block':
      return {
        allowed: false,
        reason: decision.reason,
        alternativeId: decision.alternativeId,
        adaptedPattern: null,
      };
  }
}

function getAdaptationReason(adaptation: AdaptationType): string {
  const reasons: Record<AdaptationType, string> = {
    reducedHoldTolerance: 'adaptedPattern',
    highSensitivity: 'adaptedForSensitivity',
    recoveryMode: 'adaptedForRecovery',
    baselineAdjusted: 'adaptedPattern',
  };
  return reasons[adaptation];
}

export function getRecommendedExercise(userState: UserState): Exercise {
  const result = getRecommendedExerciseV2(userState);
  return result.exercise;
}

export function getSafeExercisesForCategory(
  category: Exercise['category'],
  userState: UserState
): Array<{ exercise: Exercise; safetyResult: SafetyCheckResult }> {
  const results = getSafeExercisesForCategoryV2(category, userState);
  return results.map(r => ({
    exercise: r.exercise,
    safetyResult: checkExerciseSafety(r.exercise, userState),
  }));
}

export function getRecommendedDuration(
  exercise: Exercise,
  userState: UserState
): { minutes: number; rounds: number | null } {
  const result = getRecommendedDurationV2(exercise, userState);
  return { minutes: result.minutes, rounds: result.rounds };
}

export function getIntegrationConfig(
  userState: UserState,
  exerciseIntensity: number
): IntegrationConfig {
  return getIntegrationConfigV2(userState, exerciseIntensity);
}
