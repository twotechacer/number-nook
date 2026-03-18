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
  { top: 10, left: 25 }, { top: 5, left: 60 }, { top: 35, left: 10 },
  { top: 30, left: 48 }, { top: 30, left: 80 }, { top: 55, left: 20 },
  { top: 58, left: 55 }, { top: 55, left: 85 }, { top: 78, left: 35 },
  { top: 80, left: 70 },
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 28,
  },
  checkmark: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
