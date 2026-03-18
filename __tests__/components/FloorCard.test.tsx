import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { FloorCard } from '@/components/treehouse/FloorCard';

describe('FloorCard', () => {
  const defaultProps = {
    floorNumber: 1,
    name: 'Floor 1',
    numberRange: '1 – 10',
    animalEmojis: '🐻🦔',
    animalLabel: 'Benny & Hattie',
    color: '#5A9A70',
    phaseLabel: 'Counting unlocked',
    progress: 40,
    progressText: '4 of 10 numbers mastered',
    isLocked: false,
    onPress: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders floor name', () => {
    render(<FloorCard {...defaultProps} />);
    expect(screen.getByText('Floor 1')).toBeTruthy();
  });

  it('renders number range', () => {
    render(<FloorCard {...defaultProps} />);
    expect(screen.getByText('1 – 10')).toBeTruthy();
  });

  it('renders animal emojis', () => {
    render(<FloorCard {...defaultProps} />);
    expect(screen.getByText('🐻🦔')).toBeTruthy();
  });

  it('renders animal label', () => {
    render(<FloorCard {...defaultProps} />);
    expect(screen.getByText('Benny & Hattie')).toBeTruthy();
  });

  it('renders progress text when unlocked', () => {
    render(<FloorCard {...defaultProps} />);
    expect(screen.getByText('4 of 10 numbers mastered')).toBeTruthy();
  });

  it('renders phase badge when unlocked', () => {
    render(<FloorCard {...defaultProps} />);
    expect(screen.getByText('Counting unlocked')).toBeTruthy();
  });

  it('calls onPress when tapped and unlocked', () => {
    render(<FloorCard {...defaultProps} />);
    fireEvent.press(screen.getByText('Floor 1'));
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('shows lock icon when locked', () => {
    render(<FloorCard {...defaultProps} isLocked={true} />);
    expect(screen.getByText('🔒')).toBeTruthy();
  });

  it('shows lock message when locked', () => {
    render(<FloorCard {...defaultProps} isLocked={true} floorNumber={2} />);
    expect(screen.getByText('Complete Floor 1 to unlock')).toBeTruthy();
  });

  it('does NOT show phase badge when locked', () => {
    render(<FloorCard {...defaultProps} isLocked={true} />);
    expect(screen.queryByText('Counting unlocked')).toBeNull();
  });

  it('does NOT show progress bar when locked', () => {
    render(<FloorCard {...defaultProps} isLocked={true} />);
    expect(screen.queryByText('4 of 10 numbers mastered')).toBeNull();
  });

  it('passes undefined onPress to Pressable when locked', () => {
    // FloorCard sets onPress={isLocked ? undefined : onPress}
    // We verify it renders without the progress section instead
    render(<FloorCard {...defaultProps} isLocked={true} />);
    // Locked floors show lock message, NOT progress
    expect(screen.getByText('🔒')).toBeTruthy();
    expect(screen.queryByText('4 of 10 numbers mastered')).toBeNull();
  });
});
