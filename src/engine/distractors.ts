import { shuffle } from '@/utils/numberHelpers';

/**
 * Generate 3 answer choices: the correct answer + 2 distractors.
 * Distractors are within ±1 or ±2 of target, filtered to 1–50 range.
 * Returns shuffled array of [correct, distractor1, distractor2].
 */
export function generateDistractors(target: number): [number, number, number] {
  const pool = [target - 2, target - 1, target + 1, target + 2].filter(
    (n) => n >= 1 && n <= 50 && n !== target
  );

  // Pick 2 unique distractors from pool
  const shuffledPool = shuffle(pool);
  const distractors = shuffledPool.slice(0, 2);

  // Return all 3 in random order
  return shuffle([target, ...distractors]) as [number, number, number];
}
