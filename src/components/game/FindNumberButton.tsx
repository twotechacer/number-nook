import React, { useRef, useEffect } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '@/data/colors';

interface FindNumberButtonProps {
  number: number;
  onPress: () => void;
  isCorrect?: boolean;
  isWrong?: boolean;
  disabled?: boolean;
}

export function FindNumberButton({ number, onPress, isCorrect, isWrong, disabled }: FindNumberButtonProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isWrong) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [isWrong, shakeAnim]);

  useEffect(() => {
    if (isCorrect) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isCorrect, pulseAnim]);

  const bgColor = isCorrect
    ? COLORS.primary
    : isWrong
    ? COLORS.wrong
    : COLORS.white;

  const textColor = isCorrect ? COLORS.white : COLORS.textPrimary;

  return (
    <Animated.View
      style={[
        { transform: [{ translateX: shakeAnim }, { scale: pulseAnim }] },
      ]}
    >
      <Pressable
        testID={`find-btn-${number}`}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: bgColor },
          pressed && !disabled && styles.pressed,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[styles.text, { color: textColor }]}>{number}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
  },
});
