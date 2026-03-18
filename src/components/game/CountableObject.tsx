import { Pressable, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '@/data/colors';

interface CountableObjectProps {
  index: number;
  isTapped: boolean;
  emoji: string;
  onTap: () => void;
}

// Predefined organic positions (not a grid) for up to 10 objects
const POSITIONS: { top: number; left: number }[] = [
  { top: 8, left: 20 }, { top: 5, left: 58 }, { top: 30, left: 5 },
  { top: 28, left: 42 }, { top: 26, left: 75 }, { top: 52, left: 15 },
  { top: 54, left: 50 }, { top: 50, left: 80 }, { top: 75, left: 30 },
  { top: 76, left: 65 },
];

export function CountableObject({ index, isTapped, emoji, onTap }: CountableObjectProps) {
  const pos = POSITIONS[index % POSITIONS.length];

  return (
    <Pressable
      style={[
        styles.object,
        { top: `${pos.top}%`, left: `${pos.left}%` },
        isTapped && styles.tapped,
      ]}
      onPress={onTap}
      disabled={isTapped}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      {isTapped && (
        <View style={styles.checkmark}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  object: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tapped: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  emoji: {
    fontSize: 36,
  },
  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
