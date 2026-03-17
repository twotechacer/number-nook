import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BubblesGame() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pop the Bubbles</Text>
      <Text style={styles.subtitle}>Tap bubbles to pop them!</Text>
      {/* TODO: Phase 5 — Full bubbles mechanic */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E30',
  },
  subtitle: {
    fontSize: 16,
    color: '#7A6D5A',
  },
});
