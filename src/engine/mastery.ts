import { MasteryStatus, NumberStats, FloorId } from '@/types/game';
import { MASTERY_THRESHOLD } from '@/data/thresholds';

/** Determine mastery status for a single number */
export function getMasteryStatus(stats: NumberStats | undefined): MasteryStatus {
  if (!stats || (stats.correct === 0 && stats.wrong === 0)) return 'not_started';
  if (stats.correct >= MASTERY_THRESHOLD) return 'mastered';
  return 'practiced';
}

/** Check if a number is mastered (correct >= threshold) */
export function isNumberMastered(stats: NumberStats | undefined): boolean {
  return (stats?.correct ?? 0) >= MASTERY_THRESHOLD;
}

/** Count how many numbers in [from, to] are mastered */
export function countMastered(
  mastery: Record<string, NumberStats>,
  from: number,
  to: number
): number {
  let count = 0;
  for (let n = from; n <= to; n++) {
    if (isNumberMastered(mastery[String(n)])) count++;
  }
  return count;
}

/** Get mastery percentage for a floor's number range */
export function getFloorMasteryPercent(
  mastery: Record<string, NumberStats>,
  floor: FloorId
): number {
  const ranges: Record<FloorId, [number, number]> = {
    floor1: [1, 10],
    floor2: [11, 30],
    floor3: [31, 50],
  };
  const [from, to] = ranges[floor];
  const total = to - from + 1;
  const mastered = countMastered(mastery, from, to);
  return Math.round((mastered / total) * 100);
}

/** Get up to N numbers that need the most practice (highest wrong count, not yet mastered) */
export function getNumbersNeedingPractice(
  mastery: Record<string, NumberStats>,
  from: number,
  to: number,
  limit: number = 3
): number[] {
  const candidates: { num: number; wrong: number }[] = [];

  for (let n = from; n <= to; n++) {
    const stats = mastery[String(n)];
    if (stats && !isNumberMastered(stats) && stats.wrong > 0) {
      candidates.push({ num: n, wrong: stats.wrong });
    }
  }

  return candidates
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, limit)
    .map((c) => c.num);
}

/** Get next suggested numbers to try (unmastered, least practiced) */
export function getNextSuggestedNumbers(
  mastery: Record<string, NumberStats>,
  from: number,
  to: number,
  limit: number = 2
): number[] {
  const candidates: { num: number; attempts: number }[] = [];

  for (let n = from; n <= to; n++) {
    const stats = mastery[String(n)];
    if (!isNumberMastered(stats)) {
      const attempts = (stats?.correct ?? 0) + (stats?.wrong ?? 0);
      candidates.push({ num: n, attempts });
    }
  }

  return candidates
    .sort((a, b) => a.attempts - b.attempts)
    .slice(0, limit)
    .map((c) => c.num);
}
