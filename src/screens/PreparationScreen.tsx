// ============================================
// ANDAS - PREPARATION SCREEN
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, typography, spacing, radius, shadow } from '../data/constants';
import { getExerciseById } from '../data/exercises';
import { useUserState } from '../state/userState';
import { checkExerciseSafety, getRecommendedDuration } from '../safety';
import { SafetyBadge } from '../components';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Preparation'>;
  route: RouteProp<RootStackParamList, 'Preparation'>;
};

function BackIcon({ size = 20, color = colors.text.tertiary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M15 18l-6-6 6-6" strokeLinecap="round" />
    </Svg>
  );
}

function ShieldIcon({ size = 18, color = colors.accent.sage }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

export function PreparationScreen({ navigation, route }: Props) {
  const { exerciseId } = route.params;
  const { userState } = useUserState();

  const exercise = getExerciseById(exerciseId);
  if (!exercise) {
    navigation.goBack();
    return null;
  }

  const safetyResult = checkExerciseSafety(exercise, userState);
  const pattern = safetyResult.adaptedPattern || exercise.pattern;
  const duration = getRecommendedDuration(exercise, userState);
  const cycleLength = pattern.inhale + pattern.holdIn + pattern.exhale + pattern.holdOut;

  const isAdapted = safetyResult.adaptedPattern !== null;

  const handleStart = () => {
    navigation.navigate('Session', {
      exerciseId,
      pattern,
      durationMinutes: duration.minutes || 3,
      durationRounds: duration.rounds,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <BackIcon />
        <Text style={styles.backText}>Tillbaka</Text>
      </TouchableOpacity>

      {/* Exercise info */}
      <View style={styles.header}>
        <Text style={styles.title}>{exercise.name}</Text>
        {isAdapted && (
          <View style={styles.badgeContainer}>
            <SafetyBadge reason={safetyResult.reason} />
          </View>
        )}
        <Text style={styles.description}>{exercise.description}</Text>
      </View>

      {/* Pattern display */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Andningsmönster</Text>
        <View style={styles.patternContainer}>
          {[
            { label: 'In', value: pattern.inhale, color: colors.breath.inhale },
            pattern.holdIn > 0 && { label: 'Håll', value: pattern.holdIn, color: colors.breath.hold },
            { label: 'Ut', value: pattern.exhale, color: colors.breath.exhale },
            pattern.holdOut > 0 && { label: 'Håll', value: pattern.holdOut, color: colors.breath.hold },
          ]
            .filter(Boolean)
            .map((p, i) => (
              <View key={i} style={styles.patternItem}>
                <View style={[styles.patternCircle, { borderColor: `${p!.color}40`, backgroundColor: `${p!.color}15` }]}>
                  <Text style={[styles.patternValue, { color: p!.color }]}>{p!.value}</Text>
                </View>
                <Text style={styles.patternLabel}>{p!.label}</Text>
              </View>
            ))}
        </View>
        <Text style={styles.cycleLength}>{cycleLength}s per cykel</Text>
      </View>

      {/* Duration */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Längd</Text>
        <Text style={styles.durationValue}>
          {duration.rounds ? `${duration.rounds} cykler` : `${duration.minutes} minuter`}
        </Text>
        <Text style={styles.durationSubtext}>Anpassad för dig</Text>
      </View>

      {/* Safety note */}
      <View style={styles.safetyNote}>
        <ShieldIcon />
        <Text style={styles.safetyText}>Avbryt när som helst om något känns fel.</Text>
      </View>

      {/* Start button */}
      <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
        <Text style={styles.startButtonText}>Börja</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    padding: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  backText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  badgeContainer: {
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    maxWidth: 300,
  },
  card: {
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  cardTitle: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  patternContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  patternItem: {
    alignItems: 'center',
  },
  patternCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  patternValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  patternLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
  },
  cycleLength: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  durationValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  durationSubtext: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.functional.safetyBg,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
  },
  safetyText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  startButton: {
    backgroundColor: colors.accent.sage,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: 'auto',
    ...shadow.lg,
  },
  startButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: colors.text.inverse,
  },
});
