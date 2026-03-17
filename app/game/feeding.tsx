import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedingGame() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Feed the Animal</Text>
      <Text style={styles.subtitle}>Drag treats to feed!</Text>
      {/* TODO: Phase 6 — Full feeding mechanic */}
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
