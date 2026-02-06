import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders payments dashboard header', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /payment control center/i });
  expect(heading).toBeInTheDocument();
});
