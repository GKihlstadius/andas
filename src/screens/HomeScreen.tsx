// ============================================
// ANDAS - HOME SCREEN
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadow } from '../data/constants';
import { useUserState } from '../state/userState';
import { getSafeExercisesForCategory, getRecommendedExercise, checkExerciseSafety } from '../safety';
import { ExerciseCard } from '../components';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

function ShieldIcon({ size = 18, color = colors.accent.sage }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

export function HomeScreen({ navigation }: Props) {
  const { userState, resetUserState } = useUserState();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'God natt';
    if (hour < 12) return 'God morgon';
    if (hour < 18) return 'God eftermiddag';
    return 'God kväll';
  };

  const getBaselineLabel = () => {
    switch (userState.baseline) {
      case 'calm': return 'Lugn';
      case 'neutral': return 'Neutral';
      case 'stressed': return 'Stressad';
      case 'overstimulated': return 'Överstimulerad';
    }
  };

  const getSensitivityLabel = () => {
    switch (userState.sensitivity) {
      case 'low': return 'Låg';
      case 'medium': return 'Medium';
      case 'high': return 'Hög';
    }
  };

  const recommended = getRecommendedExercise(userState);
  const recommendedSafety = checkExerciseSafety(recommended, userState);
  const lugnExercises = getSafeExercisesForCategory('lugn', userState);

  const handleExercisePress = (exerciseId: string) => {
    navigation.navigate('Preparation', { exerciseId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.title}>Ta ett andetag</Text>
        </View>

        {/* User state indicator */}
        <View style={styles.stateContainer}>
          <ShieldIcon />
          <View style={styles.stateContent}>
            <Text style={styles.stateTitle}>{getBaselineLabel()} baseline</Text>
            <Text style={styles.stateSubtext}>
              {getSensitivityLabel()} känslighet
              {userState.contraindications.breathHolds && ' • Undviker anhåll'}
              {userState.contraindications.fastBreathing && ' • Undviker snabb andning'}
            </Text>
          </View>
        </View>

        {/* Recommended */}
        <View style={styles.section}>
          <ExerciseCard
            exercise={recommended}
            safetyResult={recommendedSafety}
            onPress={() => handleExercisePress(recommended.id)}
            recommended
          />
        </View>

        {/* All LUGN exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lugn</Text>
          <View style={styles.exerciseList}>
            {lugnExercises.map(({ exercise, safetyResult }) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                safetyResult={safetyResult}
                onPress={() => handleExercisePress(exercise.id)}
              />
            ))}
          </View>
        </View>

        {/* Debug reset */}
        <TouchableOpacity style={styles.resetButton} onPress={resetUserState}>
          <Text style={styles.resetText}>Återställ (debug)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  stateContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.functional.safetyBg,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
  },
  stateContent: {
    flex: 1,
  },
  stateTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  stateSubtext: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  exerciseList: {
    gap: spacing.sm,
  },
  resetButton: {
    alignSelf: 'center',
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  resetText: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
  },
});
