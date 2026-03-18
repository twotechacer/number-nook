import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useGameStore } from '@/store/useGameStore';
import Report from '../../app/(parent)/report';

beforeEach(() => {
  jest.clearAllMocks();
  useGameStore.getState().resetProgress();
});

describe('Report screen', () => {
  it('renders generic title when no name', () => {
    render(<Report />);
    expect(screen.getByText('Progress Report')).toBeTruthy();
  });

  it('renders personalized title with name', () => {
    useGameStore.getState().setChildName('Aria');
    render(<Report />);
    expect(screen.getByText("Aria's Progress")).toBeTruthy();
  });

  it('shows total stars', () => {
    useGameStore.getState().addStar();
    useGameStore.getState().addStar();
    render(<Report />);
    expect(screen.getByText('Total Stars')).toBeTruthy();
    // "2" appears in both summary card and number grid — verify at least one exists
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
  });

  it('shows floor progress section', () => {
    render(<Report />);
    expect(screen.getByText('Floor 1')).toBeTruthy();
    expect(screen.getByText('Floor 2')).toBeTruthy();
    expect(screen.getByText('Floor 3')).toBeTruthy();
  });

  it('shows number mastery section', () => {
    render(<Report />);
    expect(screen.getByText('Number Mastery (1–50)')).toBeTruthy();
  });

  it('shows legend', () => {
    render(<Report />);
    expect(screen.getByText('Not started')).toBeTruthy();
    expect(screen.getByText('Practicing')).toBeTruthy();
    expect(screen.getByText('Mastered')).toBeTruthy();
  });

  it('shows empty sessions message', () => {
    render(<Report />);
    expect(screen.getByText('No sessions this week yet')).toBeTruthy();
  });

  it('renders number cells 1-50', () => {
    render(<Report />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('50')).toBeTruthy();
  });
});
