import { useGameStore } from '@/store/useGameStore';

beforeEach(() => {
  useGameStore.getState().resetProgress();
});

describe('Mechanic unlock cascade — full integration', () => {
  it('feed unlocks after 5 counting correct in group 1_10', () => {
    for (let n = 1; n <= 5; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    expect(useGameStore.getState().mechanicUnlocks['1_10'].feed).toBe(true);
    expect(useGameStore.getState().mechanicUnlocks['1_10'].bubbles).toBe(false);
  });

  it('feed does NOT unlock with 4 counting correct', () => {
    for (let n = 1; n <= 4; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    expect(useGameStore.getState().mechanicUnlocks['1_10'].feed).toBe(false);
  });

  it('bubbles unlocks after 3 feed correct in group 1_10', () => {
    for (let n = 1; n <= 3; n++) {
      useGameStore.getState().recordAnswer(n, 'feed', true);
    }
    expect(useGameStore.getState().mechanicUnlocks['1_10'].bubbles).toBe(true);
  });

  it('wrong answers do NOT count toward unlocks', () => {
    for (let n = 1; n <= 10; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', false);
    }
    expect(useGameStore.getState().mechanicUnlocks['1_10'].feed).toBe(false);
  });

  it('groups are independent — group 11_20 unaffected by group 1_10', () => {
    for (let n = 1; n <= 5; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    expect(useGameStore.getState().mechanicUnlocks['1_10'].feed).toBe(true);
    expect(useGameStore.getState().mechanicUnlocks['11_20'].feed).toBe(false);
  });

  it('multi-group floor: group 21_30 unlocks independently', () => {
    for (let n = 21; n <= 25; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    expect(useGameStore.getState().mechanicUnlocks['21_30'].feed).toBe(true);
    expect(useGameStore.getState().mechanicUnlocks['11_20'].feed).toBe(false);
  });

  it('concentrated correct answers on one number still unlock', () => {
    // All 5 correct on number 3
    for (let i = 0; i < 5; i++) {
      useGameStore.getState().recordAnswer(3, 'counting', true);
    }
    expect(useGameStore.getState().mechanicUnlocks['1_10'].feed).toBe(true);
  });

  it('never re-locks a mechanic', () => {
    for (let n = 1; n <= 5; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    expect(useGameStore.getState().mechanicUnlocks['1_10'].feed).toBe(true);

    // Record wrong answers — should NOT re-lock
    for (let n = 1; n <= 10; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', false);
    }
    expect(useGameStore.getState().mechanicUnlocks['1_10'].feed).toBe(true);
  });

  it('full cascade: counting → feed → bubbles', () => {
    // 5 counting correct → feed unlocks
    for (let n = 1; n <= 5; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    expect(useGameStore.getState().mechanicUnlocks['1_10'].feed).toBe(true);
    expect(useGameStore.getState().mechanicUnlocks['1_10'].bubbles).toBe(false);

    // 3 feed correct → bubbles unlocks
    for (let n = 1; n <= 3; n++) {
      useGameStore.getState().recordAnswer(n, 'feed', true);
    }
    expect(useGameStore.getState().mechanicUnlocks['1_10'].bubbles).toBe(true);
  });
});

describe('Floor unlock cascade — full integration', () => {
  it('floor2 unlocks at 8/10 numbers mastered (3 correct each)', () => {
    for (let n = 1; n <= 8; n++) {
      for (let i = 0; i < 3; i++) {
        useGameStore.getState().recordAnswer(n, 'counting', true);
      }
    }
    expect(useGameStore.getState().floorUnlocks.floor2).toBe(true);
  });

  it('floor2 does NOT unlock at 7/10', () => {
    for (let n = 1; n <= 7; n++) {
      for (let i = 0; i < 3; i++) {
        useGameStore.getState().recordAnswer(n, 'counting', true);
      }
    }
    expect(useGameStore.getState().floorUnlocks.floor2).toBe(false);
  });

  it('floor3 unlocks at 16/20 numbers mastered (11-30)', () => {
    // First unlock floor2
    for (let n = 1; n <= 8; n++) {
      for (let i = 0; i < 3; i++) {
        useGameStore.getState().recordAnswer(n, 'counting', true);
      }
    }
    // Then master 16 of numbers 11-30
    for (let n = 11; n <= 26; n++) {
      for (let i = 0; i < 3; i++) {
        useGameStore.getState().recordAnswer(n, 'counting', true);
      }
    }
    expect(useGameStore.getState().floorUnlocks.floor3).toBe(true);
  });

  it('floor unlock never re-locks', () => {
    for (let n = 1; n <= 8; n++) {
      for (let i = 0; i < 3; i++) {
        useGameStore.getState().recordAnswer(n, 'counting', true);
      }
    }
    expect(useGameStore.getState().floorUnlocks.floor2).toBe(true);

    // Wrong answers after unlock should not re-lock
    for (let n = 1; n <= 10; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', false);
    }
    expect(useGameStore.getState().floorUnlocks.floor2).toBe(true);
  });

  it('parent override unlocks floor', () => {
    useGameStore.getState().overrideFloorUnlock('floor2', true);
    expect(useGameStore.getState().floorUnlocks.floor2).toBe(true);
    useGameStore.getState().overrideFloorUnlock('floor3', true);
    expect(useGameStore.getState().floorUnlocks.floor3).toBe(true);
  });

  it('autoFloorUnlock=false prevents auto unlock', () => {
    useGameStore.getState().updateSettings({ autoFloorUnlock: false });
    for (let n = 1; n <= 10; n++) {
      for (let i = 0; i < 3; i++) {
        useGameStore.getState().recordAnswer(n, 'counting', true);
      }
    }
    expect(useGameStore.getState().floorUnlocks.floor2).toBe(false);
  });
});

describe('Unlock event tracking', () => {
  it('emits feed unlock event', () => {
    for (let n = 1; n <= 5; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    const events = useGameStore.getState().pendingUnlockEvents;
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'mechanic', mechanic: 'feed', groupKey: '1_10' })
    );
  });

  it('emits bubbles unlock event', () => {
    for (let n = 1; n <= 3; n++) {
      useGameStore.getState().recordAnswer(n, 'feed', true);
    }
    const events = useGameStore.getState().pendingUnlockEvents;
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'mechanic', mechanic: 'bubbles', groupKey: '1_10' })
    );
  });

  it('emits floor unlock event', () => {
    for (let n = 1; n <= 8; n++) {
      for (let i = 0; i < 3; i++) {
        useGameStore.getState().recordAnswer(n, 'counting', true);
      }
    }
    const events = useGameStore.getState().pendingUnlockEvents;
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'floor', floorId: 'floor2' })
    );
  });

  it('does NOT emit duplicate events on subsequent answers', () => {
    for (let n = 1; n <= 5; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    useGameStore.getState().clearUnlockEvents();

    // One more correct answer — feed already unlocked, should not re-emit
    useGameStore.getState().recordAnswer(6, 'counting', true);
    expect(useGameStore.getState().pendingUnlockEvents).toHaveLength(0);
  });

  it('clearUnlockEvents clears all events', () => {
    for (let n = 1; n <= 5; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    expect(useGameStore.getState().pendingUnlockEvents.length).toBeGreaterThan(0);
    useGameStore.getState().clearUnlockEvents();
    expect(useGameStore.getState().pendingUnlockEvents).toHaveLength(0);
  });

  it('multiple unlock events accumulate', () => {
    // Trigger feed unlock
    for (let n = 1; n <= 5; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
    }
    // Trigger bubbles unlock (same answers but for feed)
    for (let n = 1; n <= 3; n++) {
      useGameStore.getState().recordAnswer(n, 'feed', true);
    }
    const events = useGameStore.getState().pendingUnlockEvents;
    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events).toContainEqual(expect.objectContaining({ mechanic: 'feed' }));
    expect(events).toContainEqual(expect.objectContaining({ mechanic: 'bubbles' }));
  });
});

describe('Star tracking during unlock cascade', () => {
  it('stars increment independently of unlocks', () => {
    useGameStore.getState().addStar();
    useGameStore.getState().addStar();
    useGameStore.getState().addStar();
    expect(useGameStore.getState().totalStars).toBe(3);
  });

  it('session tracks numbers and mechanics across unlocks', () => {
    useGameStore.getState().startSession();
    for (let n = 1; n <= 5; n++) {
      useGameStore.getState().recordAnswer(n, 'counting', true);
      useGameStore.getState().addStar();
    }
    useGameStore.getState().recordAnswer(1, 'feed', true);
    useGameStore.getState().endSession();

    const log = useGameStore.getState().sessionLog;
    expect(log).toHaveLength(1);
    expect(log[0].numbersPlayed).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    expect(log[0].mechanicsUsed).toEqual(expect.arrayContaining(['counting', 'feed']));
    expect(log[0].starsEarned).toBe(5);
  });
});
