import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import { COLORS } from '@/data/colors';

export default function Onboarding() {
  const [name, setName] = useState('');
  const setChildName = useGameStore((s) => s.setChildName);

  const handleStart = () => {
    if (name.trim()) {
      setChildName(name.trim());
    }
    router.replace('/home');
  };

  const handleSkip = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.emoji}>🌳</Text>
        <Text style={styles.title}>Number Nook</Text>
        <Text style={styles.subtitle}>What's your little one's name?</Text>

        <TextInput
          style={styles.input}
          placeholder="Type their name here..."
          placeholderTextColor={COLORS.textSecondary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleStart}
          maxLength={20}
        />

        <Pressable
          style={[styles.button, !name.trim() && styles.buttonMuted]}
          onPress={handleStart}
        >
          <Text style={styles.buttonText}>
            {name.trim() ? `Let's go, ${name.trim()}!` : "Let's go!"}
          </Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: 20,
    fontSize: 20,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonMuted: {
    backgroundColor: COLORS.primary + 'CC',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});
