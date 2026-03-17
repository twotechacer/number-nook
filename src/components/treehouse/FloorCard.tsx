import { Pressable, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/data/colors';
import { LockOverlay } from '@/components/ui/LockOverlay';

interface FloorCardProps {
  floorNumber: number;
  name: string;
  numberRange: string;
  animalEmojis: string;
  animalLabel: string;
  color: string;
  phaseLabel: string;
  progress: number; // 0-100
  progressText: string;
  isLocked: boolean;
  onPress: () => void;
}

export function FloorCard({
  floorNumber,
  name,
  numberRange,
  animalEmojis,
  animalLabel,
  color,
  phaseLabel,
  progress,
  progressText,
  isLocked,
  onPress,
}: FloorCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: color + '30' },
        pressed && !isLocked && styles.pressed,
      ]}
      onPress={onPress}
      disabled={isLocked}
    >
      {isLocked && <LockOverlay message={`Complete ${name.replace('Floor ', 'Floor ')} to unlock`} />}

      <View style={styles.row}>
        <Text style={styles.emoji}>{animalEmojis}</Text>
        <View style={styles.info}>
          <Text style={styles.floorName}>{name}</Text>
          <Text style={styles.range}>{numberRange}</Text>
          <Text style={styles.animalLabel}>{animalLabel}</Text>
        </View>
      </View>

      <View style={styles.phaseContainer}>
        <Text style={[styles.phaseBadge, { backgroundColor: color + '50' }]}>
          {phaseLabel}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progressText}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 48,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  floorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  range: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  animalLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  phaseContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  phaseBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressContainer: {
    gap: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
