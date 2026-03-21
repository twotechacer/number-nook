import React from 'react';
import { render } from '@testing-library/react-native';
import { NumeralChoice } from '@/components/game/NumeralChoice';

describe('NumeralChoice hint animation', () => {
  it('renders without crashing when isHinted is true', () => {
    const { getByTestId } = render(
      <NumeralChoice value={5} onSelect={jest.fn()} isHinted={true} />
    );
    expect(getByTestId('choice-5')).toBeTruthy();
  });

  it('renders without crashing when isHinted is false', () => {
    const { getByTestId } = render(
      <NumeralChoice value={3} onSelect={jest.fn()} isHinted={false} />
    );
    expect(getByTestId('choice-3')).toBeTruthy();
  });

  it('renders correctly with default isHinted (undefined)', () => {
    const { getByTestId } = render(
      <NumeralChoice value={7} onSelect={jest.fn()} />
    );
    expect(getByTestId('choice-7')).toBeTruthy();
  });
});
