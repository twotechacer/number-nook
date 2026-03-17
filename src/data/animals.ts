import { AnimalConfig } from '@/types/game';

export const ANIMALS: AnimalConfig[] = [
  {
    id: 'benny-bear',
    name: 'Benny Bear',
    emoji: '🐻',
    range: [1, 5],
    floor: 'floor1',
    treat: 'honey jar',
    treatEmoji: '🍯',
    bubbleColor: '#F0C84A', // golden sparkle
  },
  {
    id: 'hattie-hedgehog',
    name: 'Hattie Hedgehog',
    emoji: '🦔',
    range: [6, 10],
    floor: 'floor1',
    treat: 'mushroom',
    treatEmoji: '🍄',
    bubbleColor: '#5A9A70', // forest green
  },
  {
    id: 'bini-bird',
    name: 'Bini Blue Bird',
    emoji: '🐦',
    range: [11, 20],
    floor: 'floor2',
    treat: 'berry',
    treatEmoji: '🫐',
    bubbleColor: '#87CEEB', // sky blue
  },
  {
    id: 'mochi-cat',
    name: 'Mochi Cat',
    emoji: '🐱',
    range: [21, 30],
    floor: 'floor2',
    treat: 'fish',
    treatEmoji: '🐟',
    bubbleColor: '#FFB6C1', // soft pink
  },
  {
    id: 'pippa-bunny',
    name: 'Pippa Bunny',
    emoji: '🐰',
    range: [31, 40],
    floor: 'floor3',
    treat: 'carrot',
    treatEmoji: '🥕',
    bubbleColor: '#C8B8E8', // lavender
  },
  {
    id: 'ellie-elephant',
    name: 'Ellie Elephant',
    emoji: '🐘',
    range: [41, 50],
    floor: 'floor3',
    treat: 'peanut',
    treatEmoji: '🥜',
    bubbleColor: '#88C8D0', // aqua teal
  },
];

export function getAnimalForNumber(n: number): AnimalConfig {
  const animal = ANIMALS.find((a) => n >= a.range[0] && n <= a.range[1]);
  if (!animal) throw new Error(`No animal found for number ${n}`);
  return animal;
}
