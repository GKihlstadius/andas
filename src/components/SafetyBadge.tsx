// ============================================
// ANDAS - SAFETY BADGE COMPONENT
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../data/constants';

interface SafetyBadgeProps {
  reason: string | null;
}

const MESSAGES: Record<string, string> = {
  adaptedPattern: 'Anpassad för dig',
  adaptedForSensitivity: 'Mjukare tempo',
  adaptedForRecovery: 'Reducerad intensitet',
};

function ShieldIcon({ size = 14, color = colors.accent.sage }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

export function SafetyBadge({ reason }: SafetyBadgeProps) {
  if (!reason || !MESSAGES[reason]) return null;

  return (
    <View style={styles.container}>
      <ShieldIcon />
      <Text style={styles.text}>{MESSAGES[reason]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.functional.safetyBg,
    borderRadius: radius.sm,
  },
  text: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
  },
});
