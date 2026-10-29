import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type AnalyticsRange } from '@/api/analytics.api';
import { extractErrorMessage } from '@/api/client';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { EmptyState, Spinner, StatCard } from '@/components/ui/empty-state';
import { TrendChart } from './trend-chart';
import { RoleEngagementChart } from './role-engagement-chart';
import { TopPostsTable } from './top-posts-table';
import {
  formatCompactNumber,
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from '@/lib/formatters';
import { Icon, type IconName } from '@/components/ui/icon';

const RANGES: { key: AnalyticsRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
];

const TOPICS = [
  'All Topics',
  'Community Culture',
  'Design Systems',
  'Security & Safety',
  'Announcements',
];

export function AnalyticsPage() {
  const { can } = usePermissions();
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [topic, setTopic] = useState('All Topics');
  const [topPage, setTopPage] = useState(1);

  const summaryQuery = useQuery({
    queryKey: ['analytics', 'summary', range],
    queryFn: () => analyticsApi.summary(range),
  });

  const timeseriesQuery = useQuery({
    queryKey: ['analytics', 'timeseries', range],
    queryFn: () => analyticsApi.timeseries(range),
  });

  const roleQuery = useQuery({
    queryKey: ['analytics', 'by-role', range],
    queryFn: () => analyticsApi.byRole(range),
  });

  const topPostsQuery = useQuery({
    queryKey: ['analytics', 'top-posts', range, topic, topPage],
    queryFn: () =>
      analyticsApi.topPosts({
        range,
        category: topic === 'All Topics' ? undefined : topic,
        page: topPage,
        limit: 5,
      }),
  });

  const summary = summaryQuery.data;
  const isLoading = summaryQuery.isLoading;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
            VibeSocial <span className="mx-1">/</span> Telemetry{' '}
            <span className="mx-1">/</span> Overview
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              Post Analytics &amp; Engagement
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/40 px-3 py-1 text-[11px] font-bold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Live Realtime
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-surface-container p-1">
            {RANGES.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setRange(option.key);
                  setTopPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  range === option.key
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {can('analytics:export') ? (
            <a
              href={analyticsApi.exportUrl(range)}
              download
              className="btn-secondary"
              aria-label="Export CSV"
            >
              <Icon name="table_view" className="text-[18px]" />
              Export CSV
            </a>
          ) : null}

          <Button variant="secondary" onClick={() => window.print()}>
            <Icon name="picture_as_pdf" className="text-[18px]" />
            PDF Report
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="surface-card">
          <Spinner label="Crunching telemetry" />
        </div>
      ) : null}

      {summaryQuery.isError ? (
        <div className="surface-card">
          <EmptyState
            icon="cloud_off"
            title="Could not load analytics"
            description={extractErrorMessage(summaryQuery.error)}
          />
        </div>
      ) : null}

      {summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Likes"
            value={formatCompactNumber(summary.totalLikes)}
            icon="favorite"
            trend={{ value: summary.deltas.likes, caption: 'vs prev period' }}
          />
          <StatCard
            label="Total Views / Impr."
            value={formatCompactNumber(summary.totalViews)}
            icon="visibility"
            trend={{ value: summary.deltas.views, caption: 'growth velocity' }}
          />
          <StatCard
            label="Total Posts Live"
            value={formatNumber(summary.totalPosts)}
            icon="post_add"
            hint={`${formatNumber(summary.totalComments)} comments shared`}
          />
          <StatCard
            label="Community Engagement"
            value={`${formatPercent(summary.engagementRate)}`}
            icon="bolt"
            tone="tertiary"
            trend={{
              value: summary.deltas.engagement,
              caption: `vs bench (${summary.benchmark}%)`,
            }}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="surface-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
            Telemetry Trendline
          </p>
          <h2 className="mt-1 font-headline text-xl font-bold text-on-surface">
            Post Views vs. Likes Over Time
          </h2>

          <div className="mt-4">
            {timeseriesQuery.isLoading ? (
              <Spinner label="Loading telemetry" />
            ) : timeseriesQuery.data ? (
              <TrendChart
                series={timeseriesQuery.data.series}
                peak={timeseriesQuery.data.peak}
              />
            ) : null}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              Access Scope Telemetry
            </p>
            <Icon name="pie_chart" className="text-[18px] text-on-surface-variant" />
          </div>
          <h2 className="mt-1 font-headline text-xl font-bold text-on-surface">
            Engagement by Role
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            Average interaction volume per authorized member role category.
          </p>

          <div className="mt-4">
            {roleQuery.data ? <RoleEngagementChart roles={roleQuery.data.roles} /> : null}
          </div>

          <div className="mx-5 mb-5 flex items-center gap-2 rounded-xl bg-surface-container px-4 py-3">
            <Icon name="policy" className="text-[18px] text-primary" />
            <span className="text-xs font-bold text-on-surface">RBAC Policy Guard</span>
            <span className="ml-auto rounded-full bg-primary-container/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
              Enforced
            </span>
          </div>
        </section>
      </div>

      <section className="surface-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              Scope:
            </span>
            {TOPICS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setTopic(option);
                  setTopPage(1);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  topic === option
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-container px-3 py-2 text-xs font-bold text-on-surface-variant">
              <Icon name="tune" className="text-[16px]" />
              Role: All Roles
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-container px-3 py-2 text-xs font-bold text-on-surface-variant">
              <Icon name="sort" className="text-[16px]" />
              Rank: Top Views
            </span>
          </div>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-outline-variant p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-headline text-xl font-bold text-on-surface">
              Top Performing Publications
            </h2>
            <p className="text-xs text-on-surface-variant">
              High-velocity articles rank-ordered by composite engagement index.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surface-container px-3 py-1.5 text-[11px] font-bold text-on-surface-variant">
              {summary
                ? `Displaying ${topPostsQuery.data?.items.length ?? 0} of ${formatNumber(summary.totalPosts)} publications`
                : 'Loading publications'}
            </span>
          </div>
        </div>

        {topPostsQuery.isLoading ? (
          <Spinner label="Ranking publications" />
        ) : (
          <TopPostsTable
            data={topPostsQuery.data}
            page={topPage}
            onPageChange={setTopPage}
          />
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(
          [
            {
              icon: 'network_check',
              title: 'Event Ingestion Sync',
              body: 'Latency: 4.2ms avg across 12 clusters',
              tone: 'bg-primary-container/30 text-primary',
            },
            {
              icon: 'thumb_up_off_alt',
              title: 'Reaction Velocity',
              body: `${formatSignedPercent(summary?.deltas.likes ?? 0)} likes across the feed`,
              tone: 'bg-tertiary-container/30 text-tertiary',
            },
            {
              icon: 'security',
              title: 'Safety & RBAC Integrity',
              body: '0 permission anomalies detected',
              tone: 'bg-secondary-container/50 text-secondary',
            },
          ] as { icon: IconName; title: string; body: string; tone: string }[]
        ).map((card) => (
          <div key={card.title} className="surface-card flex items-start gap-3 p-4">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
            >
              <Icon name={card.icon} className="text-[20px]" />
            </span>
            <div>
              <p className="text-sm font-bold text-on-surface">{card.title}</p>
              <p className="text-xs text-on-surface-variant">{card.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
