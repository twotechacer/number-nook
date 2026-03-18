import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '@/data/colors';

interface TeensFrameProps {
  targetNumber: number;
  tappedSet: Set<number>;
  emoji: string;
  onTap: (index: number) => void;
}

/**
 * Tens-frame layout for numbers 11–19:
 * Row of 10 (blue-tinted) + remaining units (amber-tinted)
 * Helps children see teen numbers as "10 + N"
 */
export function TeensFrame({ targetNumber, tappedSet, emoji, onTap }: TeensFrameProps) {
  const units = targetNumber - 10;

  return (
    <View testID="teens-frame" style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>10 + {units}</Text>

      {/* Top row: 10 items (blue) */}
      <View style={styles.rowContainer}>
        <Text style={styles.rowLabel}>10</Text>
        <View style={styles.row}>
          {Array.from({ length: 10 }, (_, i) => {
            const isTapped = tappedSet.has(i);
            return (
              <Pressable
                key={i}
                testID={`object-${i}`}
                accessibilityLabel={isTapped ? `Object ${i + 1}, tapped` : `Tap object ${i + 1}`}
                accessibilityRole="button"
                style={[styles.cell, styles.tenCell, isTapped && styles.tappedCell]}
                onPress={() => onTap(i)}
                disabled={isTapped}
              >
                <Text style={styles.emoji}>{emoji}</Text>
                {isTapped && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Bottom row: remaining units (amber) */}
      <View style={styles.rowContainer}>
        <Text style={styles.rowLabel}>{units}</Text>
        <View style={styles.row}>
          {Array.from({ length: units }, (_, i) => {
            const index = 10 + i;
            const isTapped = tappedSet.has(index);
            return (
              <Pressable
                key={index}
                testID={`object-${index}`}
                accessibilityLabel={isTapped ? `Object ${index + 1}, tapped` : `Tap object ${index + 1}`}
                accessibilityRole="button"
                style={[styles.cell, styles.unitCell, isTapped && styles.tappedCell]}
                onPress={() => onTap(index)}
                disabled={isTapped}
              >
                <Text style={styles.emoji}>{emoji}</Text>
                {isTapped && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 24,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  cell: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  tenCell: {
    backgroundColor: '#87CEEB30',
    borderColor: '#87CEEB60',
  },
  unitCell: {
    backgroundColor: COLORS.celebration + '30',
    borderColor: COLORS.celebration + '60',
  },
  tappedCell: {
    backgroundColor: COLORS.primary + '25',
    borderColor: COLORS.primary,
  },
  emoji: {
    fontSize: 24,
  },
  check: {
    position: 'absolute',
    top: -2,
    right: -2,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    lineHeight: 18,
    overflow: 'hidden',
  },
});
