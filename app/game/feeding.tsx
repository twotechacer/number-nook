import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useFeedingGame } from '@/hooks/useFeedingGame';
import { Treat } from '@/components/game/Treat';
import { AnimalTummy, AnimalExpression } from '@/components/game/AnimalTummy';
import { NumeralChoice } from '@/components/game/NumeralChoice';
import { Sparkles } from '@/components/ui/Sparkles';
import { getAnimalForNumber } from '@/data/animals';
import { COLORS } from '@/data/colors';
import { FloorId } from '@/types/game';
import { useGameStore } from '@/store/useGameStore';
import { speakWrongFeedback, speakCorrectFeedback } from '@/utils/voice';

export default function FeedingGame() {
  const params = useLocalSearchParams<{ floorId: string }>();
  const floorId = (params.floorId || 'floor1') as FloorId;
  const childName = useGameStore((s) => s.childName);

  const {
    phase, targetNumber, fedCount, fedIndices, answerChoices, attempts,
    startRound, feedTreat, undoTreat, selectAnswer, retryAnswer,
    startTummyFull, completeRound,
  } = useFeedingGame(floorId);

  const [showHint, setShowHint] = useState(false);

  // Start first round on mount
  useEffect(() => {
    if (phase === 'idle') startRound();
  }, [phase, startRound]);

  // Auto-retry after wrong answer
  useEffect(() => {
    if (phase === 'wrong') {
      const voiceTimer = setTimeout(() => speakWrongFeedback(attempts), 200);
      if (attempts >= 1) setShowHint(true);
      const timer = setTimeout(retryAnswer, 800);
      return () => {
        clearTimeout(voiceTimer);
        clearTimeout(timer);
      };
    }
  }, [phase, retryAnswer, attempts]);

  // Trigger tummy-full after correct
  useEffect(() => {
    if (phase === 'correct') {
      const voiceTimer = setTimeout(() => speakCorrectFeedback(targetNumber, childName || undefined), 200);
      setShowHint(false);
      const timer = setTimeout(startTummyFull, 300);
      return () => {
        clearTimeout(voiceTimer);
        clearTimeout(timer);
      };
    }
  }, [phase, startTummyFull, targetNumber, childName]);

  // Reset when coming back from star award
  useEffect(() => {
    if (phase === 'complete') {
      const timer = setTimeout(startRound, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, startRound]);

  const [sparkleTrigger, setSparkleTrigger] = useState(0);

  useEffect(() => {
    if (phase === 'correct' || phase === 'tummy_full') {
      setSparkleTrigger((prev) => prev + 1);
    }
  }, [phase]);

  const animal = targetNumber > 0 ? getAnimalForNumber(targetNumber) : null;

  // Determine animal expression
  const expression: AnimalExpression = useMemo(() => {
    if (phase === 'tummy_full') return 'full';
    if (phase === 'correct') return 'happy';
    if (fedCount > 0 && phase === 'feeding') return 'eating';
    return 'waiting';
  }, [phase, fedCount]);

  // Track which treats are fed (by actual tapped index)
  const fedSet = useMemo(() => new Set(fedIndices), [fedIndices]);

  const handleTummyFullComplete = () => {
    router.push({
      pathname: '/star-award',
      params: { number: String(targetNumber), floorId },
    });
    completeRound();
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
          <Text style={styles.headerTitle}>Feed {animal?.name.split(' ')[0]}</Text>
          <Text style={styles.headerSubtitle}>
            Give {animal?.name.split(' ')[0]} exactly {targetNumber} {animal?.treat}
            {targetNumber > 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={styles.headerEmoji}>{animal?.emoji}</Text>
      </View>

      {/* Animal area */}
      <AnimalTummy
        emoji={animal?.emoji || '🐻'}
        name={animal?.name || 'Animal'}
        treatEmoji={animal?.treatEmoji || '🍎'}
        expression={expression}
        fedCount={fedCount}
        targetNumber={targetNumber}
        onTummyFullComplete={handleTummyFullComplete}
      />

      {/* Treat tray — only during feeding phase */}
      {phase === 'feeding' && (
        <View style={styles.treatSection}>
          <Text style={styles.treatInstruction}>
            Tap a {animal?.treat} to feed {animal?.name.split(' ')[0]}
          </Text>
          <View style={styles.treatTray}>
            {Array.from({ length: targetNumber }, (_, i) => (
              <Treat
                key={i}
                index={i}
                emoji={animal?.treatEmoji || '🍎'}
                isFed={fedSet.has(i)}
                onTap={() => feedTreat(i)}
              />
            ))}
          </View>
          {fedCount > 0 && (
            <Pressable testID="undo-button" style={styles.undoButton} onPress={undoTreat}>
              <Text style={styles.undoText}>↩ Undo last</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Answer phase */}
      {(phase === 'answering' || phase === 'wrong') && (
        <View style={styles.answerSection}>
          <Text style={styles.questionText}>
            How many {animal?.treat}s did you feed {animal?.name.split(' ')[0]}?
          </Text>
          <View style={styles.choicesRow}>
            {answerChoices.map((choice) => (
              <NumeralChoice
                key={choice}
                value={choice}
                onSelect={selectAnswer}
                disabled={phase !== 'answering'}
                isCorrect={null}
                isHinted={showHint && choice === targetNumber}
              />
            ))}
          </View>
          {phase === 'wrong' && (
            <Text style={styles.tryAgain}>Hmm, let's try again!</Text>
          )}
        </View>
      )}

      {/* Sparkles */}
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
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  headerEmoji: {
    fontSize: 32,
  },
  treatSection: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  treatInstruction: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  treatTray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 10,
  },
  undoButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  undoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  answerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
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
});
