import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsPage } from './analytics-page';
import { analyticsApi } from '@/api/analytics.api';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/context/toast-context';
import { ThemeProvider } from '@/theme/theme-provider';

vi.mock('@/api/analytics.api', () => ({
  analyticsApi: {
    summary: vi.fn(),
    timeseries: vi.fn(),
    byRole: vi.fn(),
    topPosts: vi.fn(),
    topics: vi.fn(),
    exportUrl: vi.fn(() => '/api/analytics/export.csv?range=30d'),
  },
}));

vi.mock('@/api/auth.api', () => ({
  authApi: {
    me: vi.fn().mockRejectedValue(new Error('no session')),
    refresh: vi.fn().mockRejectedValue(new Error('no session')),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

const summaryMock = vi.mocked(analyticsApi.summary);
const timeseriesMock = vi.mocked(analyticsApi.timeseries);
const byRoleMock = vi.mocked(analyticsApi.byRole);
const topPostsMock = vi.mocked(analyticsApi.topPosts);

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter>
              <AnalyticsPage />
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    summaryMock.mockResolvedValue({
      range: '30d',
      window: {
        start: '2026-09-28T00:00:00.000Z',
        end: '2026-10-28T00:00:00.000Z',
        days: 30,
      },
      totalLikes: 248600,
      totalViews: 1840000,
      totalPosts: 4120,
      totalComments: 310,
      engagementRate: 13.5,
      benchmark: 8.2,
      tier: 'A+',
      deltas: { likes: 18.4, views: 12.1, posts: 9.2, engagement: 5.3 },
    });

    timeseriesMock.mockResolvedValue({
      range: '30d',
      series: [
        { day: '2026-10-01', views: 120, likes: 30 },
        { day: '2026-10-02', views: 180, likes: 44 },
      ],
      peak: { day: '2026-10-02', views: 180, likes: 44 },
    });

    byRoleMock.mockResolvedValue({
      range: '30d',
      total: 1000,
      enforced: true,
      roles: [
        { role: 'ADMIN', label: 'Admin', volume: 412, percentage: 41.2 },
        { role: 'EDITOR', label: 'Editor', volume: 328, percentage: 32.8 },
        { role: 'MODERATOR', label: 'Moderator', volume: 164, percentage: 16.4 },
        { role: 'MEMBER', label: 'Member', volume: 96, percentage: 9.6 },
      ],
    });

    topPostsMock.mockResolvedValue({
      items: [
        {
          id: 1,
          title: 'Zero-Trust Architecture in Microservices',
          summary: 'Decentralized mTLS validation.',
          category: 'Security & Safety',
          tags: [],
          imageUrl: null,
          likeCount: 68400,
          commentCount: 120,
          viewCount: 542890,
          engagement: 14.8,
          createdAt: '2026-05-14T00:00:00.000Z',
          author: { fullName: 'Elena Rostova', role: 'SUPER_ADMIN', avatarUrl: null },
        },
      ],
      total: 1,
      page: 1,
      limit: 5,
      pageCount: 1,
    });
  });

  it('renders the headline metrics', async () => {
    renderPage();

    expect(await screen.findByText('Post Analytics & Engagement')).toBeInTheDocument();
    expect(screen.getByText('Total Likes')).toBeInTheDocument();
    expect(screen.getByText('248.6K')).toBeInTheDocument();
    expect(screen.getByText('1.84M')).toBeInTheDocument();
    expect(screen.getByText('4,120')).toBeInTheDocument();
    expect(screen.getByText('13.5%')).toBeInTheDocument();
  });

  it('renders the engagement breakdown per role', async () => {
    renderPage();

    expect(await screen.findByText('Engagement by Role')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('41.2%')).toBeInTheDocument();
    });
    expect(screen.getByText('RBAC Policy Guard')).toBeInTheDocument();
    expect(screen.getByText('Enforced')).toBeInTheDocument();
  });

  it('renders the ranked publications table', async () => {
    renderPage();

    expect(
      await screen.findByText('Zero-Trust Architecture in Microservices'),
    ).toBeInTheDocument();
    expect(screen.getByText('Top Performing Publications')).toBeInTheDocument();
  });

  it('offers every range control', async () => {
    renderPage();

    await screen.findByText('Post Analytics & Engagement');

    ['Today', '7D', '30D', '90D'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });
});
