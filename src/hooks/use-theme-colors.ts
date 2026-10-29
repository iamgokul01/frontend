import { useMemo } from 'react';
import { useTheme } from '@/theme/theme-provider';

export interface ThemeColors {
  views: string;
  likes: string;
  grid: string;
  surface: string;
  surfaceContainer: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
}

export function useThemeColors(): ThemeColors {
  const { resolvedMode } = useTheme();

  return useMemo(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string) => styles.getPropertyValue(name).trim();

    return {
      views: read('--app-chart-views'),
      likes: read('--app-chart-likes'),
      grid: read('--app-chart-grid'),
      surface: read('--app-surface'),
      surfaceContainer: read('--app-surface-container'),
      onSurface: read('--app-on-surface'),
      onSurfaceVariant: read('--app-on-surface-variant'),
      outline: read('--app-outline-variant'),
    };
  }, [resolvedMode]);
}
