// ============================================
// ANDAS - PROGRESS SCREEN (Weekly Summary)
// ============================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Svg, Rect, Text as SvgText, Line } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../data/constants';
import { useUserState } from '../state/userState';
import { useTranslation, interpolate } from '../i18n';
import { getExerciseById } from '../data/exercises';
import { SessionRecord } from '../data/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2;
const CHART_HEIGHT = 120;
const BAR_WIDTH = (CHART_WIDTH - 60) / 7;

function getWeekDates(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

function getSessionsForDay(sessions: SessionRecord[], date: Date): SessionRecord[] {
  return sessions.filter(s => isSameDay(new Date(s.timestamp), date));
}

function calculateStreak(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;
  const sorted = [...sessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const hasSessionToday = sorted.some(s => isSameDay(new Date(s.timestamp), currentDate));
  if (!hasSessionToday) {
    currentDate.setDate(currentDate.getDate() - 1);
    const hasSessionYesterday = sorted.some(s => isSameDay(new Date(s.timestamp), currentDate));
    if (!hasSessionYesterday) return 0;
  }
  while (true) {
    const hasSession = sorted.some(s => isSameDay(new Date(s.timestamp), currentDate));
    if (hasSession) { streak++; currentDate.setDate(currentDate.getDate() - 1); } 
    else break;
  }
  return streak;
}

function getMostUsedExercise(sessions: SessionRecord[]): string | null {
  if (sessions.length === 0) return null;
  const counts: Record<string, number> = {};
  sessions.forEach(s => { counts[s.exerciseId] = (counts[s.exerciseId] || 0) + 1; });
  let maxCount = 0;
  let mostUsed: string | null = null;
  Object.entries(counts).forEach(([id, count]) => { if (count > maxCount) { maxCount = count; mostUsed = id; } });
  return mostUsed;
}

function generateInsights(sessions: SessionRecord[], weekSessions: SessionRecord[], t: any): string[] {
  const insights: string[] = [];
  const mostUsed = getMostUsedExercise(sessions);
  if (mostUsed) {
    const recentWithExercise = sessions.filter(s => s.exerciseId === mostUsed).slice(0, 10);
    const positiveCount = recentWithExercise.filter(s => s.feedback === 'calmer').length;
    if (positiveCount >= 7) {
      const exercise = getExerciseById(mostUsed);
      if (exercise) insights.push(interpolate(t.progress.insights.improving, { exercise: exercise.name }));
    }
  }
  const streak = calculateStreak(sessions);
  if (streak >= 3) insights.push(t.progress.insights.consistent);
  const usedExercises = new Set(sessions.map(s => s.exerciseId));
  const suggestions = ['box', 'coherent', 'soft-focus'].filter(id => !usedExercises.has(id));
  if (suggestions.length > 0 && weekSessions.length >= 3) {
    const exercise = getExerciseById(suggestions[0]);
    if (exercise) insights.push(interpolate(t.progress.insights.tryNew, { exercise: exercise.name }));
  }
  const avgDuration = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0) / (weekSessions.length || 1);
  if (avgDuration < 4 && weekSessions.length >= 3) insights.push(t.progress.insights.moreTime);
  return insights.slice(0, 3);
}

interface WeeklyChartProps { data: number[]; labels: string[]; maxValue: number; color: string; }

function WeeklyChart({ data, labels, maxValue, color }: WeeklyChartProps) {
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;
  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 30}>
      <Line x1={30} y1={CHART_HEIGHT} x2={CHART_WIDTH} y2={CHART_HEIGHT} stroke={colors.text.muted} strokeWidth={1} strokeOpacity={0.3} />
      <Line x1={30} y1={CHART_HEIGHT / 2} x2={CHART_WIDTH} y2={CHART_HEIGHT / 2} stroke={colors.text.muted} strokeWidth={1} strokeOpacity={0.2} strokeDasharray="4,4" />
      {data.map((value, index) => {
        const barHeight = maxValue > 0 ? (value / maxValue) * (CHART_HEIGHT - 10) : 0;
        const x = 40 + index * BAR_WIDTH + BAR_WIDTH * 0.1;
        const y = CHART_HEIGHT - barHeight;
        const isToday = index === todayIndex;
        return (
          <React.Fragment key={index}>
            <Rect x={x} y={y} width={BAR_WIDTH * 0.8} height={barHeight} rx={4} fill={isToday ? color : colors.accent.sageLight} opacity={isToday ? 1 : 0.6} />
            <SvgText x={x + BAR_WIDTH * 0.4} y={CHART_HEIGHT + 18} fontSize={10} fill={isToday ? colors.text.primary : colors.text.muted} textAnchor="middle" fontWeight={isToday ? '600' : '400'}>{labels[index]}</SvgText>
          </React.Fragment>
        );
      })}
      <SvgText x={25} y={15} fontSize={10} fill={colors.text.muted} textAnchor="end">{maxValue}</SvgText>
      <SvgText x={25} y={CHART_HEIGHT / 2 + 4} fontSize={10} fill={colors.text.muted} textAnchor="end">{Math.round(maxValue / 2)}</SvgText>
      <SvgText x={25} y={CHART_HEIGHT} fontSize={10} fill={colors.text.muted} textAnchor="end">0</SvgText>
    </Svg>
  );
}

function StatCard({ label, value, subValue }: { label: string; value: string | number; subValue?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
    </View>
  );
}

export function ProgressScreen() {
  const { userState } = useUserState();
  const { t } = useTranslation();
  const weekDates = useMemo(() => getWeekDates(), []);
  const weekSessions = useMemo(() => {
    const startOfWeek = weekDates[0];
    return userState.sessionHistory.filter(s => new Date(s.timestamp) >= startOfWeek);
  }, [userState.sessionHistory, weekDates]);
  const dailySessionCounts = useMemo(() => weekDates.map(date => getSessionsForDay(userState.sessionHistory, date).length), [userState.sessionHistory, weekDates]);
  const dailyMinutes = useMemo(() => weekDates.map(date => { const daySessions = getSessionsForDay(userState.sessionHistory, date); return daySessions.reduce((sum, s) => sum + s.durationMinutes, 0); }), [userState.sessionHistory, weekDates]);
  const dayLabels = [t.progress.chart.mon, t.progress.chart.tue, t.progress.chart.wed, t.progress.chart.thu, t.progress.chart.fri, t.progress.chart.sat, t.progress.chart.sun];
  const totalSessions = weekSessions.length;
  const totalMinutes = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const avgDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const streak = calculateStreak(userState.sessionHistory);
  const mostUsedId = getMostUsedExercise(weekSessions);
  const mostUsedExercise = mostUsedId ? getExerciseById(mostUsedId) : null;
  const insights = useMemo(() => generateInsights(userState.sessionHistory, weekSessions, t), [userState.sessionHistory, weekSessions, t]);
  const maxSessions = Math.max(...dailySessionCounts, 3);
  const maxMinutes = Math.max(...dailyMinutes, 15);
  const hasData = userState.sessionHistory.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t.progress.title}</Text>
        </View>
        {!hasData ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t.progress.noData}</Text>
            <Text style={styles.emptySubtext}>{t.progress.noDataSubtext}</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard label={t.progress.totalSessions} value={totalSessions} subValue={t.progress.thisWeek} />
              <StatCard label={t.progress.totalMinutes} value={totalMinutes} />
              <StatCard label={t.progress.averageDuration} value={`${avgDuration} min`} />
              <StatCard label={t.progress.mostUsed} value={mostUsedExercise?.name || '-'} />
            </View>
            {streak > 0 && (
              <View style={styles.streakCard}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{interpolate(t.progress.streak.current, { count: streak.toString() })}</Text>
              </View>
            )}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t.progress.chart.sessions}</Text>
              <WeeklyChart data={dailySessionCounts} labels={dayLabels} maxValue={maxSessions} color={colors.accent.sage} />
            </View>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t.progress.chart.minutes}</Text>
              <WeeklyChart data={dailyMinutes} labels={dayLabels} maxValue={maxMinutes} color={colors.category.fokus} />
            </View>
            {insights.length > 0 && (
              <View style={styles.insightsCard}>
                <Text style={styles.insightsTitle}>{t.progress.insights.title}</Text>
                {insights.map((insight, index) => (
                  <View key={index} style={styles.insightRow}>
                    <Text style={styles.insightBullet}>💡</Text>
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  header: { marginBottom: spacing.xl },
  title: { fontSize: typography.size['2xl'], fontWeight: typography.weight.medium, color: colors.text.primary },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['3xl'] },
  emptyTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.medium, color: colors.text.secondary, marginBottom: spacing.sm },
  emptySubtext: { fontSize: typography.size.base, color: colors.text.muted, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: colors.surface.elevated, borderRadius: radius.lg, padding: spacing.md },
  statLabel: { fontSize: typography.size.xs, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  statValue: { fontSize: typography.size.xl, fontWeight: typography.weight.semibold, color: colors.text.primary },
  statSubValue: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 2 },
  streakCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.functional.safetyBg, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.xl },
  streakEmoji: { fontSize: 24, marginRight: spacing.sm },
  streakText: { fontSize: typography.size.base, fontWeight: typography.weight.medium, color: colors.text.primary },
  chartCard: { backgroundColor: colors.surface.elevated, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  chartTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.text.secondary, marginBottom: spacing.md },
  insightsCard: { backgroundColor: colors.surface.elevated, borderRadius: radius.lg, padding: spacing.md },
  insightsTitle: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.text.secondary, marginBottom: spacing.md },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  insightBullet: { fontSize: 14, marginRight: spacing.sm },
  insightText: { flex: 1, fontSize: typography.size.sm, color: colors.text.primary, lineHeight: 20 },
});
