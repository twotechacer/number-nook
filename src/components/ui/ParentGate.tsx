import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '@/data/colors';

interface ParentGateProps {
  onPass: () => void;
  onCancel: () => void;
}

function generateChallenge(): { a: number; b: number; answer: number } {
  const a = Math.floor(Math.random() * 20) + 5;
  const b = Math.floor(Math.random() * 20) + 5;
  return { a, b, answer: a + b };
}

function generateOptions(answer: number): number[] {
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const val = answer + offset;
    if (val > 0 && val !== answer) options.add(val);
  }
  return [...options].sort(() => Math.random() - 0.5);
}

export function ParentGate({ onPass, onCancel }: ParentGateProps) {
  const [challenge, setChallenge] = useState(generateChallenge);
  const [options, setOptions] = useState<number[]>([]);
  const [wrongAttempt, setWrongAttempt] = useState(false);

  useEffect(() => {
    setOptions(generateOptions(challenge.answer));
  }, [challenge]);

  const handleSelect = (value: number) => {
    if (value === challenge.answer) {
      onPass();
    } else {
      setWrongAttempt(true);
      // Regenerate after brief delay
      setTimeout(() => {
        setWrongAttempt(false);
        const newChallenge = generateChallenge();
        setChallenge(newChallenge);
      }, 1000);
    }
  };

  return (
    <View testID="parent-gate" style={styles.container}>
      <Text style={styles.title}>Parent Check</Text>
      <Text style={styles.subtitle}>Solve this to continue</Text>

      <View style={styles.challengeBox}>
        <Text style={styles.challengeText}>
          {challenge.a} + {challenge.b} = ?
        </Text>
      </View>

      {wrongAttempt && (
        <Text style={styles.wrongText}>Not quite — try again!</Text>
      )}

      <View style={styles.optionsGrid}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            testID={`gate-option-${opt}`}
            style={({ pressed }) => [
              styles.optionButton,
              pressed && styles.optionPressed,
            ]}
            onPress={() => handleSelect(opt)}
            disabled={wrongAttempt}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable testID="gate-cancel" style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>← Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  challengeBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    marginBottom: 24,
  },
  challengeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  wrongText: {
    fontSize: 15,
    color: COLORS.wrong,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    width: 80,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  optionPressed: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});
