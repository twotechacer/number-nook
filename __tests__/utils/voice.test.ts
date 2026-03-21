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
    expect(text).toContain('Find');
    expect(text).toContain('ten');
  });

  it('falls back to string for numbers outside dictionary', () => {
    speakFindPrompt(99);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toContain('Find');
    expect(text).toContain('99');
  });

  it('uses slow rate for child-friendly pacing', () => {
    speakFindPrompt(5);
    const opts = (Speech.speak as jest.Mock).mock.calls[0][1];
    expect(opts.rate).toBeLessThanOrEqual(0.6);
  });
});

describe('speakFindRetry', () => {
  it('formats with "Try again" prefix and number word', () => {
    speakFindRetry(4);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toContain('Try again');
    expect(text).toContain('Find');
    expect(text).toContain('four');
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

  it('speaks string fallback for 0', () => {
    speakNumber(0);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toBe('0');
  });

  it('speaks string fallback for 51', () => {
    speakNumber(51);
    const text = (Speech.speak as jest.Mock).mock.calls[0][0] as string;
    expect(text).toBe('51');
  });
});

describe('Speech.stop called before Speech.speak', () => {
  it('calls stop before speak for speakNumber', () => {
    const callOrder: string[] = [];
    (Speech.stop as jest.Mock).mockImplementation(() => callOrder.push('stop'));
    (Speech.speak as jest.Mock).mockImplementation(() => callOrder.push('speak'));
    speakNumber(5);
    expect(callOrder).toEqual(['stop', 'speak']);
  });

  it('calls stop before speak for speakWrongFeedback', () => {
    const callOrder: string[] = [];
    (Speech.stop as jest.Mock).mockImplementation(() => callOrder.push('stop'));
    (Speech.speak as jest.Mock).mockImplementation(() => callOrder.push('speak'));
    speakWrongFeedback(0);
    expect(callOrder).toEqual(['stop', 'speak']);
  });

  it('calls stop before speak for speakCorrectFeedback', () => {
    const callOrder: string[] = [];
    (Speech.stop as jest.Mock).mockImplementation(() => callOrder.push('stop'));
    (Speech.speak as jest.Mock).mockImplementation(() => callOrder.push('speak'));
    speakCorrectFeedback(3);
    expect(callOrder).toEqual(['stop', 'speak']);
  });
});

describe('rapid sequential calls', () => {
  it('does not crash when called rapidly in sequence', () => {
    expect(() => {
      speakWrongFeedback(0);
      speakCorrectFeedback(5, 'Luna');
      speakWrongFeedback(1);
      speakFindPrompt(10);
      speakFindRetry(3);
    }).not.toThrow();
  });
});
