// ============================================
// ANDAS - EXERCISE CARD COMPONENT
// ============================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { Exercise, SafetyCheckResult } from '../data/types';
import { colors, typography, spacing, radius, shadow } from '../data/constants';
import { SafetyBadge } from './SafetyBadge';
import { getExerciseById } from '../data/exercises';

interface ExerciseCardProps {
  exercise: Exercise;
  safetyResult: SafetyCheckResult;
  onPress: () => void;
  recommended?: boolean;
}

function BreathIcon({ size = 22, color = colors.text.tertiary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M2 12c2-3 4-4 6-4s4 4 6 4 4-1 6-4" strokeLinecap="round" />
      <Path d="M2 17c2-3 4-4 6-4s4 4 6 4 4-1 6-4" strokeLinecap="round" opacity={0.5} />
    </Svg>
  );
}

function ChevronRight({ size = 18, color = colors.text.muted }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M9 18l6-6-6-6" strokeLinecap="round" />
    </Svg>
  );
}

export function ExerciseCard({ exercise, safetyResult, onPress, recommended }: ExerciseCardProps) {
  const isBlocked = !safetyResult.allowed;
  const isAdapted = safetyResult.adaptedPattern !== null;

  // If blocked, show alternative hint
  if (isBlocked && safetyResult.alternativeId) {
    const alternative = getExerciseById(safetyResult.alternativeId);
    
    return (
      <View style={styles.blockedContainer}>
        <Text style={styles.blockedTitle}>{exercise.name}</Text>
        <Text style={styles.blockedText}>
          Ej tillgänglig just nu
          {alternative && ` – prova ${alternative.name} istället`}
        </Text>
      </View>
    );
  }

  if (isBlocked) return null;

  const categoryColor = colors.category[exercise.category];

  if (recommended) {
    return (
      <TouchableOpacity style={styles.recommendedContainer} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.recommendedLabel}>Rekommenderat för dig</Text>
        <Text style={styles.recommendedTitle}>{exercise.name}</Text>
        <Text style={styles.recommendedDescription}>{exercise.shortDescription}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
        <BreathIcon color={categoryColor} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{exercise.name}</Text>
          {isAdapted && <SafetyBadge reason={safetyResult.reason} />}
        </View>
        <Text style={styles.description}>{exercise.shortDescription}</Text>
      </View>
      
      <ChevronRight />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.lg,
    gap: spacing.md,
    ...shadow.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  blockedContainer: {
    padding: spacing.lg,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    opacity: 0.6,
  },
  blockedTitle: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
  blockedText: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  recommendedContainer: {
    padding: spacing.lg,
    backgroundColor: colors.accent.sage,
    borderRadius: radius.xl,
    ...shadow.lg,
  },
  recommendedLabel: {
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  recommendedTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.medium,
    color: colors.text.inverse,
  },
  recommendedDescription: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
});
