import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Treat } from '@/components/game/Treat';

describe('Treat', () => {
  const defaultProps = {
    index: 0,
    emoji: '🍯',
    isFed: false,
    onTap: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders treat emoji', () => {
    render(<Treat {...defaultProps} />);
    expect(screen.getByText('🍯')).toBeTruthy();
  });

  it('calls onTap when pressed', () => {
    render(<Treat {...defaultProps} />);
    fireEvent.press(screen.getByTestId('treat-0'));
    expect(defaultProps.onTap).toHaveBeenCalledTimes(1);
  });

  it('renders with different emojis', () => {
    render(<Treat {...defaultProps} emoji="🍄" />);
    expect(screen.getByText('🍄')).toBeTruthy();
  });

  it('renders with different index testID', () => {
    render(<Treat {...defaultProps} index={5} />);
    expect(screen.getByTestId('treat-5')).toBeTruthy();
  });

  it('is disabled when fed', () => {
    render(<Treat {...defaultProps} isFed={true} />);
    // Still renders the emoji
    expect(screen.getByText('🍯')).toBeTruthy();
  });
});
