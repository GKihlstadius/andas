// ============================================
// ANDAS - THERAPIST REPORT GENERATION
// ============================================
// Creates a shareable report for therapists/coaches
// Privacy-first: user controls what is shared

import { Share, Platform } from 'react-native';
import { UserState, SessionRecord, SessionFeedback } from '../data/types';
import { getExerciseById } from '../data/exercises';

// ============================================
// TYPES
// ============================================

export interface TherapistReport {
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  summary: ReportSummary;
  patterns: ReportPatterns;
  recommendations: string[];
  rawText: string;
}

export interface ReportSummary {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  mostUsedExercises: { name: string; count: number }[];
  feedbackDistribution: {
    calmer: number;
    same: number;
    moreActivated: number;
    noFeedback: number;
  };
  completionRate: number; // % of sessions completed (not early exit)
}

export interface ReportPatterns {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'varied';
  sessionFrequency: 'daily' | 'several-per-week' | 'weekly' | 'sporadic';
  progressTrend: 'improving' | 'stable' | 'needs-attention' | 'insufficient-data';
  consistencyScore: number; // 1-10
}

// ============================================
// REPORT GENERATION
// ============================================

export function generateTherapistReport(
  userState: UserState,
  daysBack: number = 30,
  language: 'sv' | 'en' = 'sv'
): TherapistReport {
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - daysBack);

  // Filter sessions in period
  const sessions = userState.sessionHistory.filter(s => {
    const sessionDate = new Date(s.timestamp);
    return sessionDate >= periodStart && sessionDate <= now;
  });

  const summary = generateSummary(sessions);
  const patterns = analyzePatterns(sessions, daysBack);
  const recommendations = generateRecommendations(userState, summary, patterns, language);

  const rawText = formatReportAsText(
    userState,
    summary,
    patterns,
    recommendations,
    periodStart,
    now,
    language
  );

  return {
    generatedAt: now.toISOString(),
    periodStart: periodStart.toISOString(),
    periodEnd: now.toISOString(),
    summary,
    patterns,
    recommendations,
    rawText,
  };
}

function generateSummary(sessions: SessionRecord[]): ReportSummary {
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  // Most used exercises
  const exerciseCounts: Record<string, number> = {};
  sessions.forEach(s => {
    exerciseCounts[s.exerciseId] = (exerciseCounts[s.exerciseId] || 0) + 1;
  });

  const mostUsedExercises = Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => ({
      name: getExerciseById(id)?.name || id,
      count,
    }));

  // Feedback distribution
  const feedbackDistribution = {
    calmer: sessions.filter(s => s.feedback === 'calmer').length,
    same: sessions.filter(s => s.feedback === 'same').length,
    moreActivated: sessions.filter(s => s.feedback === 'moreActivated').length,
    noFeedback: sessions.filter(s => s.feedback === null).length,
  };

  // Completion rate
  const completedSessions = sessions.filter(s => !s.wasEarlyExit).length;
  const completionRate = totalSessions > 0 
    ? Math.round((completedSessions / totalSessions) * 100) 
    : 0;

  return {
    totalSessions,
    totalMinutes,
    averageSessionLength,
    mostUsedExercises,
    feedbackDistribution,
    completionRate,
  };
}

function analyzePatterns(sessions: SessionRecord[], daysBack: number): ReportPatterns {
  // Time of day preference
  const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  sessions.forEach(s => {
    const hour = new Date(s.timestamp).getHours();
    if (hour >= 5 && hour < 12) timeDistribution.morning++;
    else if (hour >= 12 && hour < 17) timeDistribution.afternoon++;
    else if (hour >= 17 && hour < 21) timeDistribution.evening++;
    else timeDistribution.night++;
  });

  const maxTime = Math.max(...Object.values(timeDistribution));
  const timeEntries = Object.entries(timeDistribution) as [keyof typeof timeDistribution, number][];
  const dominantTime = timeEntries.find(([_, count]) => count === maxTime)?.[0] || 'varied';
  const preferredTimeOfDay: ReportPatterns['preferredTimeOfDay'] = 
    maxTime > sessions.length * 0.5 ? dominantTime : 'varied';

  // Session frequency
  const uniqueDays = new Set(
    sessions.map(s => new Date(s.timestamp).toDateString())
  ).size;
  
  let sessionFrequency: ReportPatterns['sessionFrequency'];
  const avgPerWeek = (uniqueDays / daysBack) * 7;
  if (avgPerWeek >= 5) sessionFrequency = 'daily';
  else if (avgPerWeek >= 3) sessionFrequency = 'several-per-week';
  else if (avgPerWeek >= 1) sessionFrequency = 'weekly';
  else sessionFrequency = 'sporadic';

  // Progress trend
  let progressTrend: ReportPatterns['progressTrend'];
  if (sessions.length < 5) {
    progressTrend = 'insufficient-data';
  } else {
    const recentHalf = sessions.slice(0, Math.floor(sessions.length / 2));
    const olderHalf = sessions.slice(Math.floor(sessions.length / 2));
    
    const recentPositive = recentHalf.filter(s => s.feedback === 'calmer').length / recentHalf.length;
    const olderPositive = olderHalf.filter(s => s.feedback === 'calmer').length / olderHalf.length;
    
    const recentNegative = recentHalf.filter(s => s.feedback === 'moreActivated' || s.wasEarlyExit).length / recentHalf.length;
    
    if (recentPositive > olderPositive + 0.1) progressTrend = 'improving';
    else if (recentNegative > 0.3) progressTrend = 'needs-attention';
    else progressTrend = 'stable';
  }

  // Consistency score (1-10)
  let consistencyScore = 5;
  if (sessionFrequency === 'daily') consistencyScore += 3;
  else if (sessionFrequency === 'several-per-week') consistencyScore += 2;
  else if (sessionFrequency === 'weekly') consistencyScore += 1;
  else consistencyScore -= 2;

  if (sessions.length > 0) {
    const completionRate = sessions.filter(s => !s.wasEarlyExit).length / sessions.length;
    consistencyScore += Math.round(completionRate * 2);
  }

  consistencyScore = Math.max(1, Math.min(10, consistencyScore));

  return {
    preferredTimeOfDay,
    sessionFrequency,
    progressTrend,
    consistencyScore,
  };
}

function generateRecommendations(
  userState: UserState,
  summary: ReportSummary,
  patterns: ReportPatterns,
  language: 'sv' | 'en'
): string[] {
  const recommendations: string[] = [];

  const texts = language === 'sv' ? {
    moreFrequent: 'Överväg att öka frekvensen av sessioner för djupare effekt.',
    longerSessions: 'Längre sessioner (5+ minuter) ger ofta bättre resultat för nedreglering.',
    earlyExits: 'Hög andel avslutade sessioner tidigt - överväg kortare sessioner eller mjukare övningar.',
    needsAttention: 'Vissa sessioner visar ökad aktivering - utvärdera övningsval och timing.',
    greatProgress: 'Positiv utveckling! Fortsätt med nuvarande rutin.',
    tryVariety: 'Prova att variera övningarna för bredare effekt.',
    morningRecommend: 'Morgonsessioner kan ge bättre start på dagen.',
    eveningRecommend: 'Kvällssessioner kan förbättra sömnkvalitet.',
  } : {
    moreFrequent: 'Consider increasing session frequency for deeper effect.',
    longerSessions: 'Longer sessions (5+ minutes) often provide better results for down-regulation.',
    earlyExits: 'High rate of early exits - consider shorter sessions or gentler exercises.',
    needsAttention: 'Some sessions show increased activation - evaluate exercise choice and timing.',
    greatProgress: 'Positive progress! Continue with current routine.',
    tryVariety: 'Try varying exercises for broader effect.',
    morningRecommend: 'Morning sessions may provide a better start to the day.',
    eveningRecommend: 'Evening sessions may improve sleep quality.',
  };

  if (patterns.sessionFrequency === 'sporadic' || patterns.sessionFrequency === 'weekly') {
    recommendations.push(texts.moreFrequent);
  }

  if (summary.averageSessionLength < 4 && summary.totalSessions > 3) {
    recommendations.push(texts.longerSessions);
  }

  if (summary.completionRate < 70 && summary.totalSessions > 5) {
    recommendations.push(texts.earlyExits);
  }

  if (patterns.progressTrend === 'needs-attention') {
    recommendations.push(texts.needsAttention);
  } else if (patterns.progressTrend === 'improving') {
    recommendations.push(texts.greatProgress);
  }

  if (summary.mostUsedExercises.length === 1 && summary.totalSessions > 5) {
    recommendations.push(texts.tryVariety);
  }

  return recommendations.slice(0, 4);
}

function formatReportAsText(
  userState: UserState,
  summary: ReportSummary,
  patterns: ReportPatterns,
  recommendations: string[],
  periodStart: Date,
  periodEnd: Date,
  language: 'sv' | 'en'
): string {
  const formatDate = (d: Date) => d.toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US');

  const sv = language === 'sv';

  const lines: string[] = [
    '═══════════════════════════════════════',
    sv ? '       ANDAS - TERAPEUTRAPPORT' : '       ANDAS - THERAPIST REPORT',
    '═══════════════════════════════════════',
    '',
    sv ? `Period: ${formatDate(periodStart)} - ${formatDate(periodEnd)}` 
       : `Period: ${formatDate(periodStart)} - ${formatDate(periodEnd)}`,
    sv ? `Genererad: ${formatDate(new Date())}` 
       : `Generated: ${formatDate(new Date())}`,
    '',
    '───────────────────────────────────────',
    sv ? 'SAMMANFATTNING' : 'SUMMARY',
    '───────────────────────────────────────',
    '',
    sv ? `Totalt antal sessioner: ${summary.totalSessions}` 
       : `Total sessions: ${summary.totalSessions}`,
    sv ? `Total tid: ${summary.totalMinutes} minuter` 
       : `Total time: ${summary.totalMinutes} minutes`,
    sv ? `Genomsnittlig längd: ${summary.averageSessionLength} min/session` 
       : `Average length: ${summary.averageSessionLength} min/session`,
    sv ? `Genomförandegrad: ${summary.completionRate}%` 
       : `Completion rate: ${summary.completionRate}%`,
    '',
    sv ? 'Mest använda övningar:' : 'Most used exercises:',
    ...summary.mostUsedExercises.map((e, i) => `  ${i + 1}. ${e.name} (${e.count}x)`),
    '',
    sv ? 'Feedback-fördelning:' : 'Feedback distribution:',
    sv ? `  • Lugnare: ${summary.feedbackDistribution.calmer}` 
       : `  • Calmer: ${summary.feedbackDistribution.calmer}`,
    sv ? `  • Samma: ${summary.feedbackDistribution.same}` 
       : `  • Same: ${summary.feedbackDistribution.same}`,
    sv ? `  • Mer aktiverad: ${summary.feedbackDistribution.moreActivated}` 
       : `  • More activated: ${summary.feedbackDistribution.moreActivated}`,
    '',
    '───────────────────────────────────────',
    sv ? 'MÖNSTER' : 'PATTERNS',
    '───────────────────────────────────────',
    '',
    sv ? `Föredragen tid: ${translateTimeOfDay(patterns.preferredTimeOfDay, sv)}` 
       : `Preferred time: ${translateTimeOfDay(patterns.preferredTimeOfDay, sv)}`,
    sv ? `Frekvens: ${translateFrequency(patterns.sessionFrequency, sv)}` 
       : `Frequency: ${translateFrequency(patterns.sessionFrequency, sv)}`,
    sv ? `Trend: ${translateTrend(patterns.progressTrend, sv)}` 
       : `Trend: ${translateTrend(patterns.progressTrend, sv)}`,
    sv ? `Konsistenspoäng: ${patterns.consistencyScore}/10` 
       : `Consistency score: ${patterns.consistencyScore}/10`,
    '',
    '───────────────────────────────────────',
    sv ? 'ANVÄNDARENS PROFIL' : 'USER PROFILE',
    '───────────────────────────────────────',
    '',
    sv ? `Baseline: ${userState.baseline}` : `Baseline: ${userState.baseline}`,
    sv ? `Känslighet: ${userState.sensitivity}` : `Sensitivity: ${userState.sensitivity}`,
    sv ? `Undviker anhåll: ${userState.contraindications.breathHolds ? 'Ja' : 'Nej'}` 
       : `Avoids breath holds: ${userState.contraindications.breathHolds ? 'Yes' : 'No'}`,
    sv ? `Undviker snabb andning: ${userState.contraindications.fastBreathing ? 'Ja' : 'Nej'}` 
       : `Avoids fast breathing: ${userState.contraindications.fastBreathing ? 'Yes' : 'No'}`,
    '',
  ];

  if (recommendations.length > 0) {
    lines.push('───────────────────────────────────────');
    lines.push(sv ? 'REKOMMENDATIONER' : 'RECOMMENDATIONS');
    lines.push('───────────────────────────────────────');
    lines.push('');
    recommendations.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    lines.push('');
  }

  lines.push('═══════════════════════════════════════');
  lines.push(sv ? 'Genererad av ANDAS - Trygg breathwork' : 'Generated by ANDAS - Safe breathwork');
  lines.push('═══════════════════════════════════════');

  return lines.join('\n');
}

function translateTimeOfDay(time: ReportPatterns['preferredTimeOfDay'], sv: boolean): string {
  const translations: Record<ReportPatterns['preferredTimeOfDay'], [string, string]> = {
    morning: ['Morgon', 'Morning'],
    afternoon: ['Eftermiddag', 'Afternoon'],
    evening: ['Kväll', 'Evening'],
    night: ['Natt', 'Night'],
    varied: ['Varierat', 'Varied'],
  };
  return translations[time][sv ? 0 : 1];
}

function translateFrequency(freq: ReportPatterns['sessionFrequency'], sv: boolean): string {
  const translations: Record<ReportPatterns['sessionFrequency'], [string, string]> = {
    daily: ['Dagligen', 'Daily'],
    'several-per-week': ['Flera gånger per vecka', 'Several times per week'],
    weekly: ['Veckovis', 'Weekly'],
    sporadic: ['Sporadiskt', 'Sporadic'],
  };
  return translations[freq][sv ? 0 : 1];
}

function translateTrend(trend: ReportPatterns['progressTrend'], sv: boolean): string {
  const translations: Record<ReportPatterns['progressTrend'], [string, string]> = {
    improving: ['Förbättras', 'Improving'],
    stable: ['Stabil', 'Stable'],
    'needs-attention': ['Behöver uppmärksamhet', 'Needs attention'],
    'insufficient-data': ['Otillräcklig data', 'Insufficient data'],
  };
  return translations[trend][sv ? 0 : 1];
}

// ============================================
// SHARE REPORT
// ============================================

export async function shareTherapistReport(report: TherapistReport): Promise<boolean> {
  try {
    const result = await Share.share({
      message: report.rawText,
      title: 'ANDAS - Therapist Report',
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Failed to share report:', error);
    return false;
  }
}
