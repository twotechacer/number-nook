import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { useGameStore } from '@/store/useGameStore';
import { router } from 'expo-router';
import Onboarding from '../../app/onboarding';

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  useGameStore.getState().resetProgress();
});

describe('Onboarding screen', () => {
  it('renders title and subtitle', () => {
    render(<Onboarding />);
    expect(screen.getByText('Number Nook')).toBeTruthy();
    expect(screen.getByText("What's your little one's name?")).toBeTruthy();
  });

  it('renders treehouse emoji', () => {
    render(<Onboarding />);
    expect(screen.getByText('🌳')).toBeTruthy();
  });

  it('shows "Let\'s go!" when no name entered', () => {
    render(<Onboarding />);
    expect(screen.getByText("Let's go!")).toBeTruthy();
  });

  it('shows personalized button text when name entered', () => {
    render(<Onboarding />);
    fireEvent.changeText(screen.getByPlaceholderText('Type their name here...'), 'Aria');
    expect(screen.getByText("Let's go, Aria!")).toBeTruthy();
  });

  it('sets child name in store on start', () => {
    render(<Onboarding />);
    fireEvent.changeText(screen.getByPlaceholderText('Type their name here...'), 'Aria');
    fireEvent.press(screen.getByText("Let's go, Aria!"));
    expect(useGameStore.getState().childName).toBe('Aria');
  });

  it('navigates to home on start', () => {
    render(<Onboarding />);
    fireEvent.press(screen.getByText("Let's go!"));
    expect(router.replace).toHaveBeenCalledWith('/home');
  });

  it('navigates to home on skip', () => {
    render(<Onboarding />);
    fireEvent.press(screen.getByText('Skip for now'));
    expect(router.replace).toHaveBeenCalledWith('/home');
  });

  it('does NOT set name when skipping', () => {
    render(<Onboarding />);
    fireEvent.press(screen.getByText('Skip for now'));
    expect(useGameStore.getState().childName).toBe('');
  });

  it('trims whitespace from name', () => {
    render(<Onboarding />);
    fireEvent.changeText(screen.getByPlaceholderText('Type their name here...'), '  Aria  ');
    fireEvent.press(screen.getByText("Let's go, Aria!"));
    expect(useGameStore.getState().childName).toBe('Aria');
  });

  it('does NOT set name when only whitespace entered', () => {
    render(<Onboarding />);
    fireEvent.changeText(screen.getByPlaceholderText('Type their name here...'), '   ');
    fireEvent.press(screen.getByText("Let's go!"));
    expect(useGameStore.getState().childName).toBe('');
  });
});
