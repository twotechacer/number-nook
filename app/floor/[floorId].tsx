import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FloorMenu() {
  const { floorId } = useLocalSearchParams<{ floorId: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Floor {floorId}</Text>
      <Text style={styles.subtitle}>Choose a game to play</Text>
      {/* TODO: Phase 2 — 3 mechanic cards with lock states */}
      <Text style={styles.placeholder}>🔢 Count it!</Text>
      <Text style={styles.placeholder}>🍯 Feed the animals!</Text>
      <Text style={styles.placeholder}>🫧 Pop the bubbles!</Text>
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
  },
  subtitle: {
    fontSize: 16,
    color: '#7A6D5A',
    marginBottom: 24,
  },
  placeholder: {
    fontSize: 18,
    color: '#2C3E30',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(90,154,112,0.15)',
    borderRadius: 12,
    marginBottom: 12,
  },
});
