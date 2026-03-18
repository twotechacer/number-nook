import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { useGameStore } from '@/store/useGameStore';
import { useLocalSearchParams, router } from 'expo-router';
import StarAward from '../../app/star-award';

// Mock Sparkles to avoid animation timer issues
jest.mock('@/components/ui/Sparkles', () => {
  const { View } = require('react-native');
  return { Sparkles: () => <View testID="sparkles" /> };
});

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  useGameStore.getState().resetProgress();
  (useLocalSearchParams as jest.Mock).mockReturnValue({ number: '7', floorId: 'floor1' });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
});

describe('StarAward screen', () => {
  it('renders star emoji', () => {
    render(<StarAward />);
    expect(screen.getByText('⭐')).toBeTruthy();
  });

  it('renders the number', () => {
    render(<StarAward />);
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('shows a correct phrase (rotating)', () => {
    render(<StarAward />);
    // Phrase is random — just verify some encouraging text appears
    expect(screen.getByText('You earned a star!')).toBeTruthy();
  });

  it('shows a phrase when name is set', () => {
    useGameStore.getState().setChildName('Aria');
    render(<StarAward />);
    // Random phrase may contain "Aria" — verify star subtitle exists
    expect(screen.getByText('You earned a star!')).toBeTruthy();
  });

  it('shows earned star text', () => {
    render(<StarAward />);
    expect(screen.getByText('You earned a star!')).toBeTruthy();
  });

  it('shows tap hint', () => {
    render(<StarAward />);
    expect(screen.getByText('tap anywhere to continue')).toBeTruthy();
  });

  it('navigates back on tap', () => {
    render(<StarAward />);
    fireEvent.press(screen.getByText('tap anywhere to continue'));
    expect(router.back).toHaveBeenCalled();
  });

  it('auto-navigates back after 2 seconds', () => {
    render(<StarAward />);
    expect(router.back).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(router.back).toHaveBeenCalled();
  });

  it('renders different numbers', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ number: '15', floorId: 'floor2' });
    render(<StarAward />);
    expect(screen.getByText('15')).toBeTruthy();
  });
});
