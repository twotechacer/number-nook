import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useGameStore } from '@/store/useGameStore';
import Home from '../../app/home';

beforeEach(() => {
  jest.clearAllMocks();
  useGameStore.getState().resetProgress();
});

describe('Home screen', () => {
  it('renders title', () => {
    render(<Home />);
    expect(screen.getByText('Number Nook')).toBeTruthy();
  });

  it('shows generic subtitle when no name set', () => {
    render(<Home />);
    expect(screen.getByText('pick a floor to explore')).toBeTruthy();
  });

  it('shows personalized subtitle when name is set', () => {
    useGameStore.getState().setChildName('Aria');
    render(<Home />);
    expect(screen.getByText('Hi Aria! Pick a floor')).toBeTruthy();
  });

  it('renders all 3 floor names', () => {
    render(<Home />);
    expect(screen.getByText('Floor 1')).toBeTruthy();
    expect(screen.getByText('Floor 2')).toBeTruthy();
    expect(screen.getByText('Floor 3')).toBeTruthy();
  });

  it('renders star counter', () => {
    render(<Home />);
    expect(screen.getByText('0 stars collected')).toBeTruthy();
  });

  it('updates star counter', () => {
    useGameStore.getState().addStar();
    useGameStore.getState().addStar();
    useGameStore.getState().addStar();
    render(<Home />);
    expect(screen.getByText('3 stars collected')).toBeTruthy();
  });

  it('shows settings button', () => {
    render(<Home />);
    expect(screen.getByText('👤')).toBeTruthy();
  });

  it('renders number ranges for floors', () => {
    render(<Home />);
    expect(screen.getByText('1 – 10')).toBeTruthy();
    expect(screen.getByText('11 – 30')).toBeTruthy();
    expect(screen.getByText('31 – 50')).toBeTruthy();
  });

  it('shows lock icon on locked floors', () => {
    render(<Home />);
    // Floors 2 and 3 are locked by default — they show 🔒
    const locks = screen.getAllByText('🔒');
    expect(locks.length).toBe(2); // Floor 2 and Floor 3
  });

  it('shows mastery progress text', () => {
    render(<Home />);
    expect(screen.getByText('0 of 10 numbers mastered')).toBeTruthy();
  });
});
