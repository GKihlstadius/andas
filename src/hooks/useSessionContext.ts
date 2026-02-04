// ============================================
// ANDAS - SESSION CONTEXT HOOK
// ============================================
// Provides context-aware session recommendations
// based on time, history, and user state

import { useMemo } from 'react';
import { UserState, SessionRecord } from '../data/types';
import { SessionContext } from '../safety/safetyEngine.v2';

export function useSessionContext(userState: UserState): SessionContext {
  return useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    
    // Determine time of day
    const timeOfDay = 
      hour < 10 ? 'morning' :
      hour < 14 ? 'afternoon' :
      hour < 20 ? 'evening' : 'night';

    // Calculate days since last session
    const daysSinceLastSession = userState.lastSessionDate
      ? Math.floor((now.getTime() - new Date(userState.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Get recent feedback
    const recentSessions = userState.sessionHistory.slice(0, 5);
    const recentFeedback = recentSessions[0]?.feedback || null;

    // Count consecutive negative experiences
    const consecutiveNegativeExperiences = countConsecutiveNegative(recentSessions);

    // Calculate streak
    const streakDays = calculateStreak(userState.sessionHistory);

    return {
      timeOfDay,
      daysSinceLastSession,
      recentFeedback,
      consecutiveNegativeExperiences,
      streakDays,
    };
  }, [userState.lastSessionDate, userState.sessionHistory]);
}

function countConsecutiveNegative(sessions: SessionRecord[]): number {
  let count = 0;
  for (const session of sessions) {
    if (session.feedback === 'moreActivated' || session.wasEarlyExit) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function calculateStreak(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);

  for (const session of sessions) {
    const sessionDate = new Date(session.timestamp);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (sessionDate.getTime() < checkDate.getTime()) {
      break;
    }
  }

  return streak;
}
