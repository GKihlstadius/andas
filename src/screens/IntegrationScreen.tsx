// ============================================
// ANDAS - INTEGRATION SCREEN
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, typography, spacing, radius, shadow } from '../data/constants';
import { getExerciseById, microActions } from '../data/exercises';
import { useUserState } from '../state/userState';
import { getIntegrationConfig } from '../safety';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Integration'>;
  route: RouteProp<RootStackParamList, 'Integration'>;
};

export function IntegrationScreen({ navigation, route }: Props) {
  const { exerciseId, completedCycles, wasEarlyExit } = route.params;
  const { userState } = useUserState();
  const exercise = getExerciseById(exerciseId);

  const config = getIntegrationConfig(userState, exercise?.safety.maxIntensity || 1);
  
  const [timeLeft, setTimeLeft] = useState(config.durationSeconds);
  const [textIndex, setTextIndex] = useState(0);

  // Get appropriate micro action
  const getMicroAction = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 10 ? 'morning' : hour > 20 ? 'evening' : 'any';
    const available = microActions.filter(
      (a) => a.timeOfDay === 'any' || a.timeOfDay === timeOfDay
    );
    return available[Math.floor(Math.random() * available.length)] || null;
  };

  const [microAction] = useState(() => (config.showMicroAction ? getMicroAction() : null));

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate texts
  useEffect(() => {
    if (config.texts.length <= 1) return;
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % config.texts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [config.texts.length]);

  const canContinue = timeLeft === 0;

  const handleContinue = () => {
    navigation.replace('Feedback', {
      exerciseId,
      completedCycles,
      wasEarlyExit,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main text */}
      <Text style={styles.mainText}>{config.texts[textIndex]}</Text>

      {/* Timer or continue */}
      {!canContinue ? (
        <Text style={styles.timer}>{timeLeft}s</Text>
      ) : (
        <>
          {/* Micro action */}
          {microAction && (
            <View style={styles.microActionContainer}>
              <Text style={styles.microActionLabel}>Ett förslag</Text>
              <Text style={styles.microActionText}>{microAction.text}</Text>
            </View>
          )}

          {/* Continue button */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>Fortsätt</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  mainText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.normal,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.size.xl * typography.lineHeight.relaxed,
    maxWidth: 280,
  },
  timer: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    marginTop: spacing['2xl'],
  },
  microActionContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.lg,
    maxWidth: 280,
    alignItems: 'center',
    ...shadow.sm,
  },
  microActionLabel: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  microActionText: {
    fontSize: typography.size.base,
    color: colors.text.primary,
    textAlign: 'center',
  },
  continueButton: {
    marginTop: spacing['2xl'],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.full,
    ...shadow.md,
  },
  continueText: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
  },
});
