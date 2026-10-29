import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostsFeedPage } from './posts-feed-page';
import { postsApi } from '@/api/posts.api';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/context/toast-context';
import { ThemeProvider } from '@/theme/theme-provider';

vi.mock('@/api/posts.api', () => ({
  postsApi: {
    list: vi.fn(),
    trendingTopics: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    toggleLike: vi.fn(),
    recordView: vi.fn(),
    comments: vi.fn(),
    addComment: vi.fn(),
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

const listMock = vi.mocked(postsApi.list);
const topicsMock = vi.mocked(postsApi.trendingTopics);

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter>
              <PostsFeedPage />
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );

describe('PostsFeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    listMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      pageCount: 1,
    });

    topicsMock.mockResolvedValue([]);
  });

  it('renders the feed header', async () => {
    renderPage();

    expect(await screen.findByText('Community Feed & Discussions')).toBeInTheDocument();
    expect(screen.getByText('Trending Topics')).toBeInTheDocument();
  });

  it('renders every sort tab', async () => {
    renderPage();

    await screen.findByText('Community Feed & Discussions');

    ['Trending', 'Latest', 'Announcements'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('shows the empty state when the feed has no posts', async () => {
    renderPage();

    expect(await screen.findByText('The feed is empty')).toBeInTheDocument();
  });

  it('renders a post card with its author and engagement', async () => {
    listMock.mockResolvedValue({
      items: [
        {
          id: 1,
          title: 'Terra Design System v2.0 Guidelines',
          body: 'Excited to unveil the updated design system.',
          category: 'Design Systems',
          tags: ['DesignSystem', 'Community'],
          visibility: 'PUBLIC',
          imageUrl: null,
          likeCount: 84,
          commentCount: 16,
          viewCount: 1200,
          likedByViewer: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: 2,
            fullName: 'Sarah Jenkins',
            handle: 'sjenkins',
            role: 'ADMIN',
            avatarUrl: null,
            jobTitle: 'Community Lead',
          },
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      pageCount: 1,
    });

    renderPage();

    expect(
      await screen.findByText('Terra Design System v2.0 Guidelines'),
    ).toBeInTheDocument();
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByText('@sjenkins')).toBeInTheDocument();
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText('16 comments')).toBeInTheDocument();
    expect(screen.getByText('#DesignSystem')).toBeInTheDocument();
  });
});
