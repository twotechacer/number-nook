import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react-native';
import { NumeralChoice } from '@/components/game/NumeralChoice';

describe('NumeralChoice', () => {
  const defaultProps = {
    value: 5,
    onSelect: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the number', () => {
    render(<NumeralChoice {...defaultProps} />);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('calls onSelect with value when pressed', () => {
    render(<NumeralChoice {...defaultProps} />);
    fireEvent.press(screen.getByText('5'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith(5);
  });

  it('renders different numbers', () => {
    render(<NumeralChoice {...defaultProps} value={12} />);
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('does not crash when disabled', () => {
    render(<NumeralChoice {...defaultProps} disabled={true} />);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('renders with correct feedback when isCorrect is true', () => {
    const { toJSON } = render(<NumeralChoice {...defaultProps} isCorrect={true} />);
    // Should render without crashing — feedback styling is applied
    expect(toJSON()).toBeTruthy();
  });

  it('renders with correct feedback when isCorrect is false', () => {
    const { toJSON } = render(<NumeralChoice {...defaultProps} isCorrect={false} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with null feedback (no highlight)', () => {
    const { toJSON } = render(<NumeralChoice {...defaultProps} isCorrect={null} />);
    expect(toJSON()).toBeTruthy();
  });
});
