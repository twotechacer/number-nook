import { FloorConfig, NumberGroupKey } from '@/types/game';
import { COLORS } from './colors';

export const FLOORS: FloorConfig[] = [
  {
    id: 'floor1',
    name: 'Floor 1',
    numberRange: [1, 10],
    color: COLORS.primary,
    animals: ['benny-bear', 'hattie-hedgehog'],
    groups: ['1_10'] as NumberGroupKey[],
  },
  {
    id: 'floor2',
    name: 'Floor 2',
    numberRange: [11, 30],
    color: COLORS.floor2,
    animals: ['bini-bird', 'mochi-cat'],
    groups: ['11_20', '21_30'] as NumberGroupKey[],
  },
  {
    id: 'floor3',
    name: 'Floor 3',
    numberRange: [31, 50],
    color: COLORS.floor3,
    animals: ['pippa-bunny', 'ellie-elephant'],
    groups: ['31_40', '41_50'] as NumberGroupKey[],
  },
];

export const NUMBER_GROUPS: Record<NumberGroupKey, number[]> = {
  '1_10': Array.from({ length: 10 }, (_, i) => i + 1),
  '11_20': Array.from({ length: 10 }, (_, i) => i + 11),
  '21_30': Array.from({ length: 10 }, (_, i) => i + 21),
  '31_40': Array.from({ length: 10 }, (_, i) => i + 31),
  '41_50': Array.from({ length: 10 }, (_, i) => i + 41),
};

export function getFloorById(floorId: string): FloorConfig | undefined {
  return FLOORS.find((f) => f.id === floorId);
}
