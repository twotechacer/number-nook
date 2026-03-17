import { useGameStore } from '@/store/useGameStore';

beforeEach(() => { useGameStore.getState().resetProgress(); });

describe('useGameStore', () => {
  describe('initial state', () => {
    it('has 50 numbers', () => expect(Object.keys(useGameStore.getState().numberMastery)).toHaveLength(50));
    it('has 0 stars', () => expect(useGameStore.getState().totalStars).toBe(0));
    it('has empty name', () => expect(useGameStore.getState().childName).toBe(''));
    it('all mechanics locked', () => {
      expect(useGameStore.getState().mechanicUnlocks['1_10']).toEqual({ feed: false, bubbles: false });
    });
    it('all floors locked', () => expect(useGameStore.getState().floorUnlocks).toEqual({ floor2: false, floor3: false }));
  });

  describe('setChildName', () => {
    it('updates name', () => { useGameStore.getState().setChildName('Aria'); expect(useGameStore.getState().childName).toBe('Aria'); });
  });

  describe('recordAnswer', () => {
    it('correct counting', () => {
      useGameStore.getState().recordAnswer(5, 'counting', true);
      const st = useGameStore.getState().numberMastery['5'];
      expect(st.countingCorrect).toBe(1);
      expect(st.correct).toBe(1);
    });
    it('correct feed', () => {
      useGameStore.getState().recordAnswer(3, 'feed', true);
      expect(useGameStore.getState().numberMastery['3'].feedCorrect).toBe(1);
    });
    it('correct bubbles', () => {
      useGameStore.getState().recordAnswer(7, 'bubbles', true);
      expect(useGameStore.getState().numberMastery['7'].bubblesCorrect).toBe(1);
    });
    it('wrong answer', () => {
      useGameStore.getState().recordAnswer(5, 'counting', false);
      const st = useGameStore.getState().numberMastery['5'];
      expect(st.wrong).toBe(1);
      expect(st.countingCorrect).toBe(0);
    });
    it('updates lastPlayed', () => {
      const before = Date.now();
      useGameStore.getState().recordAnswer(5, 'counting', true);
      expect(useGameStore.getState().numberMastery['5'].lastPlayed).toBeGreaterThanOrEqual(before);
    });
  });

  describe('mechanic unlock cascade', () => {
    it('feed unlocks after 5 counting correct', () => {
      for (let n = 1; n <= 4; n++) useGameStore.getState().recordAnswer(n, 'counting', true);
      expect(useGameStore.getState().mechanicUnlocks['1_10'].feed).toBe(false);
      useGameStore.getState().recordAnswer(5, 'counting', true);
      expect(useGameStore.getState().mechanicUnlocks['1_10'].feed).toBe(true);
    });
    it('bubbles unlocks after 3 feed correct', () => {
      for (let n = 1; n <= 2; n++) useGameStore.getState().recordAnswer(n, 'feed', true);
      expect(useGameStore.getState().mechanicUnlocks['1_10'].bubbles).toBe(false);
      useGameStore.getState().recordAnswer(3, 'feed', true);
      expect(useGameStore.getState().mechanicUnlocks['1_10'].bubbles).toBe(true);
    });
    it('does NOT unlock other groups', () => {
      for (let i = 0; i < 5; i++) useGameStore.getState().recordAnswer(i + 1, 'counting', true);
      expect(useGameStore.getState().mechanicUnlocks['11_20'].feed).toBe(false);
    });
  });

  describe('floor unlock cascade', () => {
    it('floor2 at 8/10 mastered', () => {
      for (let n = 1; n <= 8; n++) for (let i = 0; i < 3; i++) useGameStore.getState().recordAnswer(n, 'counting', true);
      expect(useGameStore.getState().floorUnlocks.floor2).toBe(true);
    });
    it('no floor2 at 7/10', () => {
      for (let n = 1; n <= 7; n++) for (let i = 0; i < 3; i++) useGameStore.getState().recordAnswer(n, 'counting', true);
      expect(useGameStore.getState().floorUnlocks.floor2).toBe(false);
    });
  });

  describe('addStar', () => {
    it('increments', () => { useGameStore.getState().addStar(); useGameStore.getState().addStar(); expect(useGameStore.getState().totalStars).toBe(2); });
  });

  describe('overrideFloorUnlock', () => {
    it('unlock', () => { useGameStore.getState().overrideFloorUnlock('floor2', true); expect(useGameStore.getState().floorUnlocks.floor2).toBe(true); });
    it('re-lock', () => {
      useGameStore.getState().overrideFloorUnlock('floor2', true);
      useGameStore.getState().overrideFloorUnlock('floor2', false);
      expect(useGameStore.getState().floorUnlocks.floor2).toBe(false);
    });
  });

  describe('session tracking', () => {
    it('startSession sets timestamp', () => { useGameStore.getState().startSession(); expect(useGameStore.getState().currentSessionStart).not.toBeNull(); });
    it('endSession creates log entry', () => {
      useGameStore.getState().startSession();
      useGameStore.getState().recordAnswer(1, 'counting', true);
      useGameStore.getState().addStar();
      useGameStore.getState().endSession();
      const log = useGameStore.getState().sessionLog;
      expect(log).toHaveLength(1);
      expect(log[0].numbersPlayed).toContain(1);
      expect(log[0].starsEarned).toBe(1);
    });
    it('endSession no-op without active session', () => { useGameStore.getState().endSession(); expect(useGameStore.getState().sessionLog).toHaveLength(0); });
  });

  describe('resetProgress', () => {
    it('resets everything', () => {
      useGameStore.getState().setChildName('Test');
      useGameStore.getState().addStar();
      useGameStore.getState().recordAnswer(1, 'counting', true);
      useGameStore.getState().resetProgress();
      expect(useGameStore.getState().childName).toBe('');
      expect(useGameStore.getState().totalStars).toBe(0);
      expect(useGameStore.getState().numberMastery['1'].correct).toBe(0);
    });
  });
});
