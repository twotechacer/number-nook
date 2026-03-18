import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Bubble } from '@/components/game/Bubble';

describe('Bubble', () => {
  const defaultProps = {
    index: 0,
    isPopped: false,
    color: '#A4D2E1',
    size: 60,
    position: { x: 50, y: 50 },
    onPop: jest.fn(),
    isLastTwo: false,
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders bubble emoji when not popped', () => {
    render(<Bubble {...defaultProps} />);
    expect(screen.getByText('🫧')).toBeTruthy();
  });

  it('renders pop emoji when popped', () => {
    render(<Bubble {...defaultProps} isPopped={true} />);
    expect(screen.getByText('💥')).toBeTruthy();
  });

  it('calls onPop when pressed', () => {
    render(<Bubble {...defaultProps} />);
    fireEvent.press(screen.getByTestId('bubble-0'));
    expect(defaultProps.onPop).toHaveBeenCalledTimes(1);
  });

  it('does NOT show bubble emoji when popped', () => {
    render(<Bubble {...defaultProps} isPopped={true} />);
    expect(screen.queryByText('🫧')).toBeNull();
  });

  it('renders with different index testID', () => {
    render(<Bubble {...defaultProps} index={3} />);
    expect(screen.getByTestId('bubble-3')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { toJSON: small } = render(<Bubble {...defaultProps} size={52} />);
    const { toJSON: large } = render(<Bubble {...defaultProps} size={72} />);
    expect(small()).toBeTruthy();
    expect(large()).toBeTruthy();
  });
});
