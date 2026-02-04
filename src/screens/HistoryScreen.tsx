// ANDAS - HISTORY SCREEN
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { colors, typography, spacing, radius } from '../data/constants';
import { useUserState } from '../state/userState';
import { useTranslation, interpolate } from '../i18n';
import { getExerciseById } from '../data/exercises';
import { SessionRecord, SessionFeedback } from '../data/types';

function isSameDay(d1: Date, d2: Date): boolean { return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); }
function isYesterday(date: Date): boolean { const y = new Date(); y.setDate(y.getDate() - 1); return isSameDay(date, y); }
function isThisWeek(date: Date): boolean { const w = new Date(); w.setDate(w.getDate() - 7); return date >= w; }

function groupSessions(sessions: SessionRecord[], t: any) {
  const today = new Date();
  const groups: { title: string; sessions: SessionRecord[] }[] = [
    { title: t.history.today, sessions: [] },
    { title: t.history.yesterday, sessions: [] },
    { title: t.history.thisWeek, sessions: [] },
    { title: t.history.earlier, sessions: [] },
  ];
  sessions.forEach(s => {
    const d = new Date(s.timestamp);
    if (isSameDay(d, today)) groups[0].sessions.push(s);
    else if (isYesterday(d)) groups[1].sessions.push(s);
    else if (isThisWeek(d)) groups[2].sessions.push(s);
    else groups[3].sessions.push(s);
  });
  return groups.filter(g => g.sessions.length > 0);
}

function SessionCard({ session, t }: { session: SessionRecord; t: any }) {
  const exercise = getExerciseById(session.exerciseId);
  const time = new Date(session.timestamp).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  const emoji = session.feedback === 'calmer' ? '😌' : session.feedback === 'same' ? '😐' : session.feedback === 'moreActivated' ? '😰' : '➖';
  const feedbackText = session.feedback === 'calmer' ? t.history.session.feedback.calmer : session.feedback === 'same' ? t.history.session.feedback.same : session.feedback === 'moreActivated' ? t.history.session.feedback.moreActivated : '';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View><Text style={styles.exerciseName}>{exercise?.name || session.exerciseId}</Text><Text style={styles.time}>{time}</Text></View>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.detail}>{interpolate(t.history.session.duration, { minutes: session.durationMinutes })}</Text>
        <Text style={styles.detailDot}>•</Text>
        <Text style={styles.detail}>{interpolate(t.history.session.cycles, { count: session.completedCycles })}</Text>
        {session.wasEarlyExit && <><Text style={styles.detailDot}>•</Text><Text style={styles.earlyExit}>{t.history.session.earlyExit}</Text></>}
      </View>
      {feedbackText && <Text style={styles.feedbackText}>{feedbackText}</Text>}
    </View>
  );
}

export function HistoryScreen() {
  const { userState } = useUserState();
  const { t } = useTranslation();
  const groups = useMemo(() => groupSessions(userState.sessionHistory, t), [userState.sessionHistory, t]);
  const hasData = userState.sessionHistory.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t.history.title}</Text>
        {!hasData ? (
          <View style={styles.empty}><Text style={styles.emptyTitle}>{t.history.empty}</Text><Text style={styles.emptySubtext}>{t.history.emptySubtext}</Text></View>
        ) : (
          groups.map(group => (
            <View key={group.title} style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.sessions.map(s => <SessionCard key={s.id} session={s} t={t} />)}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  title: { fontSize: typography.size['2xl'], fontWeight: typography.weight.medium, color: colors.text.primary, marginBottom: spacing.xl },
  empty: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.medium, color: colors.text.secondary, marginBottom: spacing.sm },
  emptySubtext: { fontSize: typography.size.base, color: colors.text.muted },
  group: { marginBottom: spacing.xl },
  groupTitle: { fontSize: typography.size.xs, fontWeight: typography.weight.medium, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface.elevated, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  exerciseName: { fontSize: typography.size.base, fontWeight: typography.weight.medium, color: colors.text.primary },
  time: { fontSize: typography.size.sm, color: colors.text.muted, marginTop: 2 },
  emoji: { fontSize: 20 },
  cardDetails: { flexDirection: 'row', alignItems: 'center' },
  detail: { fontSize: typography.size.sm, color: colors.text.secondary },
  detailDot: { fontSize: typography.size.sm, color: colors.text.muted, marginHorizontal: spacing.xs },
  earlyExit: { fontSize: typography.size.sm, color: '#D9534F' },
  feedbackText: { fontSize: typography.size.sm, color: colors.text.tertiary, marginTop: spacing.xs },
});
