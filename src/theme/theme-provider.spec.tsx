import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from './theme-provider';

function Probe() {
  const { resolvedMode, toggle } = useTheme();

  return (
    <button type="button" onClick={toggle}>
      {resolvedMode}
    </button>
  );
}

describe('ThemeProvider', () => {
  it('applies the light mode by default', () => {
    window.localStorage.removeItem('vibesocial-theme');

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(screen.getByRole('button')).toHaveTextContent('light');
  });

  it('toggles to dark mode and marks the document', async () => {
    window.localStorage.removeItem('vibesocial-theme');

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(screen.getByRole('button')).toHaveTextContent('dark');
  });

  it('persists the chosen mode', async () => {
    window.localStorage.removeItem('vibesocial-theme');

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(window.localStorage.getItem('vibesocial-theme')).toBe('dark');
    });
  });

  it('restores a stored mode on mount', () => {
    window.localStorage.setItem('vibesocial-theme', 'dark');

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('button')).toHaveTextContent('dark');
  });
});
