import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders game setup screen initially', () => {
  render(<App />);

  // Should show game setup screen before game starts
  // Looking for player count selection options (3, 4, or 5 players)
  const setupElement = screen.getByText(/Signal to Noise/i);
  expect(setupElement).toBeInTheDocument();
});
