import { COLORS } from '@/data/colors';
import { ANIMALS } from '@/data/animals';
import { FLOORS, NUMBER_GROUPS } from '@/data/floors';
import { FEED_UNLOCK_THRESHOLD, BUBBLES_UNLOCK_THRESHOLD, MASTERY_THRESHOLD } from '@/data/thresholds';
import { rangeInclusive, shuffle, clamp } from '@/utils/numberHelpers';

describe('Smoke tests', () => {
  it('should have correct color palette', () => {
    expect(COLORS.primary).toBe('#5A9A70');
    expect(COLORS.background).toBe('#F7F4EE');
    expect(COLORS.celebration).toBe('#F0C84A');
  });

  it('should have 6 animals', () => {
    expect(ANIMALS).toHaveLength(6);
  });

  it('should have 3 floors', () => {
    expect(FLOORS).toHaveLength(3);
  });

  it('should have 5 number groups covering 1-50', () => {
    const allNumbers = Object.values(NUMBER_GROUPS).flat();
    expect(allNumbers).toHaveLength(50);
    expect(allNumbers[0]).toBe(1);
    expect(allNumbers[allNumbers.length - 1]).toBe(50);
  });

  it('should have correct thresholds', () => {
    expect(FEED_UNLOCK_THRESHOLD).toBe(5);
    expect(BUBBLES_UNLOCK_THRESHOLD).toBe(3);
    expect(MASTERY_THRESHOLD).toBe(3);
  });

  it('rangeInclusive should work', () => {
    expect(rangeInclusive(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(rangeInclusive(10, 10)).toEqual([10]);
  });

  it('shuffle should return same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('clamp should constrain values', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
