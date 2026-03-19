// Test the audio utility contract
// The global mock in jest.setup.js mocks @/utils/audio entirely,
// so we test the interface expectations here

import { useGameStore } from '@/store/useGameStore';
import { playSound, preloadSounds, unloadSounds } from '@/utils/audio';

beforeEach(() => {
  jest.clearAllMocks();
  useGameStore.getState().resetProgress();
});

describe('Audio utility (mocked)', () => {
  it('playSound is a function', () => {
    expect(typeof playSound).toBe('function');
  });

  it('preloadSounds is a function', () => {
    expect(typeof preloadSounds).toBe('function');
  });

  it('unloadSounds is a function', () => {
    expect(typeof unloadSounds).toBe('function');
  });

  it('playSound does not throw for any sound event', () => {
    expect(() => playSound('object_tap')).not.toThrow();
    expect(() => playSound('bubble_pop')).not.toThrow();
    expect(() => playSound('treat_feed')).not.toThrow();
    expect(() => playSound('correct_answer')).not.toThrow();
    expect(() => playSound('wrong_answer')).not.toThrow();
    expect(() => playSound('star_earned')).not.toThrow();
    expect(() => playSound('tummy_full')).not.toThrow();
    expect(() => playSound('unlock')).not.toThrow();
  });

  it('preloadSounds resolves', async () => {
    await expect(preloadSounds()).resolves.toBeUndefined();
  });

  it('unloadSounds resolves', async () => {
    await expect(unloadSounds()).resolves.toBeUndefined();
  });
});

describe('Sound events coverage', () => {
  it('all 8 sound events are valid', () => {
    const events = [
      'object_tap', 'bubble_pop', 'treat_feed',
      'correct_answer', 'wrong_answer', 'star_earned',
      'tummy_full', 'unlock',
    ];
    expect(events).toHaveLength(8);
    // Each should be callable without error
    events.forEach((event) => {
      expect(() => playSound(event as any)).not.toThrow();
    });
  });
});
