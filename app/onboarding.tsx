import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Onboarding() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Number Nook</Text>
        <Text style={styles.subtitle}>What's your little one's name?</Text>
        {/* TODO: Phase 2 — Text input + "Let's go!" button */}
        <Text style={styles.placeholder}>Coming soon...</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E30',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#7A6D5A',
    marginBottom: 24,
  },
  placeholder: {
    fontSize: 16,
    color: '#7A6D5A',
    fontStyle: 'italic',
  },
});
