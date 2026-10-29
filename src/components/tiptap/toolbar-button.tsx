import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '@/components/ui/icon';

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  active?: boolean;
  compact?: boolean;
}

export function ToolbarButton({
  icon,
  label,
  active = false,
  compact = false,
  className = '',
  ...rest
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`flex shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-35 ${
        compact ? 'h-7 w-7' : 'h-8 w-8'
      } ${
        active
          ? 'bg-primary-container text-primary'
          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
      } ${className}`}
      {...rest}
    >
      <Icon name={icon} className={compact ? 'text-[15px]' : 'text-[17px]'} />
    </button>
  );
}
