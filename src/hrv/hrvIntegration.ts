// ============================================
// ANDAS - HRV INTEGRATION (Apple Health)
// ============================================
// Provides:
// 1. HRV data retrieval from Apple HealthKit
// 2. Resting heart rate tracking
// 3. Session-based HRV analysis
// 4. Nervous system state estimation

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ============================================
// TYPES
// ============================================

export interface HRVReading {
  value: number;           // SDNN in milliseconds
  timestamp: string;       // ISO date string
  source: 'healthkit' | 'manual' | 'session';
}

export interface HeartRateReading {
  value: number;           // BPM
  timestamp: string;
  source: 'healthkit' | 'manual';
}

export interface HRVAnalysis {
  currentHRV: number | null;
  averageHRV: number | null;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  restingHeartRate: number | null;
  nervousSystemState: NervousSystemEstimate;
  lastUpdated: string | null;
}

export type NervousSystemEstimate = 
  | 'parasympathetic'     // Good recovery, relaxed
  | 'balanced'            // Normal
  | 'sympathetic'         // Stressed, fight/flight
  | 'unknown';

export interface HRVSettings {
  enabled: boolean;
  hasPermission: boolean;
  lastSyncDate: string | null;
  syncFrequencyHours: number;
}

export const DEFAULT_HRV_SETTINGS: HRVSettings = {
  enabled: false,
  hasPermission: false,
  lastSyncDate: null,
  syncFrequencyHours: 6,
};

// Storage keys
const HRV_SETTINGS_KEY = '@andas_hrv_settings';
const HRV_DATA_KEY = '@andas_hrv_data';
const HR_DATA_KEY = '@andas_hr_data';

// ============================================
// HRV DATA STORAGE
// ============================================

interface StoredHRVData {
  readings: HRVReading[];
  heartRateReadings: HeartRateReading[];
  lastAnalysis: HRVAnalysis | null;
}

async function loadStoredData(): Promise<StoredHRVData> {
  try {
    const [hrvJson, hrJson] = await Promise.all([
      AsyncStorage.getItem(HRV_DATA_KEY),
      AsyncStorage.getItem(HR_DATA_KEY),
    ]);

    return {
      readings: hrvJson ? JSON.parse(hrvJson) : [],
      heartRateReadings: hrJson ? JSON.parse(hrJson) : [],
      lastAnalysis: null,
    };
  } catch (error) {
    console.warn('Failed to load HRV data:', error);
    return { readings: [], heartRateReadings: [], lastAnalysis: null };
  }
}

async function saveHRVReadings(readings: HRVReading[]): Promise<void> {
  try {
    // Keep only last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filtered = readings.filter(r => 
      new Date(r.timestamp) > thirtyDaysAgo
    );
    
    await AsyncStorage.setItem(HRV_DATA_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to save HRV data:', error);
  }
}

async function saveHRReadings(readings: HeartRateReading[]): Promise<void> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filtered = readings.filter(r => 
      new Date(r.timestamp) > thirtyDaysAgo
    );
    
    await AsyncStorage.setItem(HR_DATA_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to save HR data:', error);
  }
}

// ============================================
// HRV ANALYSIS
// ============================================

function analyzeHRV(readings: HRVReading[], hrReadings: HeartRateReading[]): HRVAnalysis {
  if (readings.length === 0) {
    return {
      currentHRV: null,
      averageHRV: null,
      trend: 'unknown',
      restingHeartRate: null,
      nervousSystemState: 'unknown',
      lastUpdated: null,
    };
  }

  // Sort by timestamp descending
  const sorted = [...readings].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Current HRV (most recent)
  const currentHRV = sorted[0]?.value ?? null;
  const lastUpdated = sorted[0]?.timestamp ?? null;

  // Average HRV (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentReadings = sorted.filter(r => 
    new Date(r.timestamp) > sevenDaysAgo
  );
  
  const averageHRV = recentReadings.length > 0
    ? recentReadings.reduce((sum, r) => sum + r.value, 0) / recentReadings.length
    : null;

  // Trend analysis (compare last 3 days to previous 3 days)
  let trend: HRVAnalysis['trend'] = 'unknown';
  
  if (sorted.length >= 6) {
    const recent3Days = sorted.slice(0, 3);
    const previous3Days = sorted.slice(3, 6);
    
    const recentAvg = recent3Days.reduce((s, r) => s + r.value, 0) / 3;
    const previousAvg = previous3Days.reduce((s, r) => s + r.value, 0) / 3;
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    if (change > 5) trend = 'improving';
    else if (change < -5) trend = 'declining';
    else trend = 'stable';
  }

  // Resting heart rate (minimum from recent readings)
  const recentHR = hrReadings
    .filter(r => new Date(r.timestamp) > sevenDaysAgo)
    .map(r => r.value);
  
  const restingHeartRate = recentHR.length > 0
    ? Math.min(...recentHR)
    : null;

  // Nervous system state estimation
  const nervousSystemState = estimateNervousSystemState(currentHRV, averageHRV, restingHeartRate);

  return {
    currentHRV,
    averageHRV,
    trend,
    restingHeartRate,
    nervousSystemState,
    lastUpdated,
  };
}

function estimateNervousSystemState(
  currentHRV: number | null,
  averageHRV: number | null,
  restingHR: number | null
): NervousSystemEstimate {
  if (currentHRV === null || averageHRV === null) {
    return 'unknown';
  }

  // HRV-based estimation
  // Higher HRV generally indicates parasympathetic dominance
  // Lower HRV indicates sympathetic dominance
  
  const hrvRatio = currentHRV / averageHRV;
  
  // Also consider resting heart rate if available
  const hrFactor = restingHR !== null && restingHR > 80 ? -0.1 : 0;
  
  const adjustedRatio = hrvRatio + hrFactor;
  
  if (adjustedRatio > 1.1) {
    return 'parasympathetic';  // Above average HRV = good recovery
  } else if (adjustedRatio > 0.9) {
    return 'balanced';         // Normal range
  } else {
    return 'sympathetic';      // Below average = stressed
  }
}

// ============================================
// HEALTHKIT INTEGRATION (iOS Only)
// ============================================

// Note: This requires react-native-health package and proper HealthKit setup
// The actual HealthKit calls are wrapped in try/catch for cross-platform safety

interface HealthKitModule {
  isAvailable: () => Promise<boolean>;
  initHealthKit: (permissions: any) => Promise<boolean>;
  getHeartRateVariabilitySamples: (options: any) => Promise<any[]>;
  getRestingHeartRateSamples: (options: any) => Promise<any[]>;
}

let AppleHealthKit: HealthKitModule | null = null;

// Try to load HealthKit module (only works on iOS)
try {
  if (Platform.OS === 'ios') {
    AppleHealthKit = require('react-native-health').default;
  }
} catch (e) {
  // HealthKit not available
  AppleHealthKit = null;
}

const HEALTHKIT_PERMISSIONS = {
  permissions: {
    read: ['HeartRateVariability', 'RestingHeartRate', 'HeartRate'],
    write: [],
  },
};

async function requestHealthKitPermission(): Promise<boolean> {
  if (!AppleHealthKit) return false;

  try {
    const isAvailable = await AppleHealthKit.isAvailable();
    if (!isAvailable) return false;

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(HEALTHKIT_PERMISSIONS)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
  } catch (error) {
    console.warn('HealthKit permission error:', error);
    return false;
  }
}

async function fetchHealthKitHRV(startDate: Date, endDate: Date): Promise<HRVReading[]> {
  if (!AppleHealthKit) return [];

  try {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ascending: false,
      limit: 100,
    };

    const results = await AppleHealthKit.getHeartRateVariabilitySamples(options);
    
    return results.map((sample: any) => ({
      value: sample.value * 1000, // Convert to ms if in seconds
      timestamp: sample.startDate || sample.endDate,
      source: 'healthkit' as const,
    }));
  } catch (error) {
    console.warn('HealthKit HRV fetch error:', error);
    return [];
  }
}

async function fetchHealthKitRestingHR(startDate: Date, endDate: Date): Promise<HeartRateReading[]> {
  if (!AppleHealthKit) return [];

  try {
    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ascending: false,
      limit: 100,
    };

    const results = await AppleHealthKit.getRestingHeartRateSamples(options);
    
    return results.map((sample: any) => ({
      value: sample.value,
      timestamp: sample.startDate || sample.endDate,
      source: 'healthkit' as const,
    }));
  } catch (error) {
    console.warn('HealthKit HR fetch error:', error);
    return [];
  }
}

// ============================================
// MAIN HRV HOOK
// ============================================

interface UseHRVReturn {
  analysis: HRVAnalysis;
  settings: HRVSettings;
  isLoading: boolean;
  isSyncing: boolean;
  enableHRV: () => Promise<boolean>;
  disableHRV: () => Promise<void>;
  syncNow: () => Promise<void>;
  addManualHRV: (value: number) => Promise<void>;
  recordSessionHRV: (preSessionHRV: number, postSessionHRV: number) => Promise<void>;
}

export function useHRV(): UseHRVReturn {
  const [settings, setSettings] = useState<HRVSettings>(DEFAULT_HRV_SETTINGS);
  const [analysis, setAnalysis] = useState<HRVAnalysis>({
    currentHRV: null,
    averageHRV: null,
    trend: 'unknown',
    restingHeartRate: null,
    nervousSystemState: 'unknown',
    lastUpdated: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const dataRef = useRef<StoredHRVData>({
    readings: [],
    heartRateReadings: [],
    lastAnalysis: null,
  });

  // Load settings and data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load settings
      const savedSettings = await AsyncStorage.getItem(HRV_SETTINGS_KEY);
      if (savedSettings) {
        setSettings({ ...DEFAULT_HRV_SETTINGS, ...JSON.parse(savedSettings) });
      }

      // Load HRV data
      const data = await loadStoredData();
      dataRef.current = data;

      // Analyze
      const newAnalysis = analyzeHRV(data.readings, data.heartRateReadings);
      setAnalysis(newAnalysis);
    } catch (error) {
      console.warn('Failed to load HRV data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: HRVSettings) => {
    try {
      await AsyncStorage.setItem(HRV_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.warn('Failed to save HRV settings:', error);
    }
  };

  /**
   * Enable HRV integration (request permissions)
   */
  const enableHRV = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      // Android would need Google Fit integration
      console.warn('HRV integration only supported on iOS');
      return false;
    }

    const hasPermission = await requestHealthKitPermission();
    
    const newSettings: HRVSettings = {
      ...settings,
      enabled: hasPermission,
      hasPermission,
    };
    
    await saveSettings(newSettings);

    if (hasPermission) {
      // Sync immediately after enabling
      await syncNow();
    }

    return hasPermission;
  }, [settings]);

  /**
   * Disable HRV integration
   */
  const disableHRV = useCallback(async () => {
    await saveSettings({
      ...settings,
      enabled: false,
    });
  }, [settings]);

  /**
   * Sync HRV data from HealthKit
   */
  const syncNow = useCallback(async () => {
    if (!settings.enabled || !settings.hasPermission) return;
    
    setIsSyncing(true);
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days

      // Fetch from HealthKit
      const [hrvReadings, hrReadings] = await Promise.all([
        fetchHealthKitHRV(startDate, endDate),
        fetchHealthKitRestingHR(startDate, endDate),
      ]);

      // Merge with existing data (avoid duplicates)
      const existingTimestamps = new Set(dataRef.current.readings.map(r => r.timestamp));
      const newHRV = hrvReadings.filter(r => !existingTimestamps.has(r.timestamp));
      
      const existingHRTimestamps = new Set(dataRef.current.heartRateReadings.map(r => r.timestamp));
      const newHR = hrReadings.filter(r => !existingHRTimestamps.has(r.timestamp));

      // Update stored data
      const updatedReadings = [...dataRef.current.readings, ...newHRV];
      const updatedHRReadings = [...dataRef.current.heartRateReadings, ...newHR];
      
      dataRef.current = {
        readings: updatedReadings,
        heartRateReadings: updatedHRReadings,
        lastAnalysis: null,
      };

      // Save to storage
      await Promise.all([
        saveHRVReadings(updatedReadings),
        saveHRReadings(updatedHRReadings),
      ]);

      // Update settings with sync date
      await saveSettings({
        ...settings,
        lastSyncDate: new Date().toISOString(),
      });

      // Re-analyze
      const newAnalysis = analyzeHRV(updatedReadings, updatedHRReadings);
      setAnalysis(newAnalysis);
    } catch (error) {
      console.warn('HRV sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [settings]);

  /**
   * Add manual HRV reading (from third-party device)
   */
  const addManualHRV = useCallback(async (value: number) => {
    const reading: HRVReading = {
      value,
      timestamp: new Date().toISOString(),
      source: 'manual',
    };

    const updatedReadings = [...dataRef.current.readings, reading];
    dataRef.current.readings = updatedReadings;
    
    await saveHRVReadings(updatedReadings);
    
    const newAnalysis = analyzeHRV(updatedReadings, dataRef.current.heartRateReadings);
    setAnalysis(newAnalysis);
  }, []);

  /**
   * Record HRV before and after a session
   */
  const recordSessionHRV = useCallback(async (preSessionHRV: number, postSessionHRV: number) => {
    const now = new Date();
    
    const preReading: HRVReading = {
      value: preSessionHRV,
      timestamp: new Date(now.getTime() - 300000).toISOString(), // 5 min ago
      source: 'session',
    };
    
    const postReading: HRVReading = {
      value: postSessionHRV,
      timestamp: now.toISOString(),
      source: 'session',
    };

    const updatedReadings = [...dataRef.current.readings, preReading, postReading];
    dataRef.current.readings = updatedReadings;
    
    await saveHRVReadings(updatedReadings);
    
    const newAnalysis = analyzeHRV(updatedReadings, dataRef.current.heartRateReadings);
    setAnalysis(newAnalysis);
  }, []);

  return {
    analysis,
    settings,
    isLoading,
    isSyncing,
    enableHRV,
    disableHRV,
    syncNow,
    addManualHRV,
    recordSessionHRV,
  };
}

// ============================================
// UTILITY: Get exercise recommendation based on HRV
// ============================================

export function getHRVBasedRecommendation(analysis: HRVAnalysis): {
  recommendedCategory: 'lugn' | 'fokus' | 'energi';
  intensity: 1 | 2 | 3;
  reason: string;
} {
  const { nervousSystemState, trend } = analysis;

  switch (nervousSystemState) {
    case 'sympathetic':
      return {
        recommendedCategory: 'lugn',
        intensity: 1,
        reason: 'Din HRV indikerar förhöjd stress. Vi rekommenderar mjuk nedreglering.',
      };
    
    case 'balanced':
      if (trend === 'improving') {
        return {
          recommendedCategory: 'fokus',
          intensity: 2,
          reason: 'Bra balans! Perfekt för fokusövningar.',
        };
      }
      return {
        recommendedCategory: 'lugn',
        intensity: 2,
        reason: 'Stabil HRV. Både lugn och fokus passar dig.',
      };
    
    case 'parasympathetic':
      return {
        recommendedCategory: 'fokus',
        intensity: 2,
        reason: 'God återhämtning! Du har utrymme för fokusövningar.',
      };
    
    default:
      return {
        recommendedCategory: 'lugn',
        intensity: 1,
        reason: 'Vi börjar mjukt tills vi lär känna ditt nervsystem.',
      };
  }
}
