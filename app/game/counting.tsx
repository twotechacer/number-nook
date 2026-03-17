import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CountingGame() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Counting Game</Text>
      <Text style={styles.subtitle}>Tap each object to count!</Text>
      {/* TODO: Phase 3 — Full counting mechanic */}
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
