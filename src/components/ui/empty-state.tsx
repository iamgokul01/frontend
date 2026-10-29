import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
        <Icon name={icon} className="text-[26px]" />
      </span>
      <h3 className="mt-4 font-headline text-base font-bold text-on-surface">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: IconName;
  trend?: { value: number; caption?: string };
  tone?: 'primary' | 'tertiary';
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  trend,
  tone = 'primary',
}: StatCardProps) {
  const trendPositive = (trend?.value ?? 0) >= 0;
  const toneClass =
    tone === 'primary'
      ? 'bg-primary-container/30 text-primary'
      : 'bg-tertiary-container/30 text-tertiary';

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
          {label}
        </span>
        {icon ? (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}
          >
            <Icon name={icon} className="text-[19px]" />
          </span>
        ) : null}
      </div>

      <p className="mt-3 font-headline text-3xl font-bold tracking-tight text-on-surface">
        {value}
      </p>

      {trend ? (
        <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-3">
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold ${
              trendPositive ? 'text-primary' : 'text-error'
            }`}
          >
            <Icon
              name={trendPositive ? 'trending_up' : 'trending_down'}
              className="text-[14px]"
            />
            {trend.value > 0 ? '+' : ''}
            {trend.value.toFixed(1)}%
          </span>
          {trend.caption ? (
            <span className="text-[11px] text-on-surface-variant">{trend.caption}</span>
          ) : null}
        </div>
      ) : null}

      {hint ? <p className="mt-3 text-xs text-on-surface-variant">{hint}</p> : null}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-on-surface-variant">
      <Icon name="progress_activity" className="animate-spin text-[22px]" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}
