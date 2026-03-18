import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import { COLORS } from '@/data/colors';

export default function StarAward() {
  const params = useLocalSearchParams<{ number: string; floorId: string }>();
  const number = parseInt(params.number || '0', 10);
  const childName = useGameStore((s) => s.childName);

  // Auto-advance after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (router.canGoBack()) router.back();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleTap = () => {
    if (router.canGoBack()) router.back();
  };

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.star}>⭐</Text>
        <Text style={styles.number}>{number}</Text>
        <Text style={styles.title}>
          {childName ? `Well done, ${childName}!` : 'Well done!'}
        </Text>
        <Text style={styles.subtitle}>You earned a star!</Text>
        <Text style={styles.hint}>tap anywhere to continue</Text>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.celebration,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    fontSize: 80,
    marginBottom: 8,
  },
  number: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textPrimary + 'CC',
    marginBottom: 24,
  },
  hint: {
    fontSize: 14,
    color: COLORS.textPrimary + '80',
    fontStyle: 'italic',
  },
});
