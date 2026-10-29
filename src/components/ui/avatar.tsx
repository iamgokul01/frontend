import { initialsOf } from '@/lib/formatters';
import { roleBadgeClass } from '@/lib/permissions';
import type { Role } from '@/lib/api-types';

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASS = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
};

export function Avatar({ name, url, size = 'md' }: AvatarProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${SIZE_CLASS[size]} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${SIZE_CLASS[size]} flex shrink-0 items-center justify-center rounded-full bg-primary-container font-bold text-on-primary-container`}
    >
      {initialsOf(name)}
    </span>
  );
}

interface RoleBadgeProps {
  role: Role;
  label?: string;
}

export function RoleBadge({ role, label }: RoleBadgeProps) {
  return (
    <span className={`role-badge ${roleBadgeClass(role)}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label ?? role}
    </span>
  );
}
