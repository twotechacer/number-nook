import * as Speech from 'expo-speech';
import { useGameStore } from '@/store/useGameStore';

const NUMBER_WORDS: Record<number, string> = {
  1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
  6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
  16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
  21: 'twenty one', 22: 'twenty two', 23: 'twenty three', 24: 'twenty four', 25: 'twenty five',
  26: 'twenty six', 27: 'twenty seven', 28: 'twenty eight', 29: 'twenty nine', 30: 'thirty',
  31: 'thirty one', 32: 'thirty two', 33: 'thirty three', 34: 'thirty four', 35: 'thirty five',
  36: 'thirty six', 37: 'thirty seven', 38: 'thirty eight', 39: 'thirty nine', 40: 'forty',
  41: 'forty one', 42: 'forty two', 43: 'forty three', 44: 'forty four', 45: 'forty five',
  46: 'forty six', 47: 'forty seven', 48: 'forty eight', 49: 'forty nine', 50: 'fifty',
};

const WRONG_PHRASES = ['Try again', 'Think hard', 'Almost there', 'Not quite'];
const CORRECT_PRAISES = ['Well done', 'Good job', 'Amazing', 'Brilliant', 'Awesome'];

function isSoundEnabled(): boolean {
  return useGameStore.getState().settings.soundEnabled;
}

function speak(text: string, rate = 0.85): void {
  if (!isSoundEnabled()) return;
  Speech.stop();
  Speech.speak(text, { rate, pitch: 1.0, language: 'en-US' });
}

export function speakNumber(n: number): void {
  speak(NUMBER_WORDS[n] || String(n));
}

export function speakWrongFeedback(attemptIndex: number): void {
  const phrase = WRONG_PHRASES[attemptIndex % WRONG_PHRASES.length];
  speak(phrase, 0.8);
}

export function speakCorrectFeedback(number: number, childName?: string): void {
  const numWord = NUMBER_WORDS[number] || String(number);
  const praise = CORRECT_PRAISES[Math.floor(Math.random() * CORRECT_PRAISES.length)];
  const text = childName ? `${numWord}! ${praise}, ${childName}!` : `${numWord}! ${praise}!`;
  speak(text, 0.85);
}

export function speakFindPrompt(number: number): void {
  const numWord = NUMBER_WORDS[number] || String(number);
  speak(`Find ${numWord}`, 0.75);
}

export function speakFindRetry(number: number): void {
  const numWord = NUMBER_WORDS[number] || String(number);
  speak(`Try again. Find ${numWord}`, 0.7);
}
