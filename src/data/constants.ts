// ============================================
// ANDAS - DESIGN TOKENS & CONSTANTS
// ============================================

export const colors = {
  bg: {
    primary: '#F5F3EF',
    secondary: '#EBE8E2',
    calm: '#E8EBE4',
  },
  surface: {
    primary: '#FAFAF8',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#2C2C2B',
    secondary: '#5C5C5A',
    tertiary: '#8C8C88',
    muted: '#B0B0AA',
    inverse: '#FAFAF8',
  },
  accent: {
    sage: '#7A9181',
    sageDark: '#5D7266',
    sageLight: '#A3B5A9',
    sand: '#B8A992',
  },
  category: {
    lugn: '#7A9181',
    fokus: '#7A8391',
    energi: '#91847A',
  },
  breath: {
    inhale: '#7A9181',
    hold: '#8B9A90',
    exhale: '#A69882',
  },
  functional: {
    safety: '#B8A992',
    safetyBg: '#F5F0EA',
  },
} as const;

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 21,
    xl: 28,
    '2xl': 36,
  },
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#2C2C2B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#2C2C2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#2C2C2B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
} as const;
