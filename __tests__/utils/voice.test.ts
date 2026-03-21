jest.unmock('@/utils/voice');

import * as Speech from 'expo-speech';
import { useGameStore } from '@/store/useGameStore';
import {
  speakNumber,
  speakWrongFeedback,
  speakCorrectFeedback,
  speakFindPrompt,
  speakFindRetry,
} from '@/utils/voice';

// Mock useGameStore to control soundEnabled
jest.mock('@/store/useGameStore', () => ({
  useGameStore: {
    getState: jest.fn(),
  },
}));

const mockGetState = useGameStore.getState as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetState.mockReturnValue({ settings: { soundEnabled: true } });
});

describe('speakCorrectFeedback', () => {
  it('includes number word in spoken text', () => {
    speakCorrectFeedback(5);
    expect(Speech.speak).toHaveBeenCalledTimes(1);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toContain('five');
  });

  it('includes child name when provided', () => {
    speakCorrectFeedback(3, 'Lily');
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toContain('three');
    expect(text).toContain('Lily');
  });

  it('does not include child name when not provided', () => {
    speakCorrectFeedback(7);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toContain('seven');
    expect(text).not.toContain('undefined');
  });
});

describe('speakWrongFeedback', () => {
  it('rotates through wrong phrases', () => {
    const phrases: string[] = [];
    for (let i = 0; i < 4; i++) {
      jest.clearAllMocks();
      speakWrongFeedback(i);
      phrases.push((Speech.speak as jest.Mock).mock.calls[0][0]);
    }
    // All 4 should be different
    const unique = new Set(phrases);
    expect(unique.size).toBe(4);
  });

  it('wraps around after exhausting phrases', () => {
    speakWrongFeedback(0);
    const first = (Speech.speak as jest.Mock).mock.calls[0][0];
    jest.clearAllMocks();
    speakWrongFeedback(4);
    const fifth = (Speech.speak as jest.Mock).mock.calls[0][0];
    expect(first).toBe(fifth);
  });
});

describe('soundEnabled setting', () => {
  it('does not speak when sound is disabled', () => {
    mockGetState.mockReturnValue({ settings: { soundEnabled: false } });
    speakNumber(5);
    expect(Speech.speak).not.toHaveBeenCalled();
    expect(Speech.stop).not.toHaveBeenCalled();
  });

  it('speaks when sound is enabled', () => {
    mockGetState.mockReturnValue({ settings: { soundEnabled: true } });
    speakNumber(5);
    expect(Speech.speak).toHaveBeenCalledTimes(1);
  });
});

describe('speakFindPrompt', () => {
  it('formats with "Find" prefix and number word', () => {
    speakFindPrompt(10);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toBe('Find ten');
  });

  it('falls back to string for numbers outside dictionary', () => {
    speakFindPrompt(99);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toBe('Find 99');
  });
});

describe('speakFindRetry', () => {
  it('formats with "Try again" prefix and number word', () => {
    speakFindRetry(4);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toBe('Try again. Find four');
  });
});

describe('speakNumber', () => {
  it('speaks a known number word', () => {
    speakNumber(20);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toBe('twenty');
  });

  it('speaks string fallback for unknown number', () => {
    speakNumber(100);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toBe('100');
  });
});
