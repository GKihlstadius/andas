// ============================================
// ANDAS - BREATHING CIRCLE COMPONENT
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BreathPhase } from '../data/types';
import { colors, typography, spacing } from '../data/constants';

interface BreathingCircleProps {
  phase: BreathPhase;
  progress: number;
  phaseTime: number;
  color?: string;
}

const PHASE_LABELS: Record<BreathPhase, string> = {
  ready: 'Redo',
  countdown: '',
  inhale: 'Andas in',
  holdIn: 'Håll',
  exhale: 'Andas ut',
  holdOut: 'Håll',
  complete: 'Klar',
};

export function BreathingCircle({ phase, progress, phaseTime, color }: BreathingCircleProps) {
  const accentColor = color || colors.accent.sage;

  const getScale = (): number => {
    if (phase === 'ready' || phase === 'countdown') return 0.65;
    if (phase === 'complete') return 0.65;
    
    switch (phase) {
      case 'inhale':
        return 0.65 + progress * 0.35;
      case 'holdIn':
        return 1;
      case 'exhale':
        return 1 - progress * 0.35;
      case 'holdOut':
        return 0.65;
      default:
        return 0.65;
    }
  };

  const scale = getScale();

  const outerGlowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(scale * 1.3, {
          duration: 100,
          easing: Easing.linear,
        }),
      },
    ],
  }));

  const innerRingStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(scale * 1.1, {
          duration: 100,
          easing: Easing.linear,
        }),
      },
    ],
  }));

  const mainCircleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(scale, {
          duration: 100,
          easing: Easing.linear,
        }),
      },
    ],
  }));

  const showCountdown = phase === 'countdown' || 
    (['inhale', 'holdIn', 'exhale', 'holdOut'].includes(phase) && phaseTime > 0);

  return (
    <View style={styles.container}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.outerGlow,
          outerGlowStyle,
          { backgroundColor: `${accentColor}15` },
        ]}
      />
      
      {/* Inner ring */}
      <Animated.View
        style={[
          styles.innerRing,
          innerRingStyle,
          { borderColor: `${accentColor}20` },
        ]}
      />
      
      {/* Main circle */}
      <Animated.View
        style={[
          styles.mainCircle,
          mainCircleStyle,
          {
            backgroundColor: `${accentColor}20`,
            borderColor: `${accentColor}50`,
          },
        ]}
      >
        <Text style={[styles.phaseLabel, { color: colors.text.primary }]}>
          {PHASE_LABELS[phase]}
        </Text>
        
        {showCountdown && (
          <Text style={[styles.countdown, { color: accentColor }]}>
            {Math.ceil(phaseTime)}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  innerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
  },
  mainCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  countdown: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.normal,
  },
});
