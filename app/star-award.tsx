import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StarAward() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.star}>⭐</Text>
      <Text style={styles.title}>You earned a star!</Text>
      {/* TODO: Phase 3 — Star burst animation + auto-advance */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0C84A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E30',
  },
});
