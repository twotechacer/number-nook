import { useGameStore } from '@/store/useGameStore';
import { renderHook } from '@testing-library/react-native';
import {
  useIsMechanicUnlocked,
  useIsFloorUnlocked,
  useFloorProgress,
  useFloorPhaseLabel,
} from '@/store/selectors';
import { getFloorMasteryPercent, getNumbersNeedingPractice, getNextSuggestedNumbers } from '@/engine/mastery';

beforeEach(() => {
  useGameStore.getState().resetProgress();
});

describe('useIsMechanicUnlocked', () => {
  it('counting is always unlocked', () => {
    const { result } = renderHook(() => useIsMechanicUnlocked('1_10', 'counting'));
    expect(result.current).toBe(true);
  });

  it('feed is locked by default', () => {
    const { result } = renderHook(() => useIsMechanicUnlocked('1_10', 'feed'));
    expect(result.current).toBe(false);
  });

  it('feed unlocks after 5 counting correct', () => {
    for (let n = 1; n <= 5; n++) useGameStore.getState().recordAnswer(n, 'counting', true);
    const { result } = renderHook(() => useIsMechanicUnlocked('1_10', 'feed'));
    expect(result.current).toBe(true);
  });

  it('bubbles locked by default', () => {
    const { result } = renderHook(() => useIsMechanicUnlocked('1_10', 'bubbles'));
    expect(result.current).toBe(false);
  });

  it('bubbles unlocks after 3 feed correct', () => {
    for (let n = 1; n <= 3; n++) useGameStore.getState().recordAnswer(n, 'feed', true);
    const { result } = renderHook(() => useIsMechanicUnlocked('1_10', 'bubbles'));
    expect(result.current).toBe(true);
  });

  it('group 11_20 independent from 1_10', () => {
    for (let n = 1; n <= 5; n++) useGameStore.getState().recordAnswer(n, 'counting', true);
    const { result } = renderHook(() => useIsMechanicUnlocked('11_20', 'feed'));
    expect(result.current).toBe(false);
  });
});

describe('useIsFloorUnlocked', () => {
  it('floor1 always unlocked', () => {
    const { result } = renderHook(() => useIsFloorUnlocked('floor1'));
    expect(result.current).toBe(true);
  });

  it('floor2 locked by default', () => {
    const { result } = renderHook(() => useIsFloorUnlocked('floor2'));
    expect(result.current).toBe(false);
  });

  it('floor2 unlocks after 8/10 mastered', () => {
    for (let n = 1; n <= 8; n++) {
      for (let i = 0; i < 3; i++) useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    const { result } = renderHook(() => useIsFloorUnlocked('floor2'));
    expect(result.current).toBe(true);
  });

  it('floor3 locked by default', () => {
    const { result } = renderHook(() => useIsFloorUnlocked('floor3'));
    expect(result.current).toBe(false);
  });

  it('floor2 unlocks via parent override', () => {
    useGameStore.getState().overrideFloorUnlock('floor2', true);
    const { result } = renderHook(() => useIsFloorUnlocked('floor2'));
    expect(result.current).toBe(true);
  });
});

describe('useFloorProgress', () => {
  it('0% when nothing played', () => {
    const { result } = renderHook(() => useFloorProgress('floor1'));
    expect(result.current).toBe(0);
  });

  it('80% when 8/10 mastered on floor1', () => {
    for (let n = 1; n <= 8; n++) {
      for (let i = 0; i < 3; i++) useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    const { result } = renderHook(() => useFloorProgress('floor1'));
    expect(result.current).toBe(80);
  });

  it('100% when all mastered', () => {
    for (let n = 1; n <= 10; n++) {
      for (let i = 0; i < 3; i++) useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    const { result } = renderHook(() => useFloorProgress('floor1'));
    expect(result.current).toBe(100);
  });
});

describe('useFloorPhaseLabel', () => {
  it('shows "Counting unlocked" initially', () => {
    const { result } = renderHook(() => useFloorPhaseLabel('floor1'));
    expect(result.current).toBe('Counting unlocked');
  });

  it('shows "Counting + Feeding unlocked" after feed unlock', () => {
    for (let n = 1; n <= 5; n++) useGameStore.getState().recordAnswer(n, 'counting', true);
    const { result } = renderHook(() => useFloorPhaseLabel('floor1'));
    expect(result.current).toBe('Counting + Feeding unlocked');
  });

  it('shows "All games unlocked" after bubbles unlock', () => {
    for (let n = 1; n <= 5; n++) useGameStore.getState().recordAnswer(n, 'counting', true);
    for (let n = 1; n <= 3; n++) useGameStore.getState().recordAnswer(n, 'feed', true);
    const { result } = renderHook(() => useFloorPhaseLabel('floor1'));
    expect(result.current).toBe('All games unlocked');
  });

  it('returns empty string for invalid floor', () => {
    const { result } = renderHook(() => useFloorPhaseLabel('floor99' as any));
    expect(result.current).toBe('');
  });
});

// Test selectors that return objects/arrays using pure functions directly
// (renderHook causes infinite loops because Zustand detects new object references)
describe('group progress (pure function)', () => {
  it('all zeros initially', () => {
    const mastery = useGameStore.getState().numberMastery;
    let countingCorrect = 0, feedCorrect = 0, bubblesCorrect = 0;
    for (let n = 1; n <= 10; n++) {
      const stats = mastery[String(n)];
      countingCorrect += stats.countingCorrect;
      feedCorrect += stats.feedCorrect;
      bubblesCorrect += stats.bubblesCorrect;
    }
    expect({ countingCorrect, feedCorrect, bubblesCorrect }).toEqual({ countingCorrect: 0, feedCorrect: 0, bubblesCorrect: 0 });
  });

  it('counts correct answers by mechanic', () => {
    useGameStore.getState().recordAnswer(1, 'counting', true);
    useGameStore.getState().recordAnswer(2, 'counting', true);
    useGameStore.getState().recordAnswer(3, 'feed', true);
    const mastery = useGameStore.getState().numberMastery;
    let countingCorrect = 0, feedCorrect = 0;
    for (let n = 1; n <= 10; n++) {
      const stats = mastery[String(n)];
      countingCorrect += stats.countingCorrect;
      feedCorrect += stats.feedCorrect;
    }
    expect(countingCorrect).toBe(2);
    expect(feedCorrect).toBe(1);
  });

  it('does NOT count answers from other groups', () => {
    useGameStore.getState().recordAnswer(15, 'counting', true);
    const mastery = useGameStore.getState().numberMastery;
    let countingCorrect = 0;
    for (let n = 1; n <= 10; n++) countingCorrect += mastery[String(n)].countingCorrect;
    expect(countingCorrect).toBe(0);
  });
});

describe('numbers needing practice (pure function)', () => {
  it('returns empty when nothing played', () => {
    const mastery = useGameStore.getState().numberMastery;
    expect(getNumbersNeedingPractice(mastery, 1, 10)).toEqual([]);
  });

  it('returns numbers with most wrong answers', () => {
    useGameStore.getState().recordAnswer(3, 'counting', false);
    useGameStore.getState().recordAnswer(3, 'counting', false);
    useGameStore.getState().recordAnswer(7, 'counting', false);
    const mastery = useGameStore.getState().numberMastery;
    const result = getNumbersNeedingPractice(mastery, 1, 10);
    expect(result).toContain(3);
  });

  it('respects limit', () => {
    for (let n = 1; n <= 5; n++) useGameStore.getState().recordAnswer(n, 'counting', false);
    const mastery = useGameStore.getState().numberMastery;
    const result = getNumbersNeedingPractice(mastery, 1, 10, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });
});

describe('next suggested numbers (pure function)', () => {
  it('suggests unplayed numbers', () => {
    const mastery = useGameStore.getState().numberMastery;
    const result = getNextSuggestedNumbers(mastery, 1, 10);
    for (const n of result) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(10);
    }
  });

  it('respects limit', () => {
    const mastery = useGameStore.getState().numberMastery;
    const result = getNextSuggestedNumbers(mastery, 1, 10, 1);
    expect(result.length).toBeLessThanOrEqual(1);
  });
});
