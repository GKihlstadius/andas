// ============================================
// ANDAS - INTERNATIONALIZATION (i18n)
// ============================================
// Supports Swedish (default) and English

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { sv } from './translations/sv';
import { en } from './translations/en';

// Supported languages
export type Language = 'sv' | 'en';

// Translation type (based on Swedish as reference)
export type Translations = typeof sv;

// Storage key
const LANGUAGE_STORAGE_KEY = '@andas_language';

// All translations
const translations: Record<Language, Translations> = {
  sv,
  en,
};

// Context type
interface I18nContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => Promise<void>;
  isLoading: boolean;
}

// Create context
const I18nContext = createContext<I18nContextType | null>(null);

// Detect system language
function getSystemLanguage(): Language {
  const locale = Localization.locale;
  if (locale.startsWith('sv')) return 'sv';
  if (locale.startsWith('en')) return 'en';
  // Default to Swedish (app's primary language)
  return 'sv';
}

// Provider component
interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>('sv');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && (saved === 'sv' || saved === 'en')) {
        setLanguageState(saved);
      } else {
        // Use system language
        const systemLang = getSystemLanguage();
        setLanguageState(systemLang);
      }
    } catch (error) {
      // Fallback to Swedish
      setLanguageState('sv');
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
      // Still update the state even if save fails
      setLanguageState(lang);
    }
  }, []);

  // Get translations for current language
  const t = translations[language];

  return (
    <I18nContext.Provider value={{ language, t, setLanguage, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use translations
export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}

// Utility: interpolate strings with variables
// Usage: interpolate('Hello {{name}}', { name: 'World' }) => 'Hello World'
export function interpolate(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return vars[key]?.toString() ?? match;
  });
}

// Export types and translations for direct access if needed
export { sv, en };
export type { Translations };
