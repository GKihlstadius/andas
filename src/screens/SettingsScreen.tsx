// ============================================
// ANDAS - SETTINGS SCREEN
// ============================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../data/constants';
import { useUserState } from '../state/userState';
import { useTranslation } from '../i18n';
import { AudioSettings, DEFAULT_AUDIO_SETTINGS, BackgroundSoundType, loadAudioSettings, saveAudioSettings } from '../audio/audioSystem';
import { useHRV } from '../hrv';
import { shareTherapistReport } from '../therapist';

function ChevronIcon({ size = 20, color = colors.text.muted }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
}

function SettingRow({ label, description, value, onPress, showChevron }: { label: string; description?: string; value?: React.ReactNode; onPress?: () => void; showChevron?: boolean }) {
  const content = (
    <View style={styles.settingRow}>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <View style={styles.settingValue}>
        {value}
        {showChevron && <ChevronIcon />}
      </View>
    </View>
  );
  if (onPress) return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  return content;
}

function SwitchRow({ label, description, value, onValueChange }: { label: string; description?: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.text.muted, true: colors.accent.sageLight }} thumbColor={value ? colors.accent.sage : colors.surface.elevated} />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export function SettingsScreen() {
  const { userState, resetUserState } = useUserState();
  const { t, language, setLanguage } = useTranslation();
  const { analysis: hrvAnalysis, settings: hrvSettings, enableHRV, disableHRV, isSyncing } = useHRV();
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  useEffect(() => { loadAudioSettings().then(setAudioSettings); }, []);

  const updateAudioSetting = useCallback(async (key: keyof AudioSettings, value: any) => {
    const newSettings = { ...audioSettings, [key]: value };
    setAudioSettings(newSettings);
    await saveAudioSettings(newSettings);
  }, [audioSettings]);

  const handleLanguagePress = useCallback(() => {
    Alert.alert(t.settings.language.title, '', [
      { text: t.settings.language.sv, onPress: () => setLanguage('sv') },
      { text: t.settings.language.en, onPress: () => setLanguage('en') },
      { text: t.common.cancel, style: 'cancel' }
    ]);
  }, [t, setLanguage]);

  const handleBackgroundSoundPress = useCallback(() => {
    const options: BackgroundSoundType[] = ['none', 'rain', 'ocean', 'forest', 'white'];
    const labels = [t.settings.audio.backgroundType.none, t.settings.audio.backgroundType.rain, t.settings.audio.backgroundType.ocean, t.settings.audio.backgroundType.forest, t.settings.audio.backgroundType.white];
    Alert.alert(t.settings.audio.backgroundSounds, '', [...options.map((opt, i) => ({ text: labels[i], onPress: () => updateAudioSetting('backgroundSound', opt) })), { text: t.common.cancel, style: 'cancel' as const }]);
  }, [t, updateAudioSetting]);

  const handleHRVToggle = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const success = await enableHRV();
      if (!success) Alert.alert(t.common.error, 'Could not enable Apple Health integration.', [{ text: t.common.done }]);
    } else { await disableHRV(); }
  }, [enableHRV, disableHRV, t]);

  const handleGenerateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      const success = await shareTherapistReport(userState, language);
      if (success) Alert.alert(t.settings.therapist.reportGenerated);
    } catch (error) { Alert.alert(t.common.error); } 
    finally { setIsGeneratingReport(false); }
  }, [userState, language, t]);

  const handleReset = useCallback(() => {
    Alert.alert(t.settings.data.resetConfirm.title, t.settings.data.resetConfirm.message, [
      { text: t.settings.data.resetConfirm.cancel, style: 'cancel' },
      { text: t.settings.data.resetConfirm.confirm, style: 'destructive', onPress: resetUserState }
    ]);
  }, [t, resetUserState]);

  const getBackgroundSoundLabel = () => {
    const labels: Record<BackgroundSoundType, string> = { none: t.settings.audio.backgroundType.none, rain: t.settings.audio.backgroundType.rain, ocean: t.settings.audio.backgroundType.ocean, forest: t.settings.audio.backgroundType.forest, white: t.settings.audio.backgroundType.white };
    return labels[audioSettings.backgroundSound];
  };

  const getLanguageLabel = () => language === 'sv' ? t.settings.language.sv : t.settings.language.en;
  const getHRVStatus = () => { if (isSyncing) return t.settings.hrv.status.syncing; if (hrvSettings.enabled) return t.settings.hrv.status.connected; return t.settings.hrv.status.disconnected; };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}><Text style={styles.title}>{t.settings.title}</Text></View>

        <SectionHeader title={t.settings.sections.preferences} />
        <View style={styles.section}>
          <SettingRow label={t.settings.language.title} value={<Text style={styles.valueText}>{getLanguageLabel()}</Text>} onPress={handleLanguagePress} showChevron />
        </View>

        <SectionHeader title={t.settings.sections.audio} />
        <View style={styles.section}>
          <SwitchRow label={t.settings.audio.enabled} description={t.settings.audio.enabledDescription} value={audioSettings.enabled} onValueChange={(v) => updateAudioSetting('enabled', v)} />
          <SwitchRow label={t.settings.audio.haptics} description={t.settings.audio.hapticsDescription} value={audioSettings.hapticsEnabled} onValueChange={(v) => updateAudioSetting('hapticsEnabled', v)} />
          <SettingRow label={t.settings.audio.backgroundSounds} description={t.settings.audio.backgroundSoundsDescription} value={<Text style={styles.valueText}>{getBackgroundSoundLabel()}</Text>} onPress={handleBackgroundSoundPress} showChevron />
        </View>

        <SectionHeader title={t.settings.hrv.title} />
        <View style={styles.section}>
          <SwitchRow label={t.settings.hrv.enabled} description={t.settings.hrv.enabledDescription} value={hrvSettings.enabled} onValueChange={handleHRVToggle} />
          <SettingRow label="Status" value={<View style={styles.statusBadge}>{isSyncing && <ActivityIndicator size="small" color={colors.accent.sage} style={{ marginRight: 8 }} />}<Text style={[styles.statusText, hrvSettings.enabled && styles.statusConnected]}>{getHRVStatus()}</Text></View>} />
          {hrvSettings.enabled && hrvAnalysis.currentHRV && <SettingRow label="HRV" value={<Text style={styles.valueText}>{Math.round(hrvAnalysis.currentHRV)} ms</Text>} />}
        </View>

        <SectionHeader title={t.settings.therapist.title} />
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={handleGenerateReport} disabled={isGeneratingReport}>
            {isGeneratingReport ? <ActivityIndicator size="small" color={colors.surface.elevated} /> : <Text style={styles.actionButtonText}>{t.settings.therapist.generateReport}</Text>}
          </TouchableOpacity>
          <Text style={styles.actionDescription}>{t.settings.therapist.enabledDescription}</Text>
        </View>

        <SectionHeader title={t.settings.sections.data} />
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleReset}><Text style={styles.dangerButtonText}>{t.settings.data.reset}</Text></TouchableOpacity>
          <Text style={styles.dangerDescription}>{t.settings.data.resetDescription}</Text>
        </View>

        <SectionHeader title={t.settings.sections.about} />
        <View style={styles.section}>
          <SettingRow label={t.settings.about.version} value={<Text style={styles.valueText}>1.1.0</Text>} />
        </View>

        <View style={styles.footer}><Text style={styles.footerText}>ANDAS</Text><Text style={styles.footerSubtext}>Trygg breathwork för riktiga liv</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  header: { marginBottom: spacing.xl },
  title: { fontSize: typography.size['2xl'], fontWeight: typography.weight.medium, color: colors.text.primary },
  sectionHeader: { fontSize: typography.size.xs, fontWeight: typography.weight.medium, color: colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm, paddingHorizontal: spacing.xs },
  section: { backgroundColor: colors.surface.elevated, borderRadius: radius.lg, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.bg.secondary },
  settingContent: { flex: 1, marginRight: spacing.md },
  settingLabel: { fontSize: typography.size.base, fontWeight: typography.weight.normal, color: colors.text.primary },
  settingDescription: { fontSize: typography.size.sm, color: colors.text.muted, marginTop: 2 },
  settingValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  valueText: { fontSize: typography.size.base, color: colors.text.secondary },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: typography.size.sm, color: colors.text.muted },
  statusConnected: { color: colors.accent.sage },
  actionButton: { backgroundColor: colors.accent.sage, margin: spacing.md, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  actionButtonText: { fontSize: typography.size.base, fontWeight: typography.weight.medium, color: colors.surface.elevated },
  actionDescription: { fontSize: typography.size.sm, color: colors.text.muted, textAlign: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  dangerButton: { backgroundColor: colors.bg.primary, margin: spacing.md, padding: spacing.md, borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: '#D9534F' },
  dangerButtonText: { fontSize: typography.size.base, fontWeight: typography.weight.medium, color: '#D9534F' },
  dangerDescription: { fontSize: typography.size.sm, color: colors.text.muted, textAlign: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  footer: { alignItems: 'center', marginTop: spacing['2xl'], paddingVertical: spacing.xl },
  footerText: { fontSize: typography.size.lg, fontWeight: typography.weight.medium, color: colors.text.tertiary },
  footerSubtext: { fontSize: typography.size.sm, color: colors.text.muted, marginTop: spacing.xs },
});
