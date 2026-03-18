import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import { COLORS } from '@/data/colors';

function LoadingSplash() {
  return (
    <View style={styles.splash}>
      <Text style={styles.splashEmoji}>🌳</Text>
      <Text style={styles.splashTitle}>Number Nook</Text>
      <ActivityIndicator color={COLORS.primary} style={styles.spinner} />
    </View>
  );
}

export default function Index() {
  const childName = useGameStore((s) => s.childName);
  const isHydrated = useGameStore((s) => s.isHydrated);

  if (!isHydrated) return <LoadingSplash />;
  if (childName) return <Redirect href="/home" />;
  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashEmoji: { fontSize: 64, marginBottom: 8 },
  splashTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  spinner: { marginTop: 8 },
});
