import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ParentReport() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Parent Report</Text>
      <Text style={styles.subtitle}>this week</Text>
      {/* TODO: Phase 7 — Mastery grid, session chart, suggestions */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E30',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#7A6D5A',
    textAlign: 'center',
  },
});
