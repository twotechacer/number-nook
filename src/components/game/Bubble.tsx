import { useRef, useEffect } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';

interface BubbleProps {
  index: number;
  isPopped: boolean;
  color: string;
  size: number;
  position: { x: number; y: number };
  onPop: () => void;
  isLastTwo: boolean;
}

export function Bubble({ index, isPopped, color, size, position, onPop, isLastTwo }: BubbleProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const popAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  // Glow for last 2 bubbles
  useEffect(() => {
    if (isLastTwo && !isPopped) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isLastTwo, isPopped]);

  // Pop animation
  useEffect(() => {
    if (isPopped) {
      Animated.timing(popAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isPopped]);

  if (isPopped) {
    return (
      <Animated.View
        testID={`bubble-${index}`}
        style={[
          styles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            left: position.x,
            top: position.y,
            backgroundColor: color + '30',
            transform: [{ scale: Animated.multiply(scaleAnim, popAnim) }],
            opacity: popAnim,
          },
        ]}
      >
        <Text style={styles.popText}>💥</Text>
      </Animated.View>
    );
  }

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <Pressable
      testID={`bubble-${index}`}
      accessibilityLabel="Pop bubble"
      accessibilityRole="button"
      onPress={onPop}
      style={{ position: 'absolute', left: position.x, top: position.y }}
    >
      <Animated.View
        style={[
          styles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color + '45',
            borderColor: color + '80',
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {isLastTwo && (
          <Animated.View
            style={[
              styles.glowRing,
              {
                width: size + 8,
                height: size + 8,
                borderRadius: (size + 8) / 2,
                borderColor: '#F0C84A',
                opacity: glowOpacity,
              },
            ]}
          />
        )}
        <Text style={[styles.bubbleEmoji, { fontSize: size * 0.4 }]}>🫧</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleEmoji: {
    textAlign: 'center',
  },
  popText: {
    fontSize: 20,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 3,
  },
});
