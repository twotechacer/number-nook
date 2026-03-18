import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  anim: Animated.Value;
  translateY: Animated.Value;
  scale: Animated.Value;
}

const SPARKLE_EMOJIS = ['✨', '⭐', '💫', '🌟'];

interface SparklesProps {
  trigger: number; // increment to trigger a new burst
  count?: number;
  spread?: number;
}

export function Sparkles({ trigger, count = 6, spread = 60 }: SparklesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * spread * 2,
      y: (Math.random() - 0.5) * spread,
      emoji: SPARKLE_EMOJIS[i % SPARKLE_EMOJIS.length],
      anim: new Animated.Value(1),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(0),
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    newParticles.forEach((p) => {
      Animated.parallel([
        Animated.sequence([
          Animated.spring(p.scale, { toValue: 1, friction: 4, useNativeDriver: true }),
          Animated.timing(p.scale, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        Animated.timing(p.translateY, {
          toValue: -30 - Math.random() * 20,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(p.anim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setParticles((prev) => prev.filter((pp) => pp.id !== p.id));
      });
    });
  }, [trigger]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <Animated.Text
          key={p.id}
          style={[
            styles.particle,
            {
              left: `${50 + (p.x / spread) * 30}%`,
              top: `${40 + (p.y / spread) * 20}%`,
              opacity: p.anim,
              transform: [
                { translateY: p.translateY },
                { scale: p.scale },
              ],
            },
          ]}
        >
          {p.emoji}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
    fontSize: 20,
  },
});
