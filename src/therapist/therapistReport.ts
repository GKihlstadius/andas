// ============================================
// ANDAS - THERAPIST REPORT GENERATOR
// ============================================
// Generates a shareable PDF/text report for therapist sessions

import { UserState, SessionRecord, SessionFeedback } from '../data/types';
import { getExerciseById } from '../data/exercises';
import { Share, Platform } from 'react-native';

// ============================================
// TYPES
// ============================================

export interface TherapistReport {
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  summary: ReportSummary;
  patterns: ReportPatterns;
  sessions: SessionDetail[];
  recommendations: string[];
}

interface ReportSummary {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  completionRate: number;
  mostUsedExercise: string | null;
  feedbackDistribution: {
    calmer: number;
    same: number;
    moreActivated: number;
    noFeedback: number;
  };
}

interface ReportPatterns {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'varied';
  consistencyScore: number; // 0-100
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  earlyExitRate: number;
  averageCyclesCompleted: number;
}

interface SessionDetail {
  date: string;
  exerciseName: string;
  duration: number;
  cycles: number;
  feedback: SessionFeedback | null;
  wasEarlyExit: boolean;
}

// ============================================
// REPORT GENERATION
// ============================================

export function generateTherapistReport(
  userState: UserState,
  daysBack: number = 30
): TherapistReport {
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - daysBack);

  // Filter sessions in period
  const sessionsInPeriod = userState.sessionHistory.filter(
    s => new Date(s.timestamp) >= periodStart
  );

  // Generate summary
  const summary = generateSummary(sessionsInPeriod);

  // Analyze patterns
  const patterns = analyzePatterns(sessionsInPeriod);

  // Format session details
  const sessions = sessionsInPeriod.map(formatSessionDetail);

  // Generate recommendations
  const recommendations = generateRecommendations(
    userState,
    summary,
    patterns
  );

  return {
    generatedAt: now.toISOString(),
    periodStart: periodStart.toISOString(),
    periodEnd: now.toISOString(),
    summary,
    patterns,
    sessions,
    recommendations,
  };
}

function generateSummary(sessions: SessionRecord[]): ReportSummary {
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const averageSessionLength = totalSessions > 0
    ? Math.round(totalMinutes / totalSessions)
    : 0;

  // Completion rate (sessions not ended early)
  const completedSessions = sessions.filter(s => !s.wasEarlyExit).length;
  const completionRate = totalSessions > 0
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0;

  // Most used exercise
  const exerciseCounts: Record<string, number> = {};
  sessions.forEach(s => {
    exerciseCounts[s.exerciseId] = (exerciseCounts[s.exerciseId] || 0) + 1;
  });
  
  let mostUsedId: string | null = null;
  let maxCount = 0;
  Object.entries(exerciseCounts).forEach(([id, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedId = id;
    }
  });
  
  const mostUsedExercise = mostUsedId
    ? getExerciseById(mostUsedId)?.name || null
    : null;

  // Feedback distribution
  const feedbackDistribution = {
    calmer: sessions.filter(s => s.feedback === 'calmer').length,
    same: sessions.filter(s => s.feedback === 'same').length,
    moreActivated: sessions.filter(s => s.feedback === 'moreActivated').length,
    noFeedback: sessions.filter(s => s.feedback === null).length,
  };

  return {
    totalSessions,
    totalMinutes,
    averageSessionLength,
    completionRate,
    mostUsedExercise,
    feedbackDistribution,
  };
}

function analyzePatterns(sessions: SessionRecord[]): ReportPatterns {
  // Preferred time of day
  const hourCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  sessions.forEach(s => {
    const hour = new Date(s.timestamp).getHours();
    if (hour >= 5 && hour < 12) hourCounts.morning++;
    else if (hour >= 12 && hour < 17) hourCounts.afternoon++;
    else if (hour >= 17 && hour < 21) hourCounts.evening++;
    else hourCounts.night++;
  });

  const maxHourCount = Math.max(...Object.values(hourCounts));
  const totalHourCount = Object.values(hourCounts).reduce((a, b) => a + b, 0);
  
  let preferredTimeOfDay: ReportPatterns['preferredTimeOfDay'] = 'varied';
  if (maxHourCount > totalHourCount * 0.5) {
    preferredTimeOfDay = Object.entries(hourCounts).find(
      ([_, count]) => count === maxHourCount
    )?.[0] as ReportPatterns['preferredTimeOfDay'] || 'varied';
  }

  // Consistency score (based on regularity)
  const consistencyScore = calculateConsistencyScore(sessions);

  // Trend analysis
  const trend = analyzeTrend(sessions);

  // Early exit rate
  const earlyExitRate = sessions.length > 0
    ? Math.round((sessions.filter(s => s.wasEarlyExit).length / sessions.length) * 100)
    : 0;

  // Average cycles
  const averageCyclesCompleted = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.completedCycles, 0) / sessions.length * 10) / 10
    : 0;

  return {
    preferredTimeOfDay,
    consistencyScore,
    trend,
    earlyExitRate,
    averageCyclesCompleted,
  };
}

function calculateConsistencyScore(sessions: SessionRecord[]): number {
  if (sessions.length < 3) return 0;

  // Get unique days with sessions
  const daysWithSessions = new Set(
    sessions.map(s => {
      const d = new Date(s.timestamp);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  // Calculate gaps
  const sortedDates = Array.from(daysWithSessions)
    .map(d => {
      const [y, m, day] = d.split('-').map(Number);
      return new Date(y, m, day);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  if (sortedDates.length < 2) return sessions.length >= 3 ? 30 : 0;

  let totalGap = 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const gap = Math.floor(
      (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    );
    totalGap += gap;
  }

  const avgGap = totalGap / (sortedDates.length - 1);
  
  // Score: 100 for daily, 0 for gaps > 7 days
  const score = Math.max(0, Math.min(100, Math.round(100 - (avgGap - 1) * 15)));
  return score;
}

function analyzeTrend(sessions: SessionRecord[]): ReportPatterns['trend'] {
  if (sessions.length < 6) return 'insufficient_data';

  // Split into first half and second half
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  // Calculate positive feedback ratio for each half
  const firstHalfPositive = firstHalf.filter(s => s.feedback === 'calmer').length / firstHalf.length;
  const secondHalfPositive = secondHalf.filter(s => s.feedback === 'calmer').length / secondHalf.length;

  const difference = secondHalfPositive - firstHalfPositive;

  if (difference > 0.15) return 'improving';
  if (difference < -0.15) return 'declining';
  return 'stable';
}

function formatSessionDetail(session: SessionRecord): SessionDetail {
  const exercise = getExerciseById(session.exerciseId);
  return {
    date: new Date(session.timestamp).toLocaleDateString('sv-SE'),
    exerciseName: exercise?.name || session.exerciseId,
    duration: session.durationMinutes,
    cycles: session.completedCycles,
    feedback: session.feedback,
    wasEarlyExit: session.wasEarlyExit,
  };
}

function generateRecommendations(
  userState: UserState,
  summary: ReportSummary,
  patterns: ReportPatterns
): string[] {
  const recommendations: string[] = [];

  // Based on completion rate
  if (summary.completionRate < 70) {
    recommendations.push(
      'Användaren avslutar ofta sessioner i förtid. Överväg kortare sessioner eller diskutera eventuella hinder.'
    );
  }

  // Based on feedback distribution
  const negativeRatio = summary.feedbackDistribution.moreActivated / 
    (summary.totalSessions || 1);
  if (negativeRatio > 0.3) {
    recommendations.push(
      'Hög andel sessioner resulterar i ökad aktivering. Överväg att fokusera på ännu mjukare övningar eller kortare duration.'
    );
  }

  // Based on consistency
  if (patterns.consistencyScore < 40) {
    recommendations.push(
      'Låg regelbundenhet. Diskutera möjligheten att etablera en fast tid för övningar.'
    );
  }

  // Based on sensitivity
  if (userState.sensitivity === 'high') {
    recommendations.push(
      'Användaren har hög känslighet. Fortsätt med trauma-trygga övningar och undvik intensiva metoder.'
    );
  }

  // Based on contraindications
  if (userState.contraindications.breathHolds) {
    recommendations.push(
      'Användaren undviker anhåll. Detta kan vara relevant för behandlingsplaneringen.'
    );
  }

  // Based on trend
  if (patterns.trend === 'declining') {
    recommendations.push(
      'Trenden visar försämring. Överväg att utvärdera nuvarande övningar och eventuella externa faktorer.'
    );
  }

  return recommendations.slice(0, 5);
}

// ============================================
// REPORT FORMATTING
// ============================================

export function formatReportAsText(report: TherapistReport, language: 'sv' | 'en' = 'sv'): string {
  const isSv = language === 'sv';
  
  const lines: string[] = [];
  
  // Header
  lines.push('═'.repeat(50));
  lines.push(isSv ? 'ANDAS - TERAPEUTRAPPORT' : 'ANDAS - THERAPIST REPORT');
  lines.push('═'.repeat(50));
  lines.push('');
  
  // Period
  const startDate = new Date(report.periodStart).toLocaleDateString(isSv ? 'sv-SE' : 'en-US');
  const endDate = new Date(report.periodEnd).toLocaleDateString(isSv ? 'sv-SE' : 'en-US');
  lines.push(`${isSv ? 'Period' : 'Period'}: ${startDate} - ${endDate}`);
  lines.push(`${isSv ? 'Genererad' : 'Generated'}: ${new Date(report.generatedAt).toLocaleString(isSv ? 'sv-SE' : 'en-US')}`);
  lines.push('');
  
  // Summary
  lines.push('─'.repeat(50));
  lines.push(isSv ? 'SAMMANFATTNING' : 'SUMMARY');
  lines.push('─'.repeat(50));
  lines.push(`${isSv ? 'Antal sessioner' : 'Total sessions'}: ${report.summary.totalSessions}`);
  lines.push(`${isSv ? 'Total tid' : 'Total time'}: ${report.summary.totalMinutes} min`);
  lines.push(`${isSv ? 'Genomsnittlig längd' : 'Average duration'}: ${report.summary.averageSessionLength} min`);
  lines.push(`${isSv ? 'Genomföringsgrad' : 'Completion rate'}: ${report.summary.completionRate}%`);
  lines.push(`${isSv ? 'Mest använd övning' : 'Most used exercise'}: ${report.summary.mostUsedExercise || '-'}`);
  lines.push('');
  
  // Feedback
  lines.push(isSv ? 'Feedback-fördelning:' : 'Feedback distribution:');
  lines.push(`  ${isSv ? 'Lugnare' : 'Calmer'}: ${report.summary.feedbackDistribution.calmer}`);
  lines.push(`  ${isSv ? 'Samma' : 'Same'}: ${report.summary.feedbackDistribution.same}`);
  lines.push(`  ${isSv ? 'Mer aktiverad' : 'More activated'}: ${report.summary.feedbackDistribution.moreActivated}`);
  lines.push(`  ${isSv ? 'Ingen feedback' : 'No feedback'}: ${report.summary.feedbackDistribution.noFeedback}`);
  lines.push('');
  
  // Patterns
  lines.push('─'.repeat(50));
  lines.push(isSv ? 'MÖNSTER' : 'PATTERNS');
  lines.push('─'.repeat(50));
  
  const timeLabels: Record<string, Record<'sv' | 'en', string>> = {
    morning: { sv: 'Morgon', en: 'Morning' },
    afternoon: { sv: 'Eftermiddag', en: 'Afternoon' },
    evening: { sv: 'Kväll', en: 'Evening' },
    night: { sv: 'Natt', en: 'Night' },
    varied: { sv: 'Varierar', en: 'Varies' },
  };
  
  const trendLabels: Record<string, Record<'sv' | 'en', string>> = {
    improving: { sv: 'Förbättras', en: 'Improving' },
    stable: { sv: 'Stabil', en: 'Stable' },
    declining: { sv: 'Försämras', en: 'Declining' },
    insufficient_data: { sv: 'Otillräcklig data', en: 'Insufficient data' },
  };
  
  lines.push(`${isSv ? 'Föredragen tid' : 'Preferred time'}: ${timeLabels[report.patterns.preferredTimeOfDay][language]}`);
  lines.push(`${isSv ? 'Regelbundenhet' : 'Consistency'}: ${report.patterns.consistencyScore}/100`);
  lines.push(`${isSv ? 'Trend' : 'Trend'}: ${trendLabels[report.patterns.trend][language]}`);
  lines.push(`${isSv ? 'Avbrott' : 'Early exits'}: ${report.patterns.earlyExitRate}%`);
  lines.push(`${isSv ? 'Snitt cykler' : 'Avg cycles'}: ${report.patterns.averageCyclesCompleted}`);
  lines.push('');
  
  // Recommendations
  if (report.recommendations.length > 0) {
    lines.push('─'.repeat(50));
    lines.push(isSv ? 'REKOMMENDATIONER' : 'RECOMMENDATIONS');
    lines.push('─'.repeat(50));
    report.recommendations.forEach((rec, i) => {
      lines.push(`${i + 1}. ${rec}`);
    });
    lines.push('');
  }
  
  // Session log
  lines.push('─'.repeat(50));
  lines.push(isSv ? 'SESSIONSLOGG (senaste 10)' : 'SESSION LOG (last 10)');
  lines.push('─'.repeat(50));
  
  const recentSessions = report.sessions.slice(0, 10);
  recentSessions.forEach(s => {
    const feedbackEmoji = s.feedback === 'calmer' ? '😌' : 
                          s.feedback === 'same' ? '😐' : 
                          s.feedback === 'moreActivated' ? '😰' : '➖';
    const exitMark = s.wasEarlyExit ? ' ⚠️' : '';
    lines.push(`${s.date} | ${s.exerciseName} | ${s.duration}min | ${s.cycles} ${isSv ? 'cykler' : 'cycles'} | ${feedbackEmoji}${exitMark}`);
  });
  
  lines.push('');
  lines.push('═'.repeat(50));
  lines.push(isSv ? 'Genererad av ANDAS' : 'Generated by ANDAS');
  lines.push('═'.repeat(50));
  
  return lines.join('\n');
}

// ============================================
// SHARING
// ============================================

export async function shareTherapistReport(
  userState: UserState,
  language: 'sv' | 'en' = 'sv'
): Promise<boolean> {
  try {
    const report = generateTherapistReport(userState, 30);
    const text = formatReportAsText(report, language);
    
    const result = await Share.share({
      message: text,
      title: language === 'sv' ? 'ANDAS Terapeutrapport' : 'ANDAS Therapist Report',
    });
    
    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Failed to share report:', error);
    return false;
  }
}
