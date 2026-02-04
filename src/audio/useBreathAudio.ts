// ============================================
// ANDAS - BREATH AUDIO GUIDANCE
// ============================================
// Non-verbal audio cues for breath phases.
// Supports regulation, never leads, never stresses.
//
// Using expo-audio (replacing deprecated expo-av)

import { useRef, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { BreathPhase } from '../data/types';

// Sound types for different phases
// Using haptics as primary feedback for reliability

interface AudioConfig {
  enabled: boolean;
  volume: number; // 0-1
}

interface UseBreathAudioReturn {
  playPhaseCue: (phase: BreathPhase) => Promise<void>;
  stopAll: () => Promise<void>;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
}

// Haptic patterns for each phase
const PHASE_HAPTICS: Record<BreathPhase, Haptics.ImpactFeedbackStyle | null> = {
  ready: null,
  countdown: Haptics.ImpactFeedbackStyle.Light,
  inhale: Haptics.ImpactFeedbackStyle.Light,
  holdIn: null,
  exhale: Haptics.ImpactFeedbackStyle.Medium,
  holdOut: null,
  complete: Haptics.ImpactFeedbackStyle.Heavy,
};

export function useBreathAudio(config: AudioConfig): UseBreathAudioReturn {
  const configRef = useRef(config);
  
  // Keep config ref up to date
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  /**
   * Play a short haptic cue for a breath phase
   */
  const playPhaseCue = useCallback(async (phase: BreathPhase) => {
    if (!configRef.current.enabled) return;
    
    const hapticStyle = PHASE_HAPTICS[phase];
    if (hapticStyle) {
      try {
        await Haptics.impactAsync(hapticStyle);
      } catch (error) {
        // Haptics not available on this device
      }
    }
  }, []);

  /**
   * Stop all audio (no-op for haptics-only implementation)
   */
  const stopAll = useCallback(async () => {
    // Nothing to stop with haptics
  }, []);

  /**
   * Enable/disable audio
   */
  const setEnabled = useCallback((enabled: boolean) => {
    configRef.current.enabled = enabled;
  }, []);

  /**
   * Set volume (kept for API compatibility)
   */
  const setVolume = useCallback((volume: number) => {
    configRef.current.volume = Math.max(0, Math.min(1, volume));
  }, []);

  return {
    playPhaseCue,
    stopAll,
    setEnabled,
    setVolume,
  };
}

/**
 * Alternative: Use haptics for breath feedback
 * This is actually preferred for some users
 */
export function useBreathHaptics(): {
  triggerPhaseCue: (phase: BreathPhase) => void;
} {
  const triggerPhaseCue = useCallback((phase: BreathPhase) => {
    const hapticStyle = PHASE_HAPTICS[phase];
    if (hapticStyle) {
      Haptics.impactAsync(hapticStyle).catch(() => {
        // Haptics not available
      });
    }
  }, []);

  return { triggerPhaseCue };
}
