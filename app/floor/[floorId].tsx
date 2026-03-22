import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore, UnlockEvent } from '@/store/useGameStore';
import { FLOORS, getFloorById } from '@/data/floors';
import { ANIMALS } from '@/data/animals';
import { COLORS } from '@/data/colors';
import { FEED_UNLOCK_THRESHOLD, BUBBLES_UNLOCK_THRESHOLD, FIND_UNLOCK_THRESHOLD } from '@/data/thresholds';
import { LockOverlay } from '@/components/ui/LockOverlay';
import { UnlockBanner } from '@/components/ui/UnlockBanner';
import { NumberGroupKey } from '@/types/game';

interface MechanicCardProps {
  title: string;
  description: string;
  emoji: string;
  isLocked: boolean;
  lockMessage: string;
  progressText?: string;
  progressPercent?: number;
  color: string;
  isNew?: boolean;
  onPress: () => void;
}

function MechanicCard({
  title, description, emoji, isLocked, lockMessage,
  progressText, progressPercent = 0, color, isNew, onPress,
}: MechanicCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mechanicCard,
        pressed && !isLocked && styles.mechanicPressed,
      ]}
      onPress={isLocked ? undefined : onPress}
    >
      {isLocked && <LockOverlay message={lockMessage} />}

      <View style={styles.mechanicRow}>
        <View style={[styles.mechanicIcon, { backgroundColor: color + '25' }]}>
          <Text style={styles.mechanicEmoji}>{emoji}</Text>
        </View>
        <View style={styles.mechanicInfo}>
          <View style={styles.mechanicTitleRow}>
            <Text style={styles.mechanicTitle}>{title}</Text>
            {isNew && (
              <View style={[styles.newBadge, { backgroundColor: COLORS.celebration }]}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          <Text style={styles.mechanicDescription}>{description}</Text>
        </View>
        {!isLocked && <Text style={styles.arrow}>→</Text>}
      </View>

      {progressText && (
        <View style={styles.mechanicProgressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.mechanicProgressText}>{progressText}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function FloorMenu() {
  const { floorId } = useLocalSearchParams<{ floorId: string }>();
  const mechanicUnlocks = useGameStore((s) => s.mechanicUnlocks);
  const numberMastery = useGameStore((s) => s.numberMastery);
  const pendingUnlockEvents = useGameStore((s) => s.pendingUnlockEvents);
  const clearUnlockEvents = useGameStore((s) => s.clearUnlockEvents);

  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerEmoji, setBannerEmoji] = useState('');
  const [bannerVisible, setBannerVisible] = useState(false);

  // Show unlock banner when there are pending mechanic unlock events
  useEffect(() => {
    const mechanicEvents = pendingUnlockEvents.filter((e) => e.type === 'mechanic');
    if (mechanicEvents.length > 0) {
      const event = mechanicEvents[0];
      if (event.mechanic === 'feed') {
        setBannerMessage('Feed the animals unlocked!');
        setBannerEmoji('🎉');
      } else if (event.mechanic === 'bubbles') {
        setBannerMessage('Pop the bubbles unlocked!');
        setBannerEmoji('🫧');
      } else if (event.mechanic === 'find') {
        setBannerMessage('Find the Number unlocked!');
        setBannerEmoji('🔊');
      }
      setBannerVisible(true);
      clearUnlockEvents();
    }
  }, [pendingUnlockEvents]);

  const floor = getFloorById(floorId || '');

  // Derive values safely (no conditional hooks)
  // Check ALL groups in this floor — unlock if ANY group qualifies
  const floorGroups: NumberGroupKey[] = floor ? floor.groups : ['1_10'];
  const feedUnlocked = floorGroups.some((g) => mechanicUnlocks[g]?.feed ?? false);
  const bubblesUnlocked = floorGroups.some((g) => mechanicUnlocks[g]?.bubbles ?? false);
  const findUnlocked = floorGroups.some((g) => mechanicUnlocks[g]?.find ?? false);

  // Compute progress across ALL groups in this floor
  let countingCorrect = 0;
  let feedCorrect = 0;
  let bubblesCorrect = 0;
  let findCorrect = 0;
  if (floor) {
    const [from, to] = floor.numberRange;
    for (let n = from; n <= to; n++) {
      const stats = numberMastery[String(n)];
      if (stats) {
        countingCorrect += stats.countingCorrect;
        feedCorrect += stats.feedCorrect;
        bubblesCorrect += stats.bubblesCorrect;
        findCorrect += stats.findCorrect ?? 0;
      }
    }
  }

  if (!floor) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Floor not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>← Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const animals = ANIMALS.filter((a) => floor.animals.includes(a.id));
  const mainAnimal = animals[0];
  const [from, to] = floor.numberRange;

  return (
    <SafeAreaView style={styles.container}>
      <UnlockBanner
        message={bannerMessage}
        emoji={bannerEmoji}
        visible={bannerVisible}
        onDismiss={() => setBannerVisible(false)}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{floor.name} · {from} – {to}</Text>
            <Text style={styles.headerSubtitle}>
              {mainAnimal?.name} is waiting for you!
            </Text>
          </View>
          <Text style={styles.headerEmoji}>{mainAnimal?.emoji}</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.primary + '25' }]}>
            <Text style={styles.statusText}>Counting active</Text>
          </View>
          {feedUnlocked && (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.celebration + '35' }]}>
              <Text style={styles.statusText}>Feeding active</Text>
            </View>
          )}
        </View>
        {!bubblesUnlocked && (
          <Text style={styles.lockHint}>
            Bubbles locked · {feedUnlocked ? `${Math.min(feedCorrect, 3)}/3 feeds` : `${Math.min(countingCorrect, 5)}/5 counts`}
          </Text>
        )}

        <Text style={styles.sectionLabel}>Choose a game to play with numbers {from} – {to}</Text>

        <MechanicCard
          title="Count it!"
          description="Tap each object and count how many"
          emoji="👆"
          isLocked={false}
          lockMessage=""
          progressText={`${countingCorrect} correct`}
          progressPercent={Math.min((countingCorrect / 10) * 100, 100)}
          color={COLORS.primary}
          onPress={() => router.push({ pathname: '/game/counting', params: { floorId: floor.id } })}
        />

        <MechanicCard
          title="Feed the animals!"
          description={`Give the ${mainAnimal?.name.split(' ')[0].toLowerCase()} exactly the right number of treats`}
          emoji={mainAnimal?.treatEmoji || '🍎'}
          isLocked={!feedUnlocked}
          lockMessage={`Complete ${Math.max(FEED_UNLOCK_THRESHOLD - countingCorrect, 0)} more counting rounds to unlock`}
          progressText={feedUnlocked ? `${feedCorrect} of 3 rounds done` : undefined}
          progressPercent={feedUnlocked ? (feedCorrect / 3) * 100 : 0}
          color={COLORS.celebration}
          isNew={feedUnlocked && feedCorrect === 0}
          onPress={() => router.push({ pathname: '/game/feeding', params: { floorId: floor.id } })}
        />

        <MechanicCard
          title="Pop the bubbles!"
          description="Pop each bubble and count them all"
          emoji="🫧"
          isLocked={!bubblesUnlocked}
          lockMessage={`Complete ${Math.max(BUBBLES_UNLOCK_THRESHOLD - feedCorrect, 0)} more feeding rounds to unlock`}
          progressText={bubblesUnlocked ? `${bubblesCorrect} correct` : undefined}
          progressPercent={bubblesUnlocked ? Math.min((bubblesCorrect / 5) * 100, 100) : 0}
          color="#A4D2E1"
          onPress={() => router.push({ pathname: '/game/bubbles', params: { floorId: floor.id } })}
        />

        <MechanicCard
          title="Find the Number!"
          description="Listen and tap the right number"
          emoji="🔊"
          isLocked={!findUnlocked}
          lockMessage={`Complete ${Math.max(FIND_UNLOCK_THRESHOLD - bubblesCorrect, 0)} more bubble rounds to unlock`}
          progressText={findUnlocked ? `${findCorrect} correct` : undefined}
          progressPercent={findUnlocked ? Math.min((findCorrect / 5) * 100, 100) : 0}
          color="#C9A4E1"
          isNew={findUnlocked && findCorrect === 0}
          onPress={() => router.push({ pathname: '/game/find-number', params: { floorId: floor.id } })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  headerEmoji: {
    fontSize: 40,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  lockHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  mechanicCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  mechanicPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  mechanicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mechanicIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mechanicEmoji: {
    fontSize: 26,
  },
  mechanicInfo: {
    flex: 1,
  },
  mechanicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mechanicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  mechanicDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  mechanicProgressContainer: {
    marginTop: 10,
    gap: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  mechanicProgressText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
