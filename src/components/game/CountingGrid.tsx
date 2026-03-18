import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@/data/colors';

interface CountingGridProps {
  targetNumber: number;
  tappedSet: Set<number>;
  emoji: string;
  onTap: (index: number) => void;
}

// Row colors cycle for visual grouping of tens
const ROW_COLORS = [
  '#87CEEB30', // blue
  COLORS.celebration + '25', // amber
  '#C8B8E830', // lavender
  '#5A9A7020', // green
  '#FFB6C120', // pink
];

/**
 * Grid layout for counting larger numbers (11+).
 * Shows objects in rows of 10, color-coded per row.
 * Each row labeled with its tens value.
 */
export function CountingGrid({ targetNumber, tappedSet, emoji, onTap }: CountingGridProps) {
  const fullRows = Math.floor(targetNumber / 10);
  const remainder = targetNumber % 10;
  const totalRows = remainder > 0 ? fullRows + 1 : fullRows;

  return (
    <ScrollView
      testID="counting-grid"
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {Array.from({ length: totalRows }, (_, rowIdx) => {
        const itemsInRow = rowIdx < fullRows ? 10 : remainder;
        const startIndex = rowIdx * 10;
        const rowColor = ROW_COLORS[rowIdx % ROW_COLORS.length];

        return (
          <View key={rowIdx} style={styles.rowContainer}>
            <Text style={styles.rowLabel}>
              {rowIdx < fullRows ? `${startIndex + 1}–${startIndex + 10}` : `${startIndex + 1}–${targetNumber}`}
            </Text>
            <View style={[styles.row, { backgroundColor: rowColor }]}>
              {Array.from({ length: itemsInRow }, (_, i) => {
                const index = startIndex + i;
                const isTapped = tappedSet.has(index);
                return (
                  <Pressable
                    key={index}
                    testID={`object-${index}`}
                    accessibilityLabel={isTapped ? `Object ${index + 1}, tapped` : `Tap object ${index + 1}`}
                    accessibilityRole="button"
                    style={[styles.cell, isTapped && styles.tappedCell]}
                    onPress={() => onTap(index)}
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
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  rowContainer: {
    gap: 4,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingLeft: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 6,
    borderRadius: 12,
  },
  cell: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  tappedCell: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  emoji: {
    fontSize: 22,
  },
  checkmark: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
