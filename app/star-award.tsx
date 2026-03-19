import { useEffect, useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import { Sparkles } from '@/components/ui/Sparkles';
import { getRandomCorrectPhrase, getMilestoneMessage } from '@/data/phrases';
import { playSound } from '@/utils/audio';
import { COLORS } from '@/data/colors';

export default function StarAward() {
  const params = useLocalSearchParams<{ number: string; floorId: string }>();
  const number = parseInt(params.number || '0', 10);
  const childName = useGameStore((s) => s.childName);
  const totalStars = useGameStore((s) => s.totalStars);

  // Pick a random phrase once on mount
  const [phrase] = useState(() => getRandomCorrectPhrase(childName || undefined));
  const milestone = getMilestoneMessage(totalStars);

  // Play star sound on mount
  useEffect(() => {
    playSound('star_earned');
  }, []);

  // Auto-advance after 2 seconds (3s if milestone)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (router.canGoBack()) router.back();
    }, milestone ? 3000 : 2000);
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
        <Text style={styles.title}>{phrase}</Text>
        <Text style={styles.subtitle}>You earned a star!</Text>

        {milestone && (
          <>
            <Text style={styles.milestoneTitle}>{milestone.title}</Text>
            <Text style={styles.milestoneSubtitle}>{milestone.subtitle}</Text>
          </>
        )}

        <Text style={styles.hint}>tap anywhere to continue</Text>
      </SafeAreaView>

      {/* Celebration sparkles */}
      <Sparkles trigger={1} count={milestone ? 14 : 10} spread={100} />
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
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textPrimary + 'CC',
    marginBottom: 16,
  },
  milestoneTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  milestoneSubtitle: {
    fontSize: 16,
    color: COLORS.primary + 'CC',
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: COLORS.textPrimary + '80',
    fontStyle: 'italic',
  },
});
