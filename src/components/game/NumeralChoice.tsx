import { useState, useEffect, useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '@/data/colors';

interface NumeralChoiceProps {
  value: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
  isCorrect?: boolean | null; // null = not yet selected, true/false = feedback
  isHinted?: boolean;
}

export function NumeralChoice({ value, onSelect, disabled = false, isCorrect = null, isHinted = false }: NumeralChoiceProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const hintAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isCorrect !== null) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  useEffect(() => {
    if (isHinted) {
      hintAnim.setValue(0);
      const pulse = Animated.sequence([
        Animated.timing(hintAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(hintAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]);
      const loop = Animated.loop(pulse, { iterations: 3 });
      loopRef.current = loop;
      loop.start();
      return () => {
        loop.stop();
        hintAnim.setValue(0);
      };
    } else {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current = null;
      }
      hintAnim.setValue(0);
    }
  }, [isHinted, hintAnim]);

  const bgColor = showFeedback
    ? isCorrect
      ? COLORS.primary + '30'
      : COLORS.wrong + '50'
    : COLORS.white;

  const baseBorderColor = showFeedback
    ? isCorrect
      ? COLORS.primary
      : COLORS.wrong
    : 'rgba(0,0,0,0.1)';

  const animatedBorderColor = isHinted
    ? hintAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,0,0,0.1)', COLORS.primary],
      })
    : baseBorderColor;

  const animatedBorderWidth = isHinted
    ? hintAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 3],
      })
    : 2;

  return (
    <Animated.View
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: animatedBorderColor,
          borderWidth: animatedBorderWidth,
        },
      ]}
    >
      <Pressable
        testID={`choice-${value}`}
        accessibilityLabel={`Choose ${value}`}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.pressable,
          pressed && !disabled && styles.pressed,
        ]}
        onPress={() => onSelect(value)}
        disabled={disabled}
      >
        <Text style={styles.numeral}>{value}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
