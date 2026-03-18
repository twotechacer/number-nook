import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LockOverlay } from '@/components/ui/LockOverlay';

describe('LockOverlay', () => {
  it('renders lock emoji', () => {
    render(<LockOverlay />);
    expect(screen.getByText('🔒')).toBeTruthy();
  });

  it('renders message when provided', () => {
    render(<LockOverlay message="Complete 3 more to unlock" />);
    expect(screen.getByText('Complete 3 more to unlock')).toBeTruthy();
  });

  it('does NOT render message when not provided', () => {
    render(<LockOverlay />);
    // Only lock emoji should be present, no message text
    expect(screen.queryByText(/Complete/)).toBeNull();
  });

  it('renders with empty message', () => {
    render(<LockOverlay message="" />);
    expect(screen.getByText('🔒')).toBeTruthy();
  });
});
