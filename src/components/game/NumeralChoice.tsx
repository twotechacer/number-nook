import { useState, useEffect } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '@/data/colors';

interface NumeralChoiceProps {
  value: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
  isCorrect?: boolean | null; // null = not yet selected, true/false = feedback
}

export function NumeralChoice({ value, onSelect, disabled = false, isCorrect = null }: NumeralChoiceProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (isCorrect !== null) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  const bgColor = showFeedback
    ? isCorrect
      ? COLORS.primary + '30'
      : COLORS.wrong + '50'
    : COLORS.white;

  const borderColor = showFeedback
    ? isCorrect
      ? COLORS.primary
      : COLORS.wrong
    : 'rgba(0,0,0,0.1)';

  return (
    <Pressable
      testID={`choice-${value}`}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor, borderColor },
        pressed && !disabled && styles.pressed,
      ]}
      onPress={() => onSelect(value)}
      disabled={disabled}
    >
      <Text style={styles.numeral}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  numeral: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
});
