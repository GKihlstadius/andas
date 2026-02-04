// ============================================
// ANDAS - SAFETY ENGINE UNIT TESTS
// ============================================
// These tests cover all critical safety paths.
// A failing test here means a potential safety issue.

import {
  checkExerciseSafety,
  getRecommendedExercise,
  getSafeExercisesForCategory,
  getRecommendedDuration,
  getIntegrationConfig,
} from '../safetyEngine';
import { Exercise, UserState, SafetyCheckResult } from '../../data/types';
import { exercises } from '../../data/exercises';

// ============================================
// TEST FIXTURES
// ============================================

const createBaseUserState = (overrides: Partial<UserState> = {}): UserState => ({
  id: 'test-user',
  onboardingCompleted: true,
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
  ...overrides,
});

const getExercise = (id: string): Exercise => {
  const exercise = exercises.find(e => e.id === id);
  if (!exercise) throw new Error(`Exercise ${id} not found`);
  return exercise;
};

// ============================================
// HARD CONTRAINDICATION TESTS
// ============================================

describe('Hard Contraindications', () => {
  describe('breathHolds', () => {
    it('should BLOCK 4-7-8 for users with breathHolds contraindication', () => {
      const userState = createBaseUserState({
        contraindications: { breathHolds: true, fastBreathing: false },
      });
      const exercise = getExercise('478');
      const result = checkExerciseSafety(exercise, userState);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('breathHolds');
      expect(result.alternativeId).toBe('extended-exhale');
      expect(result.adaptedPattern).toBeNull();
    });

    it('should ALLOW 4-7-8 for users WITHOUT breathHolds contraindication', () => {
      const userState = createBaseUserState({
        contraindications: { breathHolds: false, fastBreathing: false },
      });
      const exercise = getExercise('478');
      const result = checkExerciseSafety(exercise, userState);

      expect(result.allowed).toBe(true);
    });

    it('should BLOCK box breathing for users with breathHolds contraindication', () => {
      const userState = createBaseUserState({
        contraindications: { breathHolds: true, fastBreathing: false },
      });
      const exercise = getExercise('box');
      const result = checkExerciseSafety(exercise, userState);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('breathHolds');
      expect(result.alternativeId).toBe('coherent');
    });
  });

  describe('fastBreathing', () => {
    it('should BLOCK fast-breathing exercises for users with fastBreathing contraindication', () => {
      // Note: No fast-breathing exercises in current dataset, but test the logic
      const userState = createBaseUserState({
        contraindications: { breathHolds: false, fastBreathing: true },
      });
      
      // Create a mock fast-breathing exercise
      const fastExercise: Exercise = {
        ...getExercise('coherent'),
        id: 'fast-test',
        safety: {
          ...getExercise('coherent').safety,
          requiresFastBreathingTolerance: true,
          contraindicated: { fastBreathing: true },
        },
      };
      
      const result = checkExerciseSafety(fastExercise, userState);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('fastBreathing');
    });
  });
});

// ============================================
// ADAPTIVE FLAGS TESTS
// ============================================

describe('Adaptive Flags', () => {
  it('should BLOCK fast-breathing exercises when avoidFastBreathing flag is set', () => {
    const userState = createBaseUserState({
      adaptiveFlags: {
        avoidFastBreathing: true,
        reduceIntensity: false,
        suggestGrounding: false,
        extendIntegration: false,
      },
    });
    
    const fastExercise: Exercise = {
      ...getExercise('coherent'),
      id: 'fast-adaptive-test',
      safety: {
        ...getExercise('coherent').safety,
        requiresFastBreathingTolerance: true,
        traumaSafeAlternativeId: 'coherent',
      },
    };
    
    const result = checkExerciseSafety(fastExercise, userState);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('adaptiveBlock');
    expect(result.alternativeId).toBe('coherent');
  });

  it('should ADAPT pattern when reduceIntensity flag is set for high-intensity exercise', () => {
    const userState = createBaseUserState({
      adaptiveFlags: {
        avoidFastBreathing: false,
        reduceIntensity: true,
        suggestGrounding: false,
        extendIntegration: false,
      },
    });
    
    const highIntensityExercise: Exercise = {
      ...getExercise('478'),
      id: 'high-intensity-test',
      safety: {
        ...getExercise('478').safety,
        maxIntensity: 3,
      },
    };
    
    const result = checkExerciseSafety(highIntensityExercise, userState);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('adaptedForRecovery');
    expect(result.adaptedPattern).not.toBeNull();
    // Hold times should be reduced
    expect(result.adaptedPattern!.holdIn).toBeLessThan(highIntensityExercise.pattern.holdIn);
  });
});

// ============================================
// CAPACITY-BASED TESTS
// ============================================

describe('Capacity Requirements', () => {
  it('should BLOCK exercise when calmBreathing capacity is insufficient', () => {
    const userState = createBaseUserState({
      capacities: {
        calmBreathing: 1,
        focusStability: 2,
        energyRegulation: 2,
        holdTolerance: 2,
      },
    });
    
    const highCapacityExercise: Exercise = {
      ...getExercise('coherent'),
      id: 'high-calm-test',
      safety: {
        ...getExercise('coherent').safety,
        minimumCapacity: { calmBreathing: 3 },
        traumaSafeAlternativeId: 'trauma-safe',
      },
    };
    
    const result = checkExerciseSafety(highCapacityExercise, userState);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('insufficientCapacity');
    expect(result.alternativeId).toBe('trauma-safe');
  });

  it('should ADAPT pattern when holdTolerance is low', () => {
    const userState = createBaseUserState({
      capacities: {
        calmBreathing: 2,
        focusStability: 2,
        energyRegulation: 2,
        holdTolerance: 1,
      },
    });
    
    const exercise = getExercise('478'); // Has 7s hold
    const result = checkExerciseSafety(exercise, userState);
    
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('adaptedPattern');
    expect(result.adaptedPattern).not.toBeNull();
    expect(result.adaptedPattern!.holdIn).toBeLessThan(exercise.pattern.holdIn);
  });

  it('should ALLOW exercise when all capacities are sufficient', () => {
    const userState = createBaseUserState({
      capacities: {
        calmBreathing: 4,
        focusStability: 4,
        energyRegulation: 4,
        holdTolerance: 4,
      },
    });
    
    const exercise = getExercise('box');
    const result = checkExerciseSafety(exercise, userState);
    
    expect(result.allowed).toBe(true);
    expect(result.adaptedPattern).toBeNull();
  });
});

// ============================================
// BASELINE-BASED TESTS
// ============================================

describe('Baseline-Based Safety', () => {
  it('should BLOCK high-intensity exercises for overstimulated users', () => {
    const userState = createBaseUserState({
      baseline: 'overstimulated',
    });
    
    const highIntensityExercise: Exercise = {
      ...getExercise('coherent'),
      id: 'high-intensity-overstimulated-test',
      safety: {
        ...getExercise('coherent').safety,
        maxIntensity: 3,
        traumaSafeAlternativeId: 'trauma-safe',
      },
    };
    
    const result = checkExerciseSafety(highIntensityExercise, userState);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('tooIntenseForBaseline');
  });

  it('should BLOCK intensity 4+ exercises for stressed users', () => {
    const userState = createBaseUserState({
      baseline: 'stressed',
    });
    
    const veryHighIntensityExercise: Exercise = {
      ...getExercise('coherent'),
      id: 'very-high-intensity-test',
      safety: {
        ...getExercise('coherent').safety,
        maxIntensity: 4,
        traumaSafeAlternativeId: 'coherent',
      },
    };
    
    const result = checkExerciseSafety(veryHighIntensityExercise, userState);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('tooIntenseForBaseline');
  });

  it('should ALLOW low-intensity exercises for overstimulated users', () => {
    const userState = createBaseUserState({
      baseline: 'overstimulated',
    });
    
    const lowIntensityExercise = getExercise('trauma-safe');
    const result = checkExerciseSafety(lowIntensityExercise, userState);
    
    expect(result.allowed).toBe(true);
  });
});

// ============================================
// SENSITIVITY-BASED TESTS
// ============================================

describe('Sensitivity Adaptations', () => {
  it('should ADAPT pattern for high sensitivity users', () => {
    const userState = createBaseUserState({
      sensitivity: 'high',
    });
    
    const exercise = getExercise('box');
    const result = checkExerciseSafety(exercise, userState);
    
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe('adaptedForSensitivity');
    expect(result.adaptedPattern).not.toBeNull();
    expect(result.adaptedPattern!.holdIn).toBeLessThanOrEqual(2);
    expect(result.adaptedPattern!.inhale).toBeLessThanOrEqual(4);
  });

  it('should NOT adapt pattern for low sensitivity users', () => {
    const userState = createBaseUserState({
      sensitivity: 'low',
    });
    
    const exercise = getExercise('box');
    const result = checkExerciseSafety(exercise, userState);
    
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.adaptedPattern).toBeNull();
  });
});

// ============================================
// RECOMMENDATION ENGINE TESTS
// ============================================

describe('Recommendation Engine', () => {
  it('should recommend trauma-safe exercise for overstimulated users', () => {
    const userState = createBaseUserState({
      baseline: 'overstimulated',
    });
    
    const recommended = getRecommendedExercise(userState);
    expect(recommended.id).toBe('trauma-safe');
  });

  it('should recommend trauma-safe exercise when suggestGrounding flag is set', () => {
    const userState = createBaseUserState({
      adaptiveFlags: {
        avoidFastBreathing: false,
        reduceIntensity: false,
        suggestGrounding: true,
        extendIntegration: false,
      },
    });
    
    const recommended = getRecommendedExercise(userState);
    expect(recommended.id).toBe('trauma-safe');
  });

  it('should return safe exercises sorted by intensity', () => {
    const userState = createBaseUserState();
    const results = getSafeExercisesForCategory('lugn', userState);
    
    // All results should be allowed
    results.forEach(({ safetyResult }) => {
      expect(safetyResult.allowed).toBe(true);
    });
    
    // Should be sorted by intensity (lower first)
    for (let i = 1; i < results.length; i++) {
      expect(results[i].exercise.safety.maxIntensity)
        .toBeGreaterThanOrEqual(results[i - 1].exercise.safety.maxIntensity);
    }
  });
});

// ============================================
// DURATION RECOMMENDATION TESTS
// ============================================

describe('Duration Recommendations', () => {
  it('should reduce duration for overstimulated users', () => {
    const userState = createBaseUserState({
      baseline: 'overstimulated',
    });
    const exercise = getExercise('coherent');
    
    const duration = getRecommendedDuration(exercise, userState);
    expect(duration.minutes).toBeLessThan(exercise.defaultMinutes!);
  });

  it('should reduce duration for high sensitivity users', () => {
    const userState = createBaseUserState({
      sensitivity: 'high',
    });
    const exercise = getExercise('coherent');
    
    const duration = getRecommendedDuration(exercise, userState);
    expect(duration.minutes).toBeLessThan(exercise.defaultMinutes!);
  });

  it('should never recommend less than 2 minutes', () => {
    const userState = createBaseUserState({
      baseline: 'overstimulated',
      sensitivity: 'high',
    });
    const exercise = getExercise('coherent');
    
    const duration = getRecommendedDuration(exercise, userState);
    expect(duration.minutes).toBeGreaterThanOrEqual(2);
  });
});

// ============================================
// INTEGRATION CONFIG TESTS
// ============================================

describe('Integration Configuration', () => {
  it('should extend integration for high intensity exercises', () => {
    const userState = createBaseUserState();
    const config = getIntegrationConfig(userState, 4);
    
    expect(config.durationSeconds).toBe(60);
  });

  it('should extend integration when extendIntegration flag is set', () => {
    const userState = createBaseUserState({
      adaptiveFlags: {
        avoidFastBreathing: false,
        reduceIntensity: false,
        suggestGrounding: false,
        extendIntegration: true,
      },
    });
    const config = getIntegrationConfig(userState, 1);
    
    expect(config.durationSeconds).toBe(60);
  });

  it('should always show integration texts', () => {
    const userState = createBaseUserState();
    const config = getIntegrationConfig(userState, 1);
    
    expect(config.texts.length).toBeGreaterThan(0);
  });

  it('should hide micro-action when suggestGrounding is set', () => {
    const userState = createBaseUserState({
      adaptiveFlags: {
        avoidFastBreathing: false,
        reduceIntensity: false,
        suggestGrounding: true,
        extendIntegration: false,
      },
    });
    const config = getIntegrationConfig(userState, 1);
    
    expect(config.showMicroAction).toBe(false);
  });
});

// ============================================
// EDGE CASE TESTS
// ============================================

describe('Edge Cases', () => {
  it('should handle exercise with no holds gracefully', () => {
    const userState = createBaseUserState();
    const exercise = getExercise('coherent'); // 5-0-5-0 pattern
    
    const result = checkExerciseSafety(exercise, userState);
    expect(result.allowed).toBe(true);
  });

  it('should handle trauma-safe alternative being null', () => {
    const userState = createBaseUserState({
      contraindications: { breathHolds: true, fastBreathing: false },
    });
    
    // trauma-safe exercise has no alternative
    const exercise = getExercise('trauma-safe');
    const result = checkExerciseSafety(exercise, userState);
    
    // Should still be allowed (it's trauma-safe!)
    expect(result.allowed).toBe(true);
  });

  it('should handle all neutral user state', () => {
    const userState = createBaseUserState({
      baseline: 'neutral',
      sensitivity: 'medium',
    });
    
    exercises.forEach(exercise => {
      const result = checkExerciseSafety(exercise, userState);
      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('reason');
      expect(result).toHaveProperty('alternativeId');
      expect(result).toHaveProperty('adaptedPattern');
    });
  });
});

// ============================================
// SAFETY INVARIANTS
// ============================================

describe('Safety Invariants', () => {
  it('should NEVER allow breathHolds for users with breathHolds contraindication', () => {
    const userState = createBaseUserState({
      contraindications: { breathHolds: true, fastBreathing: false },
    });
    
    exercises.forEach(exercise => {
      const result = checkExerciseSafety(exercise, userState);
      
      if (exercise.safety.contraindicated.breathHolds) {
        expect(result.allowed).toBe(false);
      }
    });
  });

  it('should NEVER allow fastBreathing for users with fastBreathing contraindication', () => {
    const userState = createBaseUserState({
      contraindications: { breathHolds: false, fastBreathing: true },
    });
    
    exercises.forEach(exercise => {
      const result = checkExerciseSafety(exercise, userState);
      
      if (exercise.safety.contraindicated.fastBreathing) {
        expect(result.allowed).toBe(false);
      }
    });
  });

  it('should ALWAYS have an alternative for blocked exercises', () => {
    const userState = createBaseUserState({
      baseline: 'overstimulated',
    });
    
    exercises.forEach(exercise => {
      const result = checkExerciseSafety(exercise, userState);
      
      if (!result.allowed && exercise.safety.traumaSafeAlternativeId) {
        expect(result.alternativeId).not.toBeNull();
      }
    });
  });
});
