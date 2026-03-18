import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { UnlockBanner } from '@/components/ui/UnlockBanner';

describe('UnlockBanner', () => {
  const defaultProps = {
    message: 'Feed the animals unlocked!',
    emoji: '🎉',
    visible: true,
    onDismiss: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders message when visible', () => {
    render(<UnlockBanner {...defaultProps} />);
    expect(screen.getByText('Feed the animals unlocked!')).toBeTruthy();
  });

  it('renders emoji when visible', () => {
    render(<UnlockBanner {...defaultProps} />);
    expect(screen.getByText('🎉')).toBeTruthy();
  });

  it('renders sparkle emoji', () => {
    render(<UnlockBanner {...defaultProps} />);
    expect(screen.getByText('✨')).toBeTruthy();
  });

  it('returns null when not visible', () => {
    const { toJSON } = render(<UnlockBanner {...defaultProps} visible={false} />);
    expect(toJSON()).toBeNull();
  });

  it('renders different messages', () => {
    render(<UnlockBanner {...defaultProps} message="Pop the bubbles unlocked!" emoji="🫧" />);
    expect(screen.getByText('Pop the bubbles unlocked!')).toBeTruthy();
    expect(screen.getByText('🫧')).toBeTruthy();
  });
});
