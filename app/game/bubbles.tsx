import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useBubblesGame } from '@/hooks/useBubblesGame';
import { BubbleField } from '@/components/game/BubbleField';
import { NumeralChoice } from '@/components/game/NumeralChoice';
import { Sparkles } from '@/components/ui/Sparkles';
import { getAnimalForNumber } from '@/data/animals';
import { getRandomWrongPhrase } from '@/data/phrases';
import { COLORS } from '@/data/colors';
import { FloorId } from '@/types/game';
import { MAX_ANSWER_ATTEMPTS } from '@/data/thresholds';

export default function BubblesGame() {
  const params = useLocalSearchParams<{ floorId: string }>();
  const floorId = (params.floorId || 'floor1') as FloorId;

  const {
    phase, targetNumber, poppedCount, answerChoices, attempts,
    startRound, popBubble, selectAnswer, retryAnswer, restartSameRound, completeRound,
  } = useBubblesGame(floorId);

  const [roundNumber, setRoundNumber] = useState(1);

  // Start first round on mount
  useEffect(() => {
    if (phase === 'idle') startRound();
  }, [phase, startRound]);

  // Increment round counter on new round
  useEffect(() => {
    if (phase === 'complete') {
      setRoundNumber((prev) => prev + 1);
    }
  }, [phase]);

  // Auto-retry after wrong answer (only if not at max attempts)
  useEffect(() => {
    if (phase === 'wrong') {
      setWrongPhrase(getRandomWrongPhrase());
      if (attempts < MAX_ANSWER_ATTEMPTS) {
        const timer = setTimeout(retryAnswer, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, retryAnswer, attempts]);

  // Strike-out: auto-advance after delay
  useEffect(() => {
    if (phase === 'strike_out') {
      const timer = setTimeout(restartSameRound, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, restartSameRound]);

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

  useEffect(() => {
    if (phase === 'correct') {
      setSparkleTrigger((prev) => prev + 1);
    }
  }, [phase]);

  const animal = targetNumber > 0 ? getAnimalForNumber(targetNumber) : null;
  const bubbleColor = animal?.bubbleColor || '#A4D2E1';
  const remaining = targetNumber - poppedCount;

  // Progress message
  const getProgressMessage = () => {
    if (poppedCount === 0) return `Pop ${targetNumber} bubbles!`;
    if (remaining <= 0) return 'You popped them all!';
    if (poppedCount >= Math.ceil(targetNumber / 2)) return 'Halfway there!';
    return `${poppedCount} popped, ${remaining} to go`;
  };

  if (phase === 'idle') return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable testID="back-button" style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pop the Bubbles</Text>
          <Text style={styles.headerSubtitle}>{getProgressMessage()}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerEmoji}>{animal?.emoji}</Text>
          <Text style={styles.roundBadge}>Round {roundNumber}</Text>
        </View>
      </View>

      {/* Counter */}
      <View testID="pop-counter-container" style={styles.counterContainer}>
        <Text testID="pop-counter" style={styles.counter}>{poppedCount}</Text>
        <Text style={styles.counterLabel}>popped so far</Text>
      </View>

      {/* Bubble field — only during popping phase */}
      {(phase === 'popping') && (
        <BubbleField
          count={targetNumber}
          poppedCount={poppedCount}
          color={bubbleColor}
          onPop={popBubble}
        />
      )}

      {/* Answer phase */}
      {(phase === 'answering' || phase === 'wrong' || phase === 'correct') && (
        <View style={styles.answerSection}>
          <Text style={styles.allPopped}>You popped them all! 🎉</Text>
          <Text style={styles.questionText}>How many bubbles did you pop?</Text>
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
          {/* Strike indicator */}
          <View style={styles.strikeRow}>
            {Array.from({ length: MAX_ANSWER_ATTEMPTS }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.strikeDot,
                  i < attempts ? styles.strikeDotFilled : styles.strikeDotEmpty,
                ]}
              />
            ))}
          </View>
          {phase === 'wrong' && (
            <Text style={styles.tryAgain}>{wrongPhrase}</Text>
          )}
        </View>
      )}

      {/* Strike-out overlay */}
      {phase === 'strike_out' && (
        <View style={styles.strikeOutOverlay}>
          <Text style={styles.strikeOutText}>Let's try again!</Text>
        </View>
      )}

      {/* Sparkles on correct */}
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
    color: '#A4D2E1',
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 32,
  },
  roundBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  counterContainer: {
    alignItems: 'center',
    paddingVertical: 4,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  allPopped: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
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
  strikeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  strikeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  strikeDotFilled: {
    backgroundColor: COLORS.textPrimary,
  },
  strikeDotEmpty: {
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
    backgroundColor: 'transparent',
  },
  strikeOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  strikeOutText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E8A838',
  },
});
