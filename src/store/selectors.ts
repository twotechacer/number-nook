import { useGameStore } from './useGameStore';
import { FloorId, NumberGroupKey, MechanicType } from '@/types/game';
import { FLOORS } from '@/data/floors';
import { getAnimalForNumber } from '@/data/animals';
import { getFloorMasteryPercent, getNumbersNeedingPractice, getNextSuggestedNumbers } from '@/engine/mastery';

/** Is a specific mechanic unlocked for a number group? Counting is always unlocked. */
export function useIsMechanicUnlocked(groupKey: NumberGroupKey, mechanic: MechanicType): boolean {
  return useGameStore((state) => {
    if (mechanic === 'counting') return true;
    if (mechanic === 'feed') return state.mechanicUnlocks[groupKey].feed;
    if (mechanic === 'bubbles') return state.mechanicUnlocks[groupKey].bubbles;
    if (mechanic === 'find') return state.mechanicUnlocks[groupKey].find;
    return false;
  });
}

/** Is a floor unlocked? Floor 1 is always unlocked. */
export function useIsFloorUnlocked(floorId: FloorId): boolean {
  return useGameStore((state) => {
    if (floorId === 'floor1') return true;
    if (floorId === 'floor2') return state.floorUnlocks.floor2;
    if (floorId === 'floor3') return state.floorUnlocks.floor3;
    return false;
  });
}

/** Get mastery percentage for a floor */
export function useFloorProgress(floorId: FloorId): number {
  return useGameStore((state) => getFloorMasteryPercent(state.numberMastery, floorId));
}

/** Get progress counts for a number group */
export function useGroupProgress(groupKey: NumberGroupKey) {
  return useGameStore((state) => {
    const [fromStr, toStr] = groupKey.split('_');
    const from = parseInt(fromStr, 10);
    const to = parseInt(toStr, 10);
    let countingCorrect = 0, feedCorrect = 0, bubblesCorrect = 0;
    for (let n = from; n <= to; n++) {
      const stats = state.numberMastery[String(n)];
      if (stats) {
        countingCorrect += stats.countingCorrect;
        feedCorrect += stats.feedCorrect;
        bubblesCorrect += stats.bubblesCorrect;
      }
    }
    return { countingCorrect, feedCorrect, bubblesCorrect };
  });
}

/** Get the animal config for a given number */
export function useAnimalForNumber(n: number) {
  return getAnimalForNumber(n);
}

/** Get numbers needing most practice for a floor */
export function useNumbersNeedingPractice(floorId: FloorId, limit = 3): number[] {
  return useGameStore((state) => {
    const floor = FLOORS.find((f) => f.id === floorId);
    if (!floor) return [];
    const [from, to] = floor.numberRange;
    return getNumbersNeedingPractice(state.numberMastery, from, to, limit);
  });
}

/** Get next suggested numbers for a floor */
export function useNextSuggestedNumbers(floorId: FloorId, limit = 2): number[] {
  return useGameStore((state) => {
    const floor = FLOORS.find((f) => f.id === floorId);
    if (!floor) return [];
    const [from, to] = floor.numberRange;
    return getNextSuggestedNumbers(state.numberMastery, from, to, limit);
  });
}

/** Get the phase label for a floor's mechanic unlocks */
export function useFloorPhaseLabel(floorId: FloorId): string {
  return useGameStore((state) => {
    const floor = FLOORS.find((f) => f.id === floorId);
    if (!floor) return '';
    const groups = floor.groups;
    const allBubblesUnlocked = groups.every((g) => state.mechanicUnlocks[g].bubbles);
    const anyFeedUnlocked = groups.some((g) => state.mechanicUnlocks[g].feed);
    if (allBubblesUnlocked) return 'All games unlocked';
    if (anyFeedUnlocked) return 'Counting + Feeding unlocked';
    return 'Counting unlocked';
  });
}
