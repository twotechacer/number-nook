import { NumberStats, MechanicUnlockMap, FloorUnlocks, NumberGroupKey } from '@/types/game';
import { NUMBER_GROUPS, FLOORS } from '@/data/floors';
import { FEED_UNLOCK_THRESHOLD, BUBBLES_UNLOCK_THRESHOLD, FIND_UNLOCK_THRESHOLD, FLOOR_MASTERY_PERCENT } from '@/data/thresholds';
import { countMastered } from './mastery';

/**
 * Compute mechanic unlock states for all 5 number groups.
 * - Feed unlocks when total countingCorrect across the group >= 5
 * - Bubbles unlocks when total feedCorrect across the group >= 3
 */
export function computeMechanicUnlocks(
  mastery: Record<string, NumberStats>
): MechanicUnlockMap {
  const result = {} as MechanicUnlockMap;

  for (const [groupKey, numbers] of Object.entries(NUMBER_GROUPS)) {
    const totalCountingCorrect = numbers.reduce(
      (sum, n) => sum + (mastery[String(n)]?.countingCorrect ?? 0),
      0
    );
    const totalFeedCorrect = numbers.reduce(
      (sum, n) => sum + (mastery[String(n)]?.feedCorrect ?? 0),
      0
    );
    const totalBubblesCorrect = numbers.reduce(
      (sum, n) => sum + (mastery[String(n)]?.bubblesCorrect ?? 0),
      0
    );

    result[groupKey as NumberGroupKey] = {
      feed: totalCountingCorrect >= FEED_UNLOCK_THRESHOLD,
      bubbles: totalFeedCorrect >= BUBBLES_UNLOCK_THRESHOLD,
      find: totalBubblesCorrect >= FIND_UNLOCK_THRESHOLD,
    };
  }

  return result;
}

/**
 * Compute floor unlock states.
 * - Floor 1: always open (not stored)
 * - Floor 2: unlocks when 80% of Floor 1 (1–10) is mastered → 8 numbers
 * - Floor 3: unlocks when 80% of Floor 2 (11–30) is mastered → 16 numbers
 *
 * Once unlocked, a floor stays unlocked (OR with current state).
 * Parent override is handled at the store level.
 */
export function computeFloorUnlocks(
  mastery: Record<string, NumberStats>,
  currentUnlocks: FloorUnlocks,
  autoUnlock: boolean
): FloorUnlocks {
  if (!autoUnlock) return currentUnlocks;

  const floor1Range = FLOORS[0].numberRange;
  const floor2Range = FLOORS[1].numberRange;
  const floor1Total = floor1Range[1] - floor1Range[0] + 1;
  const floor2Total = floor2Range[1] - floor2Range[0] + 1;

  const floor1Mastered = countMastered(mastery, floor1Range[0], floor1Range[1]);
  const floor2Mastered = countMastered(mastery, floor2Range[0], floor2Range[1]);

  return {
    floor2: currentUnlocks.floor2 || floor1Mastered >= Math.ceil(floor1Total * FLOOR_MASTERY_PERCENT),
    floor3: currentUnlocks.floor3 || floor2Mastered >= Math.ceil(floor2Total * FLOOR_MASTERY_PERCENT),
  };
}
