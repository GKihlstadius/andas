// ============================================
// ANDAS - PERSISTENT STORAGE
// ============================================
// Safe, deterministic storage with fallback behavior.
// All storage operations are guarded against corruption.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'andas_user_state_v1';
const BACKUP_KEY = 'andas_user_state_v1_backup';

export interface StorageResult<T> {
  success: boolean;
  data: T | null;
  error: Error | null;
  usedFallback: boolean;
}

/**
 * Safely load state from storage with fallback
 */
export async function safeLoad<T>(defaultValue: T): Promise<StorageResult<T>> {
  try {
    // Try primary storage
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // Validate basic structure
        if (isValidState(parsed)) {
          // Update backup on successful read
          await AsyncStorage.setItem(BACKUP_KEY, stored);
          
          return {
            success: true,
            data: parsed,
            error: null,
            usedFallback: false,
          };
        }
      } catch (parseError) {
        console.warn('Failed to parse stored state, trying backup:', parseError);
      }
    }
    
    // Try backup
    const backup = await AsyncStorage.getItem(BACKUP_KEY);
    if (backup) {
      try {
        const parsedBackup = JSON.parse(backup);
        if (isValidState(parsedBackup)) {
          // Restore from backup
          await AsyncStorage.setItem(STORAGE_KEY, backup);
          
          return {
            success: true,
            data: parsedBackup,
            error: null,
            usedFallback: true,
          };
        }
      } catch (backupError) {
        console.warn('Backup also corrupted:', backupError);
      }
    }
    
    // Return default
    return {
      success: true,
      data: defaultValue,
      error: null,
      usedFallback: false,
    };
  } catch (error) {
    console.error('Critical storage error:', error);
    
    return {
      success: false,
      data: defaultValue,
      error: error instanceof Error ? error : new Error(String(error)),
      usedFallback: false,
    };
  }
}

/**
 * Safely save state to storage
 */
export async function safeSave<T>(data: T): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Validate before saving
    if (!isValidState(data)) {
      return {
        success: false,
        error: new Error('Invalid state structure'),
      };
    }
    
    const serialized = JSON.stringify(data);
    
    // Save to primary
    await AsyncStorage.setItem(STORAGE_KEY, serialized);
    
    // Update backup
    await AsyncStorage.setItem(BACKUP_KEY, serialized);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to save state:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Clear all stored data (for reset/debug)
 */
export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEY, BACKUP_KEY]);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * Validate state structure
 * This ensures we don't load corrupted data
 */
function isValidState(state: unknown): boolean {
  if (typeof state !== 'object' || state === null) {
    return false;
  }
  
  const s = state as Record<string, unknown>;
  
  // Required fields
  const requiredFields = [
    'id',
    'onboardingCompleted',
    'baseline',
    'sensitivity',
    'contraindications',
    'capacities',
    'adaptiveFlags',
  ];
  
  for (const field of requiredFields) {
    if (!(field in s)) {
      return false;
    }
  }
  
  // Validate contraindications
  const contraindications = s.contraindications as Record<string, unknown>;
  if (typeof contraindications?.breathHolds !== 'boolean' ||
      typeof contraindications?.fastBreathing !== 'boolean') {
    return false;
  }
  
  // Validate capacities
  const capacities = s.capacities as Record<string, unknown>;
  const capacityFields = ['calmBreathing', 'focusStability', 'energyRegulation', 'holdTolerance'];
  for (const field of capacityFields) {
    if (typeof capacities?.[field] !== 'number') {
      return false;
    }
  }
  
  // Validate adaptive flags
  const flags = s.adaptiveFlags as Record<string, unknown>;
  const flagFields = ['avoidFastBreathing', 'reduceIntensity', 'suggestGrounding', 'extendIntegration'];
  for (const field of flagFields) {
    if (typeof flags?.[field] !== 'boolean') {
      return false;
    }
  }
  
  // Validate baseline
  const validBaselines = ['calm', 'neutral', 'stressed', 'overstimulated'];
  if (!validBaselines.includes(s.baseline as string)) {
    return false;
  }
  
  // Validate sensitivity
  const validSensitivities = ['low', 'medium', 'high'];
  if (!validSensitivities.includes(s.sensitivity as string)) {
    return false;
  }
  
  return true;
}
