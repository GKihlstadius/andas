// ============================================
// ANDAS - SESSION SCREEN
// ============================================

import React, { useEffect, useRef } from 'react';
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
import { useBreathEngine } from '../breathing';
import { BreathingCircle } from '../components';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Session'>;
  route: RouteProp<RootStackParamList, 'Session'>;
};

function CloseIcon({ size = 20, color = colors.text.secondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </Svg>
  );
}

export function SessionScreen({ navigation, route }: Props) {
  const { exerciseId, pattern, durationMinutes, durationRounds } = route.params;
  const exercise = getExerciseById(exerciseId);
  const cyclesRef = useRef(0);

  // Calculate duration in seconds
  const cycleLength = pattern.inhale + pattern.holdIn + pattern.exhale + pattern.holdOut;
  const durationSeconds = durationRounds
    ? durationRounds * cycleLength
    : durationMinutes * 60;

  const { state, start, stop, formatTimeRemaining } = useBreathEngine(
    { pattern, durationSeconds },
    {
      onCycleComplete: (count) => {
        cyclesRef.current = count;
      },
      onSessionComplete: (cycles) => {
        navigation.replace('Integration', {
          exerciseId,
          completedCycles: cycles,
          wasEarlyExit: false,
        });
      },
    }
  );

  // Start session on mount
  useEffect(() => {
    start();
  }, []);

  const handleStop = () => {
    stop();
    navigation.replace('Integration', {
      exerciseId,
      completedCycles: cyclesRef.current,
      wasEarlyExit: true,
    });
  };

  const categoryColor = exercise ? colors.category[exercise.category] : colors.accent.sage;

  return (
    <SafeAreaView style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleStop}>
        <CloseIcon />
      </TouchableOpacity>

      {/* Time remaining */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Kvar</Text>
        <Text style={styles.timeValue}>{formatTimeRemaining()}</Text>
      </View>

      {/* Breathing circle */}
      <View style={styles.circleContainer}>
        <BreathingCircle
          phase={state.phase}
          progress={state.progress}
          phaseTime={state.phaseTimeRemaining}
          color={categoryColor}
        />
      </View>

      {/* Cycle count */}
      <Text style={styles.cycleCount}>
        {state.cyclesCompleted} {state.cyclesCompleted === 1 ? 'cykel' : 'cykler'}
      </Text>

      {/* Stop button */}
      <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
        <Text style={styles.stopText}>Stoppa</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    ...shadow.md,
  },
  timeContainer: {
    position: 'absolute',
    top: 100,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  timeValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.normal,
    color: colors.text.primary,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleCount: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    marginTop: spacing.xl,
  },
  stopButton: {
    position: 'absolute',
    bottom: 60,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: `${colors.text.muted}30`,
    borderRadius: radius.full,
  },
  stopText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
});
