export type SoundEvent =
  | 'object_tap'
  | 'bubble_pop'
  | 'treat_feed'
  | 'correct_answer'
  | 'wrong_answer'
  | 'star_earned'
  | 'tummy_full'
  | 'unlock';

/* eslint-disable @typescript-eslint/no-var-requires */
export const SOUND_ASSETS: Record<SoundEvent, number> = {
  object_tap: require('../../assets/audio/sfx/object_tap.wav'),
  bubble_pop: require('../../assets/audio/sfx/bubble_pop.wav'),
  treat_feed: require('../../assets/audio/sfx/treat_feed.wav'),
  correct_answer: require('../../assets/audio/sfx/correct_answer.wav'),
  wrong_answer: require('../../assets/audio/sfx/wrong_answer.wav'),
  star_earned: require('../../assets/audio/sfx/star_earned.wav'),
  tummy_full: require('../../assets/audio/sfx/tummy_full.wav'),
  unlock: require('../../assets/audio/sfx/unlock.wav'),
};
