import { useTheme } from '@/theme/theme-provider';
import { Icon } from '@/components/ui/icon';

export function ThemeToggle() {
  const { resolvedMode, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`}
      className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
    >
      <Icon
        name={resolvedMode === 'dark' ? 'light_mode' : 'dark_mode'}
        className="text-[20px]"
      />
    </button>
  );
}
