// ============================================
// ANDAS v1.1.0 - MAIN APP ENTRY
// ============================================
// Breathwork app focused on nervous system safety
// Now with: Audio, HRV, i18n, Progress tracking, Therapist reports
// ============================================

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserStateProvider } from './src/state/userState';
import { I18nProvider } from './src/i18n';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <UserStateProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </UserStateProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}
