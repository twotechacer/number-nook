import { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import { COLORS } from '@/data/colors';

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function Settings() {
  const childName = useGameStore((s) => s.childName);
  const settings = useGameStore((s) => s.settings);
  const floorUnlocks = useGameStore((s) => s.floorUnlocks);
  const setChildName = useGameStore((s) => s.setChildName);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const overrideFloorUnlock = useGameStore((s) => s.overrideFloorUnlock);
  const resetProgress = useGameStore((s) => s.resetProgress);

  const [editName, setEditName] = useState(childName);

  const handleSaveName = () => {
    setChildName(editName.trim());
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Progress?',
      'This will erase all stars, mastery, and session history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.backButton} />
        </View>

        {/* Child Name */}
        <Text style={styles.sectionTitle}>Child's Name</Text>
        <View style={styles.nameRow}>
          <TextInput
            testID="name-edit-input"
            style={styles.nameInput}
            value={editName}
            onChangeText={setEditName}
            placeholder="Enter name"
            maxLength={20}
          />
          <Pressable
            testID="save-name-button"
            style={[styles.saveButton, editName.trim() === childName && styles.saveButtonDisabled]}
            onPress={handleSaveName}
            disabled={editName.trim() === childName}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>

        {/* Sound Settings */}
        <Text style={styles.sectionTitle}>Sound</Text>
        <SettingRow label="Sound effects">
          <Switch
            testID="sound-toggle"
            value={settings.soundEnabled}
            onValueChange={(v) => updateSettings({ soundEnabled: v })}
            trackColor={{ true: COLORS.primary, false: '#ccc' }}
          />
        </SettingRow>
        <SettingRow label="Ambient sounds">
          <Switch
            testID="ambient-toggle"
            value={settings.ambientEnabled}
            onValueChange={(v) => updateSettings({ ambientEnabled: v })}
            trackColor={{ true: COLORS.primary, false: '#ccc' }}
          />
        </SettingRow>

        {/* Floor Overrides */}
        <Text style={styles.sectionTitle}>Floor Unlocks</Text>
        <SettingRow label="Auto-unlock floors">
          <Switch
            testID="auto-unlock-toggle"
            value={settings.autoFloorUnlock}
            onValueChange={(v) => updateSettings({ autoFloorUnlock: v })}
            trackColor={{ true: COLORS.primary, false: '#ccc' }}
          />
        </SettingRow>
        <SettingRow label="Floor 2 (override)">
          <Switch
            testID="floor2-override"
            value={floorUnlocks.floor2}
            onValueChange={(v) => overrideFloorUnlock('floor2', v)}
            trackColor={{ true: COLORS.celebration, false: '#ccc' }}
          />
        </SettingRow>
        <SettingRow label="Floor 3 (override)">
          <Switch
            testID="floor3-override"
            value={floorUnlocks.floor3}
            onValueChange={(v) => overrideFloorUnlock('floor3', v)}
            trackColor={{ true: COLORS.floor3, false: '#ccc' }}
          />
        </SettingRow>

        {/* Report Link */}
        <Text style={styles.sectionTitle}>Progress</Text>
        <Pressable
          testID="view-report-button"
          style={styles.reportButton}
          onPress={() => router.push('/(parent)/report')}
        >
          <Text style={styles.reportButtonText}>View Progress Report</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
        <Pressable testID="reset-button" style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset All Progress</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 20, color: COLORS.textPrimary },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 24, marginBottom: 10,
  },
  nameRow: { flexDirection: 'row', gap: 10 },
  nameInput: {
    flex: 1, height: 48, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 16, fontSize: 17, color: COLORS.textPrimary, backgroundColor: COLORS.white,
  },
  saveButton: {
    height: 48, paddingHorizontal: 20, borderRadius: 12, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  settingLabel: { fontSize: 16, color: COLORS.textPrimary },
  reportButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary + '15', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  reportButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  arrow: { fontSize: 18, color: COLORS.primary },
  dangerTitle: { color: COLORS.wrong },
  resetButton: {
    backgroundColor: COLORS.wrong + '15', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.wrong + '30',
  },
  resetButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.wrong },
});
