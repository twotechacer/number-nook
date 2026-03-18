import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useGameStore } from '@/store/useGameStore';
import { Alert } from 'react-native';
import Settings from '../../app/(parent)/settings';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
  useGameStore.getState().resetProgress();
});

describe('Settings screen', () => {
  it('renders title', () => {
    render(<Settings />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders name edit input', () => {
    useGameStore.getState().setChildName('Aria');
    render(<Settings />);
    expect(screen.getByTestId('name-edit-input')).toBeTruthy();
  });

  it('renders sound toggle', () => {
    render(<Settings />);
    expect(screen.getByTestId('sound-toggle')).toBeTruthy();
  });

  it('renders ambient toggle', () => {
    render(<Settings />);
    expect(screen.getByTestId('ambient-toggle')).toBeTruthy();
  });

  it('renders auto-unlock toggle', () => {
    render(<Settings />);
    expect(screen.getByTestId('auto-unlock-toggle')).toBeTruthy();
  });

  it('renders floor override toggles', () => {
    render(<Settings />);
    expect(screen.getByTestId('floor2-override')).toBeTruthy();
    expect(screen.getByTestId('floor3-override')).toBeTruthy();
  });

  it('renders view report button', () => {
    render(<Settings />);
    expect(screen.getByText('View Progress Report')).toBeTruthy();
  });

  it('renders reset button', () => {
    render(<Settings />);
    expect(screen.getByText('Reset All Progress')).toBeTruthy();
  });

  it('shows confirmation alert on reset', () => {
    render(<Settings />);
    fireEvent.press(screen.getByText('Reset All Progress'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Reset All Progress?',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('renders section titles', () => {
    render(<Settings />);
    expect(screen.getByText("Child's Name")).toBeTruthy();
    expect(screen.getByText('Sound')).toBeTruthy();
    expect(screen.getByText('Floor Unlocks')).toBeTruthy();
    expect(screen.getByText('Progress')).toBeTruthy();
    expect(screen.getByText('Danger Zone')).toBeTruthy();
  });
});
