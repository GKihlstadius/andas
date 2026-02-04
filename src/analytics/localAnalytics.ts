// ============================================
// ANDAS - LOCAL ANALYTICS
// ============================================
// Minimal, ethical analytics. Local only.
// No behavior tracking. No dark patterns.
// No growth optimization. Just safety insights.

import AsyncStorage from '@react-native-async-storage/async-storage';

const ANALYTICS_KEY = 'andas_analytics_v1';

// ============================================
// EVENT TYPES
// ============================================

export type AnalyticsEvent =
  | { type: 'session_started'; exerciseId: string; timestamp: string }
  | { type: 'session_completed'; exerciseId: string; durationMinutes: number; timestamp: string }
  | { type: 'negative_feedback'; exerciseId: string; timestamp: string }
  | { type: 'early_exit'; exerciseId: string; timestamp: string };

// ============================================
// AGGREGATED STATS (for internal use)
// ============================================

export interface AnalyticsStats {
  totalSessionsStarted: number;
  totalSessionsCompleted: number;
  totalNegativeFeedback: number;
  totalEarlyExits: number;
  lastUpdated: string;
}

// ============================================
// LOG EVENT
// ============================================

/**
 * Log an analytics event
 * This is local-only, no network calls
 */
export async function logEvent(event: AnalyticsEvent): Promise<void> {
  try {
    // Store in memory for current session
    // In v1, we don't persist individual events to avoid storage bloat
    // We only update aggregated stats
    
    const stats = await getStats();
    
    switch (event.type) {
      case 'session_started':
        stats.totalSessionsStarted++;
        break;
      case 'session_completed':
        stats.totalSessionsCompleted++;
        break;
      case 'negative_feedback':
        stats.totalNegativeFeedback++;
        break;
      case 'early_exit':
        stats.totalEarlyExits++;
        break;
    }
    
    stats.lastUpdated = new Date().toISOString();
    
    await saveStats(stats);
  } catch (error) {
    // Analytics are non-critical, silently fail
    console.warn('Analytics error:', error);
  }
}

// ============================================
// GET STATS
// ============================================

/**
 * Get aggregated analytics stats
 */
export async function getStats(): Promise<AnalyticsStats> {
  try {
    const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load analytics:', error);
  }
  
  return {
    totalSessionsStarted: 0,
    totalSessionsCompleted: 0,
    totalNegativeFeedback: 0,
    totalEarlyExits: 0,
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================
// SAVE STATS
// ============================================

async function saveStats(stats: AnalyticsStats): Promise<void> {
  try {
    await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn('Failed to save analytics:', error);
  }
}

// ============================================
// CLEAR STATS
// ============================================

/**
 * Clear all analytics data
 * Called on reset or when user requests data deletion
 */
export async function clearAnalytics(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANALYTICS_KEY);
  } catch (error) {
    console.warn('Failed to clear analytics:', error);
  }
}

// ============================================
// SAFETY INSIGHTS
// ============================================

/**
 * Get safety insights for the current user
 * This helps identify if the app is working as intended
 */
export async function getSafetyInsights(): Promise<{
  completionRate: number;
  negativeFeedbackRate: number;
  earlyExitRate: number;
  isHealthy: boolean;
}> {
  const stats = await getStats();
  
  const completionRate = stats.totalSessionsStarted > 0
    ? stats.totalSessionsCompleted / stats.totalSessionsStarted
    : 0;
  
  const negativeFeedbackRate = stats.totalSessionsCompleted > 0
    ? stats.totalNegativeFeedback / stats.totalSessionsCompleted
    : 0;
  
  const earlyExitRate = stats.totalSessionsStarted > 0
    ? stats.totalEarlyExits / stats.totalSessionsStarted
    : 0;
  
  // Healthy thresholds
  // - Completion rate > 70%
  // - Negative feedback rate < 30%
  // - Early exit rate < 20%
  const isHealthy = 
    completionRate > 0.7 && 
    negativeFeedbackRate < 0.3 && 
    earlyExitRate < 0.2;
  
  return {
    completionRate,
    negativeFeedbackRate,
    earlyExitRate,
    isHealthy,
  };
}
