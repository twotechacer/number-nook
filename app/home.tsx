import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import { useIsFloorUnlocked, useFloorProgress, useFloorPhaseLabel } from '@/store/selectors';
import { FLOORS } from '@/data/floors';
import { ANIMALS } from '@/data/animals';
import { COLORS } from '@/data/colors';
import { FloorCard } from '@/components/treehouse/FloorCard';
import { countMastered } from '@/engine/mastery';

function FloorCardConnected({ floorIndex }: { floorIndex: number }) {
  const floor = FLOORS[floorIndex];
  const isUnlocked = useIsFloorUnlocked(floor.id);
  const progress = useFloorProgress(floor.id);
  const phaseLabel = useFloorPhaseLabel(floor.id);
  const mastery = useGameStore((s) => s.numberMastery);

  const [from, to] = floor.numberRange;
  const total = to - from + 1;
  const mastered = countMastered(mastery, from, to);

  const animals = ANIMALS.filter((a) => floor.animals.includes(a.id));
  const animalEmojis = animals.map((a) => a.emoji).join('');
  const animalLabel = animals.map((a) => a.name.split(' ')[0]).join(' & ');

  const prevFloorName = floorIndex > 0 ? FLOORS[floorIndex - 1].name : '';

  return (
    <FloorCard
      floorNumber={floorIndex + 1}
      name={floor.name}
      numberRange={`${from} – ${to}`}
      animalEmojis={animalEmojis}
      animalLabel={animalLabel}
      color={floor.color}
      phaseLabel={phaseLabel}
      progress={progress}
      progressText={`${mastered} of ${total} numbers mastered`}
      isLocked={!isUnlocked}
      onPress={() => router.push(`/floor/${floor.id}`)}
    />
  );
}

export default function Home() {
  const childName = useGameStore((s) => s.childName);
  const totalStars = useGameStore((s) => s.totalStars);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Number Nook</Text>
            <Text style={styles.subtitle}>
              {childName ? `Hi ${childName}! Pick a floor` : 'pick a floor to explore'}
            </Text>
          </View>
          <Pressable
            style={styles.settingsButton}
            onPress={() => router.push('/(parent)/settings')}
          >
            <Text style={styles.settingsIcon}>👤</Text>
          </Pressable>
        </View>

        <FloorCardConnected floorIndex={0} />
        <FloorCardConnected floorIndex={1} />
        <FloorCardConnected floorIndex={2} />

        <View style={styles.starBar}>
          <Text style={styles.starEmoji}>⭐</Text>
          <Text style={styles.starText}>{totalStars} stars collected</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 22,
  },
  starBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
  },
  starEmoji: {
    fontSize: 22,
  },
  starText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
