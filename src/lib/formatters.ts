export const formatCompactNumber = (value: number): string => {
  if (!value) return '0';
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  }
  return String(value);
};

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US').format(value);

export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

export const formatSignedPercent = (value: number): string =>
  `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

export const formatRelativeTime = (value: string | null): string => {
  if (!value) return 'Never';

  const timestamp = new Date(value).getTime();
  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.345],
    ['month', 12],
    ['year', Number.POSITIVE_INFINITY],
  ];

  let duration = diffSeconds;

  for (const [unit, amount] of units) {
    if (Math.abs(duration) < amount) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        Math.round(duration),
        unit,
      );
    }
    duration /= amount;
  }

  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.round(duration),
    'year',
  );
};

export const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));

export const initialsOf = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
