import { useRef, useEffect } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';

interface TreatProps {
  index: number;
  emoji: string;
  isFed: boolean;
  onTap: () => void;
}

export function Treat({ index, emoji, isFed, onTap }: TreatProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const flyAnim = useRef(new Animated.Value(0)).current;
  const wasFed = useRef(false);

  // Entrance animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 50,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  // Fly-to-animal animation when fed, restore when unfed (undo)
  useEffect(() => {
    if (isFed && !wasFed.current) {
      wasFed.current = true;
      Animated.parallel([
        Animated.timing(flyAnim, {
          toValue: -200,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!isFed && wasFed.current) {
      // Undo — restore the treat
      wasFed.current = false;
      flyAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [isFed]);

  return (
    <Pressable
      testID={`treat-${index}`}
      onPress={isFed ? undefined : onTap}
      disabled={isFed}
    >
      <Animated.View
        style={[
          styles.treat,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: flyAnim },
            ],
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  treat: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  emoji: {
    fontSize: 28,
  },
});
