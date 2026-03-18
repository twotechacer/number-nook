/** Rotating correct answer phrases — {name} is replaced with child's name */
export const CORRECT_PHRASES = [
  'Well done, {name}!',
  "Yes! That's right, {name}!",
  '{name}, you did it!',
  'Brilliant counting, {name}!',
  "I'm so proud of you, {name}!",
  'Amazing, {name}!',
  'A star for you, {name}!',
];

/** Rotating wrong answer phrases */
export const WRONG_PHRASES = [
  "Hmm, let's try again!",
  'Almost! Give it another go!',
  'So close! Try once more!',
  "Not quite — you've got this!",
];

/** Milestone celebration messages */
export const MILESTONE_MESSAGES: Record<number, { title: string; subtitle: string }> = {
  10: { title: "You're a star counter!", subtitle: '10 stars collected!' },
  25: { title: 'The treehouse is glowing!', subtitle: '25 stars — amazing!' },
  50: { title: "You're a counting champion!", subtitle: '50 stars — incredible!' },
};

export function getRandomCorrectPhrase(name?: string): string {
  const phrase = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)];
  return name ? phrase.replace('{name}', name) : phrase.replace(', {name}', '').replace('{name}, ', '').replace('{name}', '');
}

export function getRandomWrongPhrase(): string {
  return WRONG_PHRASES[Math.floor(Math.random() * WRONG_PHRASES.length)];
}

export function getMilestoneMessage(stars: number): { title: string; subtitle: string } | null {
  return MILESTONE_MESSAGES[stars] ?? null;
}
