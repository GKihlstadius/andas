// ============================================
// ANDAS - COMPLETE AUDIO SYSTEM
// ============================================
// Provides:
// 1. Phase cue tones (inhale, exhale, hold)
// 2. Background ambient sounds (rain, ocean, forest)
// 3. Completion chime
// 4. Voice guidance (future)
// 
// Using expo-audio (replacing deprecated expo-av)

import { useRef, useCallback, useEffect, useState } from 'react';
import { useAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { BreathPhase } from '../data/types';

// ============================================
// TYPES
// ============================================

export type BackgroundSoundType = 'none' | 'rain' | 'ocean' | 'forest' | 'white';

export interface AudioSettings {
  enabled: boolean;
  volume: number; // 0-1
  hapticsEnabled: boolean;
  backgroundSound: BackgroundSoundType;
  backgroundVolume: number; // 0-1
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  enabled: true,
  volume: 0.3,
  hapticsEnabled: true,
  backgroundSound: 'none',
  backgroundVolume: 0.2,
};

// ============================================
// TONE GENERATION
// ============================================

// Generate a sine wave WAV file as base64
// This creates actual audible tones without external files
function generateToneWav(frequency: number, durationMs: number, volume: number = 0.3): string {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * (durationMs / 1000));
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  // Create WAV header + data
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // audio format (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Generate sine wave with fade in/out
  const fadeLength = Math.min(numSamples * 0.1, sampleRate * 0.05); // 10% or 50ms max
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = Math.sin(2 * Math.PI * frequency * t);
    
    // Apply envelope (fade in/out)
    let envelope = 1;
    if (i < fadeLength) {
      envelope = i / fadeLength;
    } else if (i > numSamples - fadeLength) {
      envelope = (numSamples - i) / fadeLength;
    }
    
    sample *= envelope * volume;
    
    // Convert to 16-bit integer
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(44 + i * 2, intSample, true);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return 'data:audio/wav;base64,' + btoa(binary);
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// Base64 encode (simple implementation)
function btoa(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    
    const triplet = (a << 16) | (b << 8) | c;
    
    result += chars[(triplet >> 18) & 0x3f];
    result += chars[(triplet >> 12) & 0x3f];
    result += i > str.length + 1 ? '=' : chars[(triplet >> 6) & 0x3f];
    result += i > str.length ? '=' : chars[triplet & 0x3f];
  }
  
  return result;
}

// ============================================
// PHASE FREQUENCIES (Solfeggio-inspired)
// ============================================

const PHASE_TONES: Record<BreathPhase, { frequency: number; duration: number } | null> = {
  ready: null,
  countdown: { frequency: 440, duration: 200 },      // A4 - attention
  inhale: { frequency: 528, duration: 400 },         // C5 - gentle rise
  holdIn: null,                                       // Silence
  exhale: { frequency: 396, duration: 400 },         // G4 - gentle fall
  holdOut: null,                                      // Silence
  complete: { frequency: 432, duration: 800 },       // A4 (432Hz) - completion
};

// ============================================
// HAPTIC PATTERNS
// ============================================

const PHASE_HAPTICS: Record<BreathPhase, Haptics.ImpactFeedbackStyle | null> = {
  ready: null,
  countdown: Haptics.ImpactFeedbackStyle.Light,
  inhale: Haptics.ImpactFeedbackStyle.Light,
  holdIn: null,
  exhale: Haptics.ImpactFeedbackStyle.Medium,
  holdOut: null,
  complete: Haptics.ImpactFeedbackStyle.Heavy,
};

// ============================================
// MAIN AUDIO HOOK (Haptics-focused for SDK 54)
// ============================================
// Note: expo-audio has a different API than expo-av.
// For simplicity, we focus on haptics for phase cues
// and skip complex audio generation until proper audio files are added.

interface UseBreathAudioReturn {
  playPhaseCue: (phase: BreathPhase) => Promise<void>;
  startBackgroundSound: () => Promise<void>;
  stopBackgroundSound: () => Promise<void>;
  stopAll: () => Promise<void>;
  updateSettings: (settings: Partial<AudioSettings>) => void;
  settings: AudioSettings;
  isBackgroundPlaying: boolean;
}

export function useBreathAudio(initialSettings: Partial<AudioSettings> = {}): UseBreathAudioReturn {
  const [settings, setSettings] = useState<AudioSettings>({
    ...DEFAULT_AUDIO_SETTINGS,
    ...initialSettings,
  });
  
  const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);
  const settingsRef = useRef(settings);

  // Keep settings ref up to date
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  /**
   * Play haptic feedback for phase
   */
  const playHaptic = useCallback(async (phase: BreathPhase) => {
    if (!settingsRef.current.hapticsEnabled) return;
    
    const style = PHASE_HAPTICS[phase];
    if (style) {
      try {
        await Haptics.impactAsync(style);
      } catch (error) {
        // Haptics not available on this device
      }
    }
  }, []);

  /**
   * Play a phase cue (haptics for now, audio can be added later)
   */
  const playPhaseCue = useCallback(async (phase: BreathPhase) => {
    // Always try haptics - this is the primary feedback
    await playHaptic(phase);
    
    // Audio playback disabled for now - expo-audio requires different API
    // Can be re-enabled with proper audio files or sound generation
  }, [playHaptic]);

  /**
   * Start background ambient sound (placeholder)
   */
  const startBackgroundSound = useCallback(async () => {
    const soundType = settingsRef.current.backgroundSound;
    if (soundType === 'none') return;
    
    // Background sounds would need actual audio files
    // For now, just set the state
    setIsBackgroundPlaying(true);
  }, []);

  /**
   * Stop background sound
   */
  const stopBackgroundSound = useCallback(async () => {
    setIsBackgroundPlaying(false);
  }, []);

  /**
   * Stop all audio
   */
  const stopAll = useCallback(async () => {
    await stopBackgroundSound();
  }, [stopBackgroundSound]);

  /**
   * Update settings
   */
  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // If background sound type changed, restart it
      if (newSettings.backgroundSound !== undefined && 
          newSettings.backgroundSound !== prev.backgroundSound &&
          isBackgroundPlaying) {
        stopBackgroundSound().then(() => {
          if (newSettings.backgroundSound !== 'none') {
            startBackgroundSound();
          }
        });
      }
      
      return updated;
    });
  }, [isBackgroundPlaying, stopBackgroundSound, startBackgroundSound]);

  return {
    playPhaseCue,
    startBackgroundSound,
    stopBackgroundSound,
    stopAll,
    updateSettings,
    settings,
    isBackgroundPlaying,
  };
}

// ============================================
// SIMPLIFIED HAPTICS-ONLY HOOK
// ============================================

export function useBreathHaptics(): {
  triggerPhaseCue: (phase: BreathPhase) => void;
  setEnabled: (enabled: boolean) => void;
} {
  const enabledRef = useRef(true);

  const triggerPhaseCue = useCallback((phase: BreathPhase) => {
    if (!enabledRef.current) return;
    
    const style = PHASE_HAPTICS[phase];
    if (style) {
      Haptics.impactAsync(style).catch(() => {
        // Haptics not available
      });
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  return { triggerPhaseCue, setEnabled };
}

// ============================================
// AUDIO SETTINGS STORAGE
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const AUDIO_SETTINGS_KEY = '@andas_audio_settings';

export async function loadAudioSettings(): Promise<AudioSettings> {
  try {
    const saved = await AsyncStorage.getItem(AUDIO_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load audio settings:', error);
  }
  return DEFAULT_AUDIO_SETTINGS;
}

export async function saveAudioSettings(settings: AudioSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save audio settings:', error);
  }
}
