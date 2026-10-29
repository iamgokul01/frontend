import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { formatCompactNumber } from '@/lib/formatters';
import type { RoleEngagement } from '@/lib/api-types';

interface RoleEngagementChartProps {
  roles: RoleEngagement[];
}

export function RoleEngagementChart({ roles }: RoleEngagementChartProps) {
  const colors = useThemeColors();
  const hasData = roles.some((role) => role.volume > 0);

  if (!hasData) {
    return (
      <p className="px-5 py-10 text-center text-sm text-on-surface-variant">
        Engagement by access level appears once members interact with the feed.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={roles} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: colors.onSurfaceVariant, fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: colors.onSurfaceVariant, fontSize: 11 }}
              width={48}
            />
            <Tooltip
              cursor={{ fill: colors.grid, fillOpacity: 0.35 }}
              contentStyle={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.outline}`,
                borderRadius: 12,
                color: colors.onSurface,
                fontSize: 12,
              }}
            />
            <Bar dataKey="volume" radius={[6, 6, 0, 0]} fill={colors.views} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-col gap-2.5 px-5 pb-5">
        {roles.map((role) => (
          <li key={role.role}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="inline-flex items-center gap-2 font-semibold text-on-surface">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {role.label}
              </span>
              <span className="text-on-surface-variant">
                <span className="font-bold text-on-surface">{role.percentage}%</span> (
                {formatCompactNumber(role.volume)})
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(role.percentage, 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
