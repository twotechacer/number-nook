import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AnimalTummy } from '@/components/game/AnimalTummy';

describe('AnimalTummy', () => {
  const defaultProps = {
    emoji: '🐻',
    name: 'Benny Bear',
    treatEmoji: '🍯',
    expression: 'waiting' as const,
    fedCount: 0,
    targetNumber: 5,
  };

  it('renders animal emoji', () => {
    render(<AnimalTummy {...defaultProps} />);
    expect(screen.getByText('🐻')).toBeTruthy();
  });

  it('shows waiting expression', () => {
    render(<AnimalTummy {...defaultProps} />);
    expect(screen.getByText('Benny is hungry!')).toBeTruthy();
  });

  it('shows eating expression', () => {
    render(<AnimalTummy {...defaultProps} expression="eating" fedCount={2} />);
    expect(screen.getByText('Benny yum yum!')).toBeTruthy();
  });

  it('shows happy expression', () => {
    render(<AnimalTummy {...defaultProps} expression="happy" />);
    expect(screen.getByText('Benny so yummy!')).toBeTruthy();
  });

  it('shows full expression', () => {
    render(<AnimalTummy {...defaultProps} expression="full" />);
    expect(screen.getByText('Benny tummy is full!')).toBeTruthy();
  });

  it('shows feed counter', () => {
    render(<AnimalTummy {...defaultProps} fedCount={3} />);
    expect(screen.getByText('3 / 5')).toBeTruthy();
  });

  it('shows treat emoji in counter', () => {
    render(<AnimalTummy {...defaultProps} />);
    expect(screen.getByText('🍯')).toBeTruthy();
  });

  it('shows star on full expression', () => {
    render(<AnimalTummy {...defaultProps} expression="full" />);
    expect(screen.getByText('⭐')).toBeTruthy();
  });

  it('does NOT show star on other expressions', () => {
    render(<AnimalTummy {...defaultProps} expression="waiting" />);
    expect(screen.queryByText('⭐')).toBeNull();
  });

  it('renders for different animals', () => {
    render(<AnimalTummy {...defaultProps} emoji="🦔" name="Hattie Hedgehog" treatEmoji="🍄" />);
    expect(screen.getByText('🦔')).toBeTruthy();
    expect(screen.getByText('Hattie is hungry!')).toBeTruthy();
    expect(screen.getByText('🍄')).toBeTruthy();
  });

  it('renders testID', () => {
    render(<AnimalTummy {...defaultProps} />);
    expect(screen.getByTestId('animal-tummy')).toBeTruthy();
  });
});
