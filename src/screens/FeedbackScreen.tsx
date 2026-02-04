// ============================================
// ANDAS - FEEDBACK SCREEN
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, typography, spacing, radius, shadow } from '../data/constants';
import { SessionFeedback } from '../data/types';
import { useUserState } from '../state/userState';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Feedback'>;
  route: RouteProp<RootStackParamList, 'Feedback'>;
};

function CheckIcon({ size = 36, color = colors.accent.sage }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Path d="M20 6L9 17l-5-5" strokeLinecap="round" />
    </Svg>
  );
}

function CalmerIcon({ size = 28, color = colors.text.secondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
      <Circle cx="9" cy="9" r="1" fill={color} />
      <Circle cx="15" cy="9" r="1" fill={color} />
    </Svg>
  );
}

function SameIcon({ size = 28, color = colors.text.secondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M8 15h8" strokeLinecap="round" />
      <Circle cx="9" cy="9" r="1" fill={color} />
      <Circle cx="15" cy="9" r="1" fill={color} />
    </Svg>
  );
}

function ActivatedIcon({ size = 28, color = colors.text.secondary }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M8 16s1.5-2 4-2 4 2 4 2" strokeLinecap="round" />
      <Circle cx="9" cy="9" r="1" fill={color} />
      <Circle cx="15" cy="9" r="1" fill={color} />
    </Svg>
  );
}

const feedbackOptions: Array<{
  id: SessionFeedback;
  label: string;
  Icon: typeof CalmerIcon;
}> = [
  { id: 'calmer', label: 'Lugnare', Icon: CalmerIcon },
  { id: 'same', label: 'Samma', Icon: SameIcon },
  { id: 'moreActivated', label: 'Mer aktiverad', Icon: ActivatedIcon },
];

export function FeedbackScreen({ navigation, route }: Props) {
  const { exerciseId, completedCycles, wasEarlyExit } = route.params;
  const { recordSession } = useUserState();

  const handleFeedback = async (feedback: SessionFeedback | null) => {
    // Record session with feedback
    await recordSession(
      exerciseId,
      3, // Duration approximation
      completedCycles,
      feedback,
      wasEarlyExit
    );

    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Completion indicator */}
      <View style={styles.checkContainer}>
        <CheckIcon />
      </View>

      {/* Cycle count */}
      <Text style={styles.cycleCount}>
        {completedCycles} {completedCycles === 1 ? 'cykel' : 'cykler'}
      </Text>

      {/* Question */}
      <Text style={styles.question}>Hur känns kroppen nu?</Text>

      {/* Feedback options */}
      <View style={styles.optionsContainer}>
        {feedbackOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.option}
            onPress={() => handleFeedback(option.id)}
            activeOpacity={0.7}
          >
            <option.Icon />
            <Text style={styles.optionLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Skip */}
      <TouchableOpacity style={styles.skipButton} onPress={() => handleFeedback(null)}>
        <Text style={styles.skipText}>Hoppa över</Text>
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
    padding: spacing.lg,
  },
  checkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.accent.sage}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  cycleCount: {
    fontSize: typography.size.base,
    color: colors.text.tertiary,
    marginBottom: spacing.xl,
  },
  question: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  option: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.surface.elevated,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.sm,
  },
  optionLabel: {
    fontSize: typography.size.sm,
    color: colors.text.primary,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
  },
});
