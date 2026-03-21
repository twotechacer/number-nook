import { NumberStats } from '@/types/game';
import { isNumberMastered } from './mastery';

/**
 * Select the next number to practice using weighted random selection.
 * - Unplayed numbers: weight 10 (strong pull)
 * - Practiced but not mastered: weight 7
 * - Mastered: weight 2 + recency boost (up to 3)
 * - Recently played numbers (last 3) are excluded to avoid repeats.
 */
export function selectNextNumber(
  mastery: Record<string, NumberStats>,
  floorRange: [number, number],
  recentNumbers: number[] = []
): number {
  const [from, to] = floorRange;
  const allNumbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);

  let candidates = allNumbers.filter((n) => !recentNumbers.includes(n));
  if (candidates.length === 0) candidates = allNumbers;

  const weights = candidates.map((n) => {
    const stats = mastery[String(n)];
    if (!stats || (stats.correct === 0 && stats.wrong === 0)) return 10;
    if (!isNumberMastered(stats)) {
      let weight = 7;
      const totalAttempts = stats.correct + stats.wrong;
      if (totalAttempts > 0) {
        const errorRatio = stats.wrong / totalAttempts;
        weight += Math.round(errorRatio * 8);
      }
      return weight;
    }
    const daysSinceLastPlayed =
      stats.lastPlayed > 0
        ? (Date.now() - stats.lastPlayed) / (1000 * 60 * 60 * 24)
        : 3;
    const recencyBoost = Math.min(daysSinceLastPlayed, 3);
    return 2 + recencyBoost;
  });

  return weightedRandomPick(candidates, weights);
}

function weightedRandomPick(items: number[], weights: number[]): number {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return items[i];
  }
  return items[items.length - 1];
}
