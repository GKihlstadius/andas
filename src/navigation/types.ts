// ============================================
// ANDAS - NAVIGATION TYPES
// ============================================

import { BreathPattern } from '../data/types';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  Home: undefined;
  Preparation: {
    exerciseId: string;
  };
  Session: {
    exerciseId: string;
    pattern: BreathPattern;
    durationMinutes: number;
    durationRounds: number | null;
  };
  Integration: {
    exerciseId: string;
    completedCycles: number;
    wasEarlyExit: boolean;
  };
  Feedback: {
    exerciseId: string;
    completedCycles: number;
    wasEarlyExit: boolean;
  };
};

export type TabParamList = {
  HomeTab: undefined;
  ProgressTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
