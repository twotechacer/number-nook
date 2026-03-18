import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useCountingGame } from '@/hooks/useCountingGame';
import { CountableObject } from '@/components/game/CountableObject';
import { TeensFrame } from '@/components/game/TeensFrame';
import { NumeralChoice } from '@/components/game/NumeralChoice';
import { Sparkles } from '@/components/ui/Sparkles';
import { getAnimalForNumber } from '@/data/animals';
import { getRandomWrongPhrase } from '@/data/phrases';
import { COLORS } from '@/data/colors';
import { FloorId } from '@/types/game';

// Object emojis per floor theme
const OBJECT_EMOJIS: Record<string, string[]> = {
  floor1: ['🍎', '🍊', '🌰', '🍐', '🍋'],
  floor2: ['🌸', '🌼', '🌻', '🌺', '🌷'],
  floor3: ['⭐', '🌙', '💫', '✨', '🌟'],
};

export default function CountingGame() {
  const params = useLocalSearchParams<{ floorId: string }>();
  const floorId = (params.floorId || 'floor1') as FloorId;

  const {
    phase, targetNumber, tappedCount, answerChoices, attempts,
    startRound, tapObject, selectAnswer, retryAnswer, completeRound,
  } = useCountingGame(floorId);

  // Start first round on mount
  useEffect(() => {
    if (phase === 'idle') startRound();
  }, [phase, startRound]);

  // Auto-retry after wrong answer shake
  useEffect(() => {
    if (phase === 'wrong') {
      setWrongPhrase(getRandomWrongPhrase());
      const timer = setTimeout(retryAnswer, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, retryAnswer]);

  // Navigate to star award on correct
  useEffect(() => {
    if (phase === 'correct') {
      const timer = setTimeout(() => {
        router.push({
          pathname: '/star-award',
          params: { number: String(targetNumber), floorId },
        });
        completeRound();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, targetNumber, floorId, completeRound]);

  // Reset when coming back from star award
  useEffect(() => {
    if (phase === 'complete') {
      const timer = setTimeout(startRound, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, startRound]);

  const [sparkleTrigger, setSparkleTrigger] = useState(0);
  const [wrongPhrase, setWrongPhrase] = useState('');

  // Sparkle on correct answer
  useEffect(() => {
    if (phase === 'correct') {
      setSparkleTrigger((prev) => prev + 1);
    }
  }, [phase]);

  const animal = targetNumber > 0 ? getAnimalForNumber(targetNumber) : null;
  const emojis = OBJECT_EMOJIS[floorId] || OBJECT_EMOJIS.floor1;
  const objectEmoji = emojis[targetNumber % emojis.length];

  // Track which objects are tapped
  const tappedSet = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < tappedCount; i++) set.add(i);
    return set;
  }, [tappedCount]);

  if (phase === 'idle') return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Counting</Text>
          <Text style={styles.headerSubtitle}>How many {objectEmoji}?</Text>
        </View>
        <Text style={styles.headerEmoji}>{animal?.emoji}</Text>
      </View>

      {/* Object field — use TeensFrame for 11-19, regular layout otherwise */}
      {targetNumber >= 11 && targetNumber <= 19 ? (
        <TeensFrame
          targetNumber={targetNumber}
          tappedSet={tappedSet}
          emoji={objectEmoji}
          onTap={tapObject}
        />
      ) : (
        <View testID="object-field" style={styles.objectField}>
          {Array.from({ length: targetNumber }, (_, i) => (
            <CountableObject
              key={i}
              index={i}
              isTapped={tappedSet.has(i)}
              emoji={objectEmoji}
              onTap={tapObject}
            />
          ))}
        </View>
      )}

      {/* Counter */}
      <View testID="counter-container" style={styles.counterContainer}>
        <Text testID="tap-counter" style={styles.counter}>{tappedCount}</Text>
        <Text style={styles.counterLabel}>tapped so far</Text>
      </View>

      {/* Answer phase */}
      {(phase === 'answering' || phase === 'wrong' || phase === 'correct') && (
        <View style={styles.answerSection}>
          <Text style={styles.questionText}>How many did you count?</Text>
          <View style={styles.choicesRow}>
            {answerChoices.map((choice) => (
              <NumeralChoice
                key={choice}
                value={choice}
                onSelect={selectAnswer}
                disabled={phase !== 'answering'}
                isCorrect={
                  phase === 'correct' && choice === targetNumber
                    ? true
                    : phase === 'wrong' && choice !== targetNumber
                    ? null
                    : null
                }
              />
            ))}
          </View>
          {phase === 'wrong' && (
            <Text style={styles.tryAgain}>{wrongPhrase}</Text>
          )}
        </View>
      )}

      {/* Subtle sparkles on correct answer */}
      <Sparkles trigger={sparkleTrigger} count={8} spread={80} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
  },
  headerEmoji: {
    fontSize: 32,
  },
  objectField: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 10,
    position: 'relative',
  },
  counterContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  counter: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  counterLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  answerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  choicesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  tryAgain: {
    fontSize: 16,
    color: COLORS.wrong,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
