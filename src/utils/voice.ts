import * as Speech from 'expo-speech';
import { useGameStore } from '@/store/useGameStore';
import { NUMBER_WORDS } from '@/data/numberWords';

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
  speak(`Find ... ${numWord}`, 0.55);
}

export function speakFindRetry(number: number): void {
  const numWord = NUMBER_WORDS[number] || String(number);
  speak(`Try again. ... Find ${numWord}`, 0.55);
}

export function stopSpeech(): void {
  Speech.stop();
}
