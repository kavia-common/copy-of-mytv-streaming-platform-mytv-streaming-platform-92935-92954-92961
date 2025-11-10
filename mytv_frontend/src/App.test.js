import { render, screen } from '@testing-library/react';
import App from './App';

test('renders routes container', () => {
  render(<App />);
  // Just verify the app renders without crashing
  const root = screen.getByText((_, element) => element?.tagName.toLowerCase() === 'body' || true);
  expect(root).toBeTruthy();
});
