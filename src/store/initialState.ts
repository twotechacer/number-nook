import {
  ChildProfile,
  NumberStats,
  MechanicUnlockMap,
  NumberGroupKey,
} from '@/types/game';

function createEmptyNumberStats(): NumberStats {
  return {
    correct: 0,
    wrong: 0,
    lastPlayed: 0,
    countingCorrect: 0,
    feedCorrect: 0,
    bubblesCorrect: 0,
  };
}

function createEmptyMastery(): Record<string, NumberStats> {
  const mastery: Record<string, NumberStats> = {};
  for (let n = 1; n <= 50; n++) {
    mastery[String(n)] = createEmptyNumberStats();
  }
  return mastery;
}

function createEmptyMechanicUnlocks(): MechanicUnlockMap {
  const groups: NumberGroupKey[] = ['1_10', '11_20', '21_30', '31_40', '41_50'];
  const unlocks = {} as MechanicUnlockMap;
  for (const group of groups) {
    unlocks[group] = { feed: false, bubbles: false };
  }
  return unlocks;
}

export function createInitialProfile(): ChildProfile {
  return {
    childName: '',
    totalStars: 0,
    floorUnlocks: { floor2: false, floor3: false },
    mechanicUnlocks: createEmptyMechanicUnlocks(),
    numberMastery: createEmptyMastery(),
    sessionLog: [],
    voicePreference: 'default',
    settings: {
      soundEnabled: true,
      ambientEnabled: false,
      autoFloorUnlock: true,
      parentPin: null,
    },
  };
}
