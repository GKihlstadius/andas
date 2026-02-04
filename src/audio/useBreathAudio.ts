// ============================================
// ANDAS - BREATH AUDIO GUIDANCE
// ============================================
// Non-verbal audio cues for breath phases.
// Supports regulation, never leads, never stresses.

import { useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { BreathPhase } from '../data/types';

// Sound types for different phases
// Using simple sine wave synthesis for minimal bundle size
// and deterministic behavior across devices

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

// Simple frequency map for phases
// Lower frequencies = more calming
const PHASE_FREQUENCIES: Record<BreathPhase, number | null> = {
  ready: null,      // No sound
  countdown: 440,   // A4 - neutral attention
  inhale: 528,      // C5 - gentle rise (solfeggio frequency)
  holdIn: null,     // Silence during hold
  exhale: 396,      // G4 - gentle fall (solfeggio frequency)
  holdOut: null,    // Silence during hold
  complete: 432,    // A4 - completion tone
};

export function useBreathAudio(config: AudioConfig): UseBreathAudioReturn {
  const soundRef = useRef<Audio.Sound | null>(null);
  const configRef = useRef(config);
  
  // Keep config ref up to date
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  /**
   * Play a short tone cue for a breath phase
   */
  const playPhaseCue = useCallback(async (phase: BreathPhase) => {
    if (!configRef.current.enabled) return;
    
    const frequency = PHASE_FREQUENCIES[phase];
    if (!frequency) return; // Silence for this phase
    
    try {
      // Stop any playing sound
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      // Create and play a short tone
      // Using expo-av's ability to play from memory
      // For v1, we use a simple beep approach
      const { sound } = await Audio.Sound.createAsync(
        { uri: getToneUri(frequency) },
        { 
          shouldPlay: true, 
          volume: configRef.current.volume,
          isLooping: phase === 'inhale' || phase === 'exhale',
        }
      );
      
      soundRef.current = sound;
      
      // Auto-stop after appropriate duration for non-looping phases
      if (phase === 'countdown' || phase === 'complete') {
        setTimeout(async () => {
          if (soundRef.current === sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            soundRef.current = null;
          }
        }, 500);
      }
    } catch (error) {
      // Audio is non-critical, silently fail
      console.warn('Audio playback failed:', error);
    }
  }, []);

  /**
   * Stop all audio
   */
  const stopAll = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (error) {
        // Ignore errors on cleanup
      }
      soundRef.current = null;
    }
  }, []);

  /**
   * Enable/disable audio
   */
  const setEnabled = useCallback((enabled: boolean) => {
    configRef.current.enabled = enabled;
    if (!enabled) {
      stopAll();
    }
  }, [stopAll]);

  /**
   * Set volume (0-1)
   */
  const setVolume = useCallback((volume: number) => {
    configRef.current.volume = Math.max(0, Math.min(1, volume));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  return {
    playPhaseCue,
    stopAll,
    setEnabled,
    setVolume,
  };
}

/**
 * Generate a simple tone URI using data URI
 * This avoids needing external audio files
 */
function getToneUri(frequency: number): string {
  // For v1, we return a placeholder that will be replaced
  // with actual implementation using expo-av's capabilities
  // In production, this would generate a WAV data URI
  // or use pre-generated audio files
  
  // Placeholder: return silent audio
  // Actual implementation would use Audio.setIsEnabledAsync
  // with synthesized tones
  return 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
}

/**
 * Alternative: Use haptics instead of/in addition to audio
 * This is actually preferred for some users
 */
export function useBreathHaptics(): {
  triggerPhaseCue: (phase: BreathPhase) => void;
} {
  const triggerPhaseCue = useCallback((phase: BreathPhase) => {
    // Haptics implementation would go here
    // Using expo-haptics
    // For v1, this is a placeholder
  }, []);

  return { triggerPhaseCue };
}
