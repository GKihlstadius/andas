// ============================================
// ANDAS - ONBOARDING SCREEN
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onboardingQuestions } from '../data/exercises';
import { colors, typography, spacing, radius, shadow } from '../data/constants';
import { useUserState } from '../state/userState';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

function ShieldIcon({ size = 20, color = colors.accent.sage }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

export function OnboardingScreen({ navigation }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { completeOnboarding } = useUserState();

  const question = onboardingQuestions[currentQuestion];
  const isLast = currentQuestion === onboardingQuestions.length - 1;

  const handleSelect = async (optionId: string) => {
    const newAnswers = { ...answers, [question.id]: optionId };
    setAnswers(newAnswers);

    if (isLast) {
      await completeOnboarding(newAnswers);
      navigation.replace('Home');
    } else {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 200);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        {onboardingQuestions.map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              { backgroundColor: i <= currentQuestion ? colors.accent.sage : colors.bg.secondary },
            ]}
          />
        ))}
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{question.question}</Text>
        <Text style={styles.subtext}>{question.subtext}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.option}
            onPress={() => handleSelect(option.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Safety message - updated for v1 */}
      <View style={styles.safetyContainer}>
        <ShieldIcon />
        <Text style={styles.safetyText}>
          {currentQuestion === 0 
            ? 'ANDAS anpassar övningarna efter ditt nervsystem. Ibland säger appen nej – det är för din säkerhet.'
            : currentQuestion === 1
            ? 'Det finns inget rätt svar. Vi möter dig där du är.'
            : 'Ingen blir utesluten. Vi anpassar bara övningarna så att de känns trygga.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    padding: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: radius.full,
  },
  questionContainer: {
    marginBottom: spacing.xl,
  },
  question: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtext: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    padding: spacing.lg,
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow.sm,
  },
  optionText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  safetyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.functional.safetyBg,
    borderRadius: radius.lg,
    marginTop: 'auto',
  },
  safetyText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
});
