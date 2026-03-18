import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export type AnimalExpression = 'waiting' | 'eating' | 'happy' | 'full';

interface AnimalTummyProps {
  emoji: string;
  name: string;
  treatEmoji: string;
  expression: AnimalExpression;
  fedCount: number;
  targetNumber: number;
  onTummyFullComplete?: () => void;
}

const EXPRESSION_TEXT: Record<AnimalExpression, string> = {
  waiting: 'is hungry!',
  eating: 'yum yum!',
  happy: 'so yummy!',
  full: 'tummy is full!',
};

export function AnimalTummy({
  emoji,
  name,
  treatEmoji,
  expression,
  fedCount,
  targetNumber,
  onTummyFullComplete,
}: AnimalTummyProps) {
  const bellyScale = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const starScale = useRef(new Animated.Value(0)).current;

  // Belly pulse on each feed
  useEffect(() => {
    if (fedCount > 0 && expression !== 'full') {
      Animated.sequence([
        Animated.spring(bellyScale, { toValue: 1.08, friction: 3, useNativeDriver: true }),
        Animated.spring(bellyScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    }
  }, [fedCount]);

  // Tummy-full celebration sequence
  useEffect(() => {
    if (expression === 'full') {
      Animated.sequence([
        // Belly scales up
        Animated.spring(bellyScale, { toValue: 1.12, friction: 4, useNativeDriver: true }),
        Animated.spring(bellyScale, { toValue: 1.0, friction: 5, useNativeDriver: true }),
        // Happy bounce
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -15, duration: 150, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: -10, duration: 120, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
        ]),
        // Star pops out
        Animated.spring(starScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start(() => {
        if (onTummyFullComplete) {
          setTimeout(onTummyFullComplete, 600);
        }
      });
    }
  }, [expression]);

  const firstName = name.split(' ')[0];

  return (
    <View testID="animal-tummy" style={styles.container}>
      {/* Animal */}
      <Animated.View
        style={[
          styles.animalContainer,
          {
            transform: [
              { scale: bellyScale },
              { translateY: bounceAnim },
            ],
          },
        ]}
      >
        <Text style={styles.animalEmoji}>{emoji}</Text>
      </Animated.View>

      {/* Expression text */}
      <Text testID="animal-expression" style={styles.expressionText}>
        {firstName} {EXPRESSION_TEXT[expression]}
      </Text>

      {/* Feed counter */}
      <View style={styles.counterRow}>
        <Text style={styles.treatEmoji}>{treatEmoji}</Text>
        <Text testID="feed-counter" style={styles.counterText}>
          {fedCount} / {targetNumber}
        </Text>
      </View>

      {/* Tummy-full star */}
      {expression === 'full' && (
        <Animated.View style={[styles.starContainer, { transform: [{ scale: starScale }] }]}>
          <Text style={styles.starEmoji}>⭐</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  animalContainer: {
    marginBottom: 8,
  },
  animalEmoji: {
    fontSize: 80,
  },
  expressionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E30',
    marginBottom: 8,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  treatEmoji: {
    fontSize: 20,
  },
  counterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E30',
  },
  starContainer: {
    position: 'absolute',
    top: 0,
    right: '30%',
  },
  starEmoji: {
    fontSize: 36,
  },
});
