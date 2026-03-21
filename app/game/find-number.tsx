import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useFindNumberGame } from '@/hooks/useFindNumberGame';
import { FindNumberButton } from '@/components/game/FindNumberButton';
import { Sparkles } from '@/components/ui/Sparkles';
import { getAnimalForNumber } from '@/data/animals';
import { getFloorById } from '@/data/floors';
import { COLORS } from '@/data/colors';
import { MAX_ANSWER_ATTEMPTS } from '@/data/thresholds';
import { FloorId } from '@/types/game';
import { speakFindPrompt, speakFindRetry, stopSpeech } from '@/utils/voice';

export default function FindNumberGame() {
  const params = useLocalSearchParams<{ floorId: string }>();
  const floorId = (params.floorId || 'floor1') as FloorId;

  const {
    phase, targetNumber, choices, attempts, round,
    startRound, selectNumber, retryAnswer, restartSameRound, nextRound,
  } = useFindNumberGame(floorId);

  const [wrongChoice, setWrongChoice] = useState<number | null>(null);
  const [sparkleTrigger, setSparkleTrigger] = useState(0);
  const screenFocused = useRef(true);
  const pendingSpeak = useRef(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubFocus = navigation.addListener('focus', () => {
      screenFocused.current = true;
      if (pendingSpeak.current && targetNumber > 0) {
        pendingSpeak.current = false;
        speakFindPrompt(targetNumber);
      }
    });
    const unsubBlur = navigation.addListener('blur', () => {
      screenFocused.current = false;
    });
    return () => { unsubFocus(); unsubBlur(); };
  }, [navigation, targetNumber]);

  // Start first round on mount
  useEffect(() => {
    if (phase === 'idle') startRound();
  }, [phase, startRound]);

  // Auto-play voice on round start — only if screen is focused
  useEffect(() => {
    if (phase === 'listening' && targetNumber > 0) {
      if (screenFocused.current) {
        speakFindPrompt(targetNumber);
      } else {
        pendingSpeak.current = true;
      }
    }
  }, [phase, targetNumber, round]);

  // Handle wrong answer: speak retry and transition back to listening
  useEffect(() => {
    if (phase === 'wrong') {
      speakFindRetry(targetNumber);
      const timer = setTimeout(() => {
        setWrongChoice(null);
        retryAnswer();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, targetNumber, retryAnswer]);

  // Handle correct answer: stop speech, navigate to star award
  useEffect(() => {
    if (phase === 'correct') {
      stopSpeech();
      setSparkleTrigger((prev) => prev + 1);
      const timer = setTimeout(() => {
        router.push({
          pathname: '/star-award',
          params: { number: String(targetNumber), floorId },
        });
        nextRound();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, targetNumber, floorId, nextRound]);

  // Handle strike-out: auto-restart after 1500ms
  useEffect(() => {
    if (phase === 'strike_out') {
      const timer = setTimeout(() => {
        setWrongChoice(null);
        restartSameRound();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, restartSameRound]);

  // Reset when coming back from star award
  useEffect(() => {
    if (phase === 'complete') {
      const timer = setTimeout(startRound, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, startRound]);

  const handleSelect = (n: number) => {
    if (phase !== 'listening') return;
    if (n !== targetNumber) {
      setWrongChoice(n);
    }
    selectNumber(n);
  };

  const floor = getFloorById(floorId);
  const animal = targetNumber > 0 ? getAnimalForNumber(targetNumber) : null;
  const floorAnimal = floor ? getAnimalForNumber(floor.numberRange[0]) : null;

  if (phase === 'idle') return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable testID="back-button" style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Find the Number</Text>
          <Text style={styles.headerSubtitle}>Round {round}</Text>
        </View>
        <Text style={styles.headerEmoji}>{floorAnimal?.emoji || animal?.emoji}</Text>
      </View>

      {/* Speaker button */}
      <View style={styles.speakerContainer}>
        <Pressable
          testID="speaker-button"
          accessibilityLabel="Tap to hear the number again"
          accessibilityRole="button"
          style={({ pressed }) => [styles.speakerButton, pressed && styles.speakerPressed]}
          onPress={() => speakFindPrompt(targetNumber)}
        >
          <Text style={styles.speakerEmoji}>🔊</Text>
        </Pressable>
        <Text style={styles.speakerHint}>Tap to hear the number</Text>
      </View>

      {/* Number grid: 2x3 */}
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          {choices.slice(0, 3).map((n) => (
            <FindNumberButton
              key={`${round}-${n}`}
              number={n}
              onPress={() => handleSelect(n)}
              isCorrect={phase === 'correct' && n === targetNumber}
              isWrong={wrongChoice === n && (phase === 'wrong' || phase === 'strike_out')}
              disabled={phase !== 'listening'}
            />
          ))}
        </View>
        <View style={styles.gridRow}>
          {choices.slice(3, 6).map((n) => (
            <FindNumberButton
              key={`${round}-${n}`}
              number={n}
              onPress={() => handleSelect(n)}
              isCorrect={phase === 'correct' && n === targetNumber}
              isWrong={wrongChoice === n && (phase === 'wrong' || phase === 'strike_out')}
              disabled={phase !== 'listening'}
            />
          ))}
        </View>
      </View>

      {/* Strike indicator */}
      <View style={styles.strikesContainer}>
        {Array.from({ length: MAX_ANSWER_ATTEMPTS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.strikeCircle,
              i < attempts && styles.strikeUsed,
            ]}
          />
        ))}
      </View>

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
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  headerEmoji: {
    fontSize: 32,
  },
  speakerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  speakerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  speakerPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  speakerEmoji: {
    fontSize: 36,
  },
  speakerHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  gridContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  strikesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  strikeCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  strikeUsed: {
    backgroundColor: COLORS.wrong,
  },
  strikeOutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strikeOutText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    backgroundColor: COLORS.wrong,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
