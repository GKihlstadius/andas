// ============================================
// ANDAS - EXERCISE LIBRARY
// ============================================

import { Exercise, OnboardingQuestion, MicroAction } from './types';

/**
 * All exercises with safety metadata
 * MVP: LUGN category only
 */
export const exercises: Exercise[] = [
  // ===== LUGN (Calming) =====
  {
    id: 'physiological-sigh',
    name: 'Fysiologisk suck',
    category: 'lugn',
    shortDescription: 'Snabb nedreglering',
    description: 'Dubbel inandning följd av lång utandning. Kroppens naturliga lugn-knapp.',
    pattern: { inhale: 3, holdIn: 0, exhale: 6, holdOut: 1 },
    defaultRounds: 3,
    defaultMinutes: null,
    guidance: {
      start: 'Andas in genom näsan, kort paus, andas in lite till.',
      mid: null,
      end: 'Låt andningen återgå.',
    },
    safety: {
      maxIntensity: 1,
      requiresHoldTolerance: false,
      requiresFastBreathingTolerance: false,
      minimumCapacity: {},
      traumaSafeAlternativeId: null,
      contraindicated: {},
    },
    createdBy: 'system',
  },
  {
    id: 'coherent',
    name: 'Koherent andning',
    category: 'lugn',
    shortDescription: 'Hjärt-hjärna synk',
    description: 'Jämn rytm som synkroniserar hjärta och andning.',
    pattern: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 },
    defaultMinutes: 5,
    defaultRounds: null,
    guidance: {
      start: 'Hitta en bekväm rytm.',
      mid: 'Låt kroppen göra jobbet.',
      end: 'Stanna kvar en stund.',
    },
    safety: {
      maxIntensity: 1,
      requiresHoldTolerance: false,
      requiresFastBreathingTolerance: false,
      minimumCapacity: {},
      traumaSafeAlternativeId: null,
      contraindicated: {},
    },
    createdBy: 'system',
  },
  {
    id: 'extended-exhale',
    name: 'Förlängd utandning',
    category: 'lugn',
    shortDescription: '4-6 andning',
    description: 'Längre utandning aktiverar parasympatiska systemet.',
    pattern: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 },
    defaultMinutes: 5,
    defaultRounds: null,
    guidance: {
      start: 'Utandningen får vara mjuk.',
      mid: null,
      end: 'Känn hur kroppen landar.',
    },
    safety: {
      maxIntensity: 1,
      requiresHoldTolerance: false,
      requiresFastBreathingTolerance: false,
      minimumCapacity: {},
      traumaSafeAlternativeId: null,
      contraindicated: {},
    },
    createdBy: 'system',
  },
  {
    id: '478',
    name: '4-7-8 andning',
    category: 'lugn',
    shortDescription: 'Sömn och vila',
    description: 'Aktiverar djup avslappning. Innehåller anhåll.',
    pattern: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
    defaultRounds: 4,
    defaultMinutes: null,
    guidance: {
      start: 'Låt det ta tid.',
      mid: null,
      end: 'Vila i stillheten.',
    },
    safety: {
      maxIntensity: 2,
      requiresHoldTolerance: true,
      requiresFastBreathingTolerance: false,
      minimumCapacity: { holdTolerance: 2 },
      traumaSafeAlternativeId: 'extended-exhale',
      contraindicated: { breathHolds: true },
    },
    createdBy: 'system',
  },
  {
    id: 'trauma-safe',
    name: 'Trygg andning',
    category: 'lugn',
    shortDescription: 'Extra skonsam',
    description: 'Mjuk rytm utan anhåll. Trygg för alla.',
    pattern: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 },
    defaultMinutes: 5,
    defaultRounds: null,
    guidance: {
      start: 'Det här är mjukt.',
      mid: null,
      end: 'Du tog hand om dig.',
    },
    safety: {
      maxIntensity: 1,
      requiresHoldTolerance: false,
      requiresFastBreathingTolerance: false,
      minimumCapacity: {},
      traumaSafeAlternativeId: null,
      contraindicated: {},
    },
    createdBy: 'system',
  },
  
  // ===== FOKUS (Stable Presence - Low Arousal) =====
  // All FOKUS exercises are designed for stable presence, NOT performance
  // Max intensity 2, no fast breathing, no tempo push
  {
    id: 'box',
    name: 'Box breathing',
    category: 'fokus',
    shortDescription: 'Fyrkant för stabilitet',
    description: 'Fyra lika faser bygger en känsla av stadga. Ingen brådska.',
    pattern: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
    defaultMinutes: 5,
    defaultRounds: null,
    guidance: {
      start: 'Föreställ dig att du ritar en fyrkant med andningen.',
      mid: 'Ingen fas är viktigare än någon annan.',
      end: 'Känn stabiliteten du har skapat.',
    },
    safety: {
      maxIntensity: 2,
      requiresHoldTolerance: true,
      requiresFastBreathingTolerance: false,
      minimumCapacity: { holdTolerance: 2, focusStability: 2 },
      traumaSafeAlternativeId: 'coherent',
      contraindicated: { breathHolds: true },
    },
    createdBy: 'system',
  },
  {
    id: 'soft-focus',
    name: 'Mjuk fokus',
    category: 'fokus',
    shortDescription: 'Närvaro utan ansträngning',
    description: 'En enkel rytm som stödjer närvaro utan att prestera.',
    pattern: { inhale: 4, holdIn: 0, exhale: 4, holdOut: 0 },
    defaultMinutes: 5,
    defaultRounds: null,
    guidance: {
      start: 'Låt andningen hitta sin egen rytm.',
      mid: 'Du behöver inte göra något rätt.',
      end: 'Bär denna närvaron med dig.',
    },
    safety: {
      maxIntensity: 1,
      requiresHoldTolerance: false,
      requiresFastBreathingTolerance: false,
      minimumCapacity: {},
      traumaSafeAlternativeId: null,
      contraindicated: {},
    },
    createdBy: 'system',
  },
  {
    id: 'grounding-breath',
    name: 'Jordande andning',
    category: 'fokus',
    shortDescription: 'Förankring i nuet',
    description: 'Längre utandning för att landa i kroppen och nuet.',
    pattern: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 2 },
    defaultMinutes: 5,
    defaultRounds: null,
    guidance: {
      start: 'Andas in genom näsan, ut genom munnen.',
      mid: 'Känn kontakten med underlaget.',
      end: 'Du är här. Just nu.',
    },
    safety: {
      maxIntensity: 1,
      requiresHoldTolerance: false,
      requiresFastBreathingTolerance: false,
      minimumCapacity: {},
      traumaSafeAlternativeId: null,
      contraindicated: {},
    },
    createdBy: 'system',
  },
];

/**
 * Get exercise by ID
 */
export const getExerciseById = (id: string): Exercise | undefined =>
  exercises.find((e) => e.id === id);

/**
 * Get exercises by category
 */
export const getExercisesByCategory = (category: Exercise['category']): Exercise[] =>
  exercises.filter((e) => e.category === category);

/**
 * Onboarding questions
 */
export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 'baseline',
    question: 'Hur brukar du känna dig i vardagen?',
    subtext: 'Tänk på de senaste veckorna.',
    options: [
      {
        id: 'calm',
        label: 'Oftast lugn',
        effects: { baseline: 'calm', capacities: { calmBreathing: 3 } },
      },
      {
        id: 'neutral',
        label: 'Varierar',
        effects: { baseline: 'neutral' },
      },
      {
        id: 'stressed',
        label: 'Ofta stressad',
        effects: { baseline: 'stressed', sensitivity: 'high' },
      },
      {
        id: 'overwhelmed',
        label: 'Ofta överväldigad',
        effects: {
          baseline: 'overstimulated',
          sensitivity: 'high',
          capacities: { calmBreathing: 1, energyRegulation: 1 },
        },
      },
    ],
  },
  {
    id: 'experience',
    question: 'Har du provat andningsövningar förut?',
    subtext: 'Det finns inget rätt svar.',
    options: [
      {
        id: 'none',
        label: 'Aldrig',
        effects: {
          sensitivity: 'high',
          capacities: { holdTolerance: 1, focusStability: 1 },
        },
      },
      {
        id: 'some',
        label: 'Lite grann',
        effects: { sensitivity: 'medium' },
      },
      {
        id: 'regular',
        label: 'Regelbundet',
        effects: {
          sensitivity: 'low',
          capacities: { holdTolerance: 3, focusStability: 3 },
        },
      },
    ],
  },
  {
    id: 'contraindications',
    question: 'Finns något av detta?',
    subtext: 'Vi anpassar övningarna. Ingen blir utesluten.',
    options: [
      {
        id: 'none',
        label: 'Inget av detta',
        effects: {},
      },
      {
        id: 'anxiety',
        label: 'Ångest eller panik',
        effects: {
          contraindications: { fastBreathing: true, breathHolds: true },
          sensitivity: 'high',
        },
      },
      {
        id: 'heart',
        label: 'Hjärtproblem',
        effects: {
          contraindications: { fastBreathing: true, breathHolds: true },
        },
      },
      {
        id: 'pregnancy',
        label: 'Gravid',
        effects: {
          contraindications: { fastBreathing: true },
        },
      },
    ],
  },
];

/**
 * Integration texts
 */
export const integrationTexts: string[] = [
  'Ligg kvar. Känn kroppen.',
  'Inget att göra. Bara vara.',
  'Låt andningen vara naturlig.',
  'Känn fötterna mot golvet.',
  'Du är här. Just nu.',
];

/**
 * Micro actions
 */
export const microActions: MicroAction[] = [
  { id: 'water', text: 'Drick ett glas vatten', timeOfDay: 'any' },
  { id: 'walk', text: 'Gå en kort promenad', timeOfDay: 'any' },
  { id: 'journal', text: 'Skriv en mening om hur du mår', timeOfDay: 'any' },
  { id: 'sleep', text: 'Förbered för sömn', timeOfDay: 'evening' },
  { id: 'stretch', text: 'Sträck på dig', timeOfDay: 'morning' },
];
