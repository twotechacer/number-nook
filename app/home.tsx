import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Number Nook</Text>
        <Text style={styles.subtitle}>pick a floor to explore</Text>
        {/* TODO: Phase 2 — 3 FloorCards + star counter */}
        <View style={styles.floorPlaceholder}>
          <Text style={styles.floorText}>🐻 Floor 1 · 1–10</Text>
        </View>
        <View style={[styles.floorPlaceholder, { backgroundColor: '#EFD070' }]}>
          <Text style={styles.floorText}>🐦 Floor 2 · 11–30</Text>
        </View>
        <View style={[styles.floorPlaceholder, { backgroundColor: '#C8B8E8' }]}>
          <Text style={styles.floorText}>🐰 Floor 3 · 31–50</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E30',
  },
  subtitle: {
    fontSize: 16,
    color: '#7A6D5A',
    marginBottom: 24,
  },
  floorPlaceholder: {
    backgroundColor: '#5A9A70',
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    opacity: 0.8,
  },
  floorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E30',
  },
});
