import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      {/* TODO: Phase 7 — Sound toggle, ambient, voice, floor override, name edit, reset */}
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
});
