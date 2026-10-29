import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { EmptyState } from '@/components/ui/empty-state';
import type { TimeseriesPoint } from '@/lib/api-types';

interface TrendChartProps {
  series: TimeseriesPoint[];
  peak: { day: string; views: number; likes: number };
}

export function TrendChart({ series, peak }: TrendChartProps) {
  const colors = useThemeColors();
  const hasData = series.some((point) => point.views > 0 || point.likes > 0);

  if (!hasData) {
    return (
      <EmptyState
        icon="trending_up"
        title="No telemetry in this window"
        description="Views and likes appear here once members start reading and reacting to posts."
      />
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 16, right: 16, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.views} stopOpacity={0.45} />
              <stop offset="100%" stopColor={colors.views} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="likesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.likes} stopOpacity={0.35} />
              <stop offset="100%" stopColor={colors.likes} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.onSurfaceVariant, fontSize: 11 }}
            minTickGap={28}
            tickFormatter={(value: string) => value.slice(5)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: colors.onSurfaceVariant, fontSize: 11 }}
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.outline}`,
              borderRadius: 12,
              color: colors.onSurface,
              fontSize: 12,
            }}
            labelStyle={{ color: colors.onSurface, fontWeight: 700 }}
          />

          {peak.day ? (
            <ReferenceLine
              x={peak.day}
              stroke={colors.views}
              strokeDasharray="4 4"
              strokeOpacity={0.7}
            />
          ) : null}

          <Area
            type="monotone"
            dataKey="views"
            stroke={colors.views}
            strokeWidth={2}
            fill="url(#viewsFill)"
            name="Views (Total Reach)"
          />
          <Area
            type="monotone"
            dataKey="likes"
            stroke={colors.likes}
            strokeWidth={2}
            fill="url(#likesFill)"
            name="Likes (Organic Affinity)"
          />

          {peak.day && peak.views > 0 ? (
            <ReferenceDot
              x={peak.day}
              y={peak.views}
              r={5}
              fill={colors.views}
              stroke={colors.surface}
              strokeWidth={2}
              label={{
                value: `Day ${peak.day.slice(-2)} Peak · ${peak.views} views`,
                position: 'top',
                fill: colors.onSurface,
                fontSize: 11,
                fontWeight: 700,
              }}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
