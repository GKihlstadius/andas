// ============================================
// ANDAS - CORE TYPE DEFINITIONS
// ============================================

/**
 * User's nervous system baseline state
 */
export type NervousSystemBaseline = 'calm' | 'neutral' | 'stressed' | 'overstimulated';

/**
 * User's sensitivity to breathwork intensity
 */
export type Sensitivity = 'low' | 'medium' | 'high';

/**
 * Contraindications that restrict certain exercise types
 */
export interface Contraindications {
  breathHolds: boolean;
  fastBreathing: boolean;
}

/**
 * User's internal capacities (invisible to user)
 */
export interface Capacities {
  calmBreathing: number;      // 1-5
  focusStability: number;     // 1-5
  energyRegulation: number;   // 1-5
  holdTolerance: number;      // 1-5
}

/**
 * Adaptive flags set by session feedback
 */
export interface AdaptiveFlags {
  avoidFastBreathing: boolean;
  reduceIntensity: boolean;
  suggestGrounding: boolean;
  extendIntegration: boolean;
}

/**
 * Complete user state
 */
export interface UserState {
  id: string;
  onboardingCompleted: boolean;
  baseline: NervousSystemBaseline;
  sensitivity: Sensitivity;
  contraindications: Contraindications;
  capacities: Capacities;
  adaptiveFlags: AdaptiveFlags;
  currentDayInProgram: number;
  lastSessionDate: string | null;
  sessionHistory: SessionRecord[];
}

/**
 * Session record
 */
export interface SessionRecord {
  id: string;
  exerciseId: string;
  timestamp: string;
  durationMinutes: number;
  completedCycles: number;
  feedback: SessionFeedback | null;
  wasEarlyExit: boolean;
}

export type SessionFeedback = 'calmer' | 'same' | 'moreActivated';

/**
 * Breath pattern
 */
export interface BreathPattern {
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

/**
 * Exercise safety configuration
 */
export interface ExerciseSafety {
  maxIntensity: 1 | 2 | 3 | 4 | 5;
  requiresHoldTolerance: boolean;
  requiresFastBreathingTolerance: boolean;
  minimumCapacity: Partial<Capacities>;
  traumaSafeAlternativeId: string | null;
  contraindicated: Partial<Contraindications>;
}

/**
 * Exercise definition
 */
export interface Exercise {
  id: string;
  name: string;
  category: 'lugn' | 'fokus' | 'energi';
  shortDescription: string;
  description: string;
  pattern: BreathPattern;
  defaultMinutes: number | null;
  defaultRounds: number | null;
  guidance: {
    start: string | null;
    mid: string | null;
    end: string | null;
  };
  safety: ExerciseSafety;
  createdBy: 'system' | 'coach';
}

/**
 * Safety check result
 */
export interface SafetyCheckResult {
  allowed: boolean;
  reason: string | null;
  alternativeId: string | null;
  adaptedPattern: BreathPattern | null;
}

/**
 * Integration config
 */
export interface IntegrationConfig {
  durationSeconds: number;
  texts: string[];
  showMicroAction: boolean;
}

/**
 * Micro action
 */
export interface MicroAction {
  id: string;
  text: string;
  timeOfDay: 'morning' | 'evening' | 'any';
}

/**
 * Onboarding question
 */
export interface OnboardingQuestion {
  id: string;
  question: string;
  subtext: string;
  options: OnboardingOption[];
}

export interface OnboardingOption {
  id: string;
  label: string;
  effects: Partial<{
    baseline: NervousSystemBaseline;
    sensitivity: Sensitivity;
    contraindications: Partial<Contraindications>;
    capacities: Partial<Capacities>;
  }>;
}

/**
 * Breath phase
 */
export type BreathPhase = 'ready' | 'countdown' | 'inhale' | 'holdIn' | 'exhale' | 'holdOut' | 'complete';

/**
 * Session state
 */
export interface SessionState {
  phase: BreathPhase;
  phaseTimeRemaining: number;
  totalElapsed: number;
  cyclesCompleted: number;
  progress: number;
}
