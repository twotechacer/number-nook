import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { BubbleField } from '@/components/game/BubbleField';

// We need to mock the layout event since it won't fire in test environment
jest.useFakeTimers();

describe('BubbleField', () => {
  const defaultProps = {
    count: 3,
    poppedCount: 0,
    color: '#A4D2E1',
    onPop: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
  });

  it('renders the field container', () => {
    render(<BubbleField {...defaultProps} />);
    expect(screen.getByTestId('bubble-field')).toBeTruthy();
  });

  it('renders bubbles after layout', () => {
    render(<BubbleField {...defaultProps} />);
    // Simulate layout event
    fireEvent(screen.getByTestId('bubble-field'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 400 } },
    });
    // After layout, bubbles should render
    expect(screen.getByTestId('bubble-0')).toBeTruthy();
    expect(screen.getByTestId('bubble-1')).toBeTruthy();
    expect(screen.getByTestId('bubble-2')).toBeTruthy();
  });

  it('calls onPop when bubble is tapped', () => {
    render(<BubbleField {...defaultProps} />);
    fireEvent(screen.getByTestId('bubble-field'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 400 } },
    });
    fireEvent.press(screen.getByTestId('bubble-0'));
    expect(defaultProps.onPop).toHaveBeenCalledTimes(1);
  });

  it('renders correct number of bubbles', () => {
    render(<BubbleField {...defaultProps} count={5} />);
    fireEvent(screen.getByTestId('bubble-field'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 400 } },
    });
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`bubble-${i}`)).toBeTruthy();
    }
  });

  it('does not render bubbles with count 0', () => {
    render(<BubbleField {...defaultProps} count={0} />);
    fireEvent(screen.getByTestId('bubble-field'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 400 } },
    });
    expect(screen.queryByTestId('bubble-0')).toBeNull();
  });
});
