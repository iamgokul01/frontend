import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostCard } from './post-card';
import { postsApi } from '@/api/posts.api';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/context/toast-context';
import { ThemeProvider } from '@/theme/theme-provider';
import type { Post } from '@/lib/api-types';

vi.mock('@/api/posts.api', () => ({
  postsApi: {
    comments: vi.fn(),
    addComment: vi.fn(),
    toggleLike: vi.fn(),
    recordView: vi.fn(),
    list: vi.fn(),
    trendingTopics: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/api/auth.api', () => ({
  authApi: {
    me: vi.fn().mockResolvedValue({
      id: 1,
      fullName: 'Platform Administrator',
      email: 'admin@vibesocial.com',
      handle: 'admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      jobTitle: 'Lead Administrator',
      division: 'Platform Operations',
      avatarUrl: null,
      lastActiveAt: null,
    }),
    refresh: vi.fn().mockRejectedValue(new Error('no session')),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

const commentsMock = vi.mocked(postsApi.comments);
const addCommentMock = vi.mocked(postsApi.addComment);

const post: Post = {
  id: 7,
  title: 'Terracotta Piping Patterns in Clay',
  body: 'A study of glazed pottery.',
  category: 'Design Systems',
  tags: ['Backend'],
  visibility: 'PUBLIC',
  imageUrl: null,
  likeCount: 4,
  commentCount: 1,
  viewCount: 40,
  likedByViewer: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  author: {
    id: 2,
    fullName: 'Rithick G',
    handle: 'rithickg',
    role: 'EDITOR',
    avatarUrl: null,
    jobTitle: 'Developer',
  },
};

const renderCard = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <PostCard post={post} />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );

describe('PostCard comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    commentsMock.mockResolvedValue([
      {
        id: 1,
        body: 'Existing thread entry',
        createdAt: new Date().toISOString(),
        author: {
          id: 1,
          fullName: 'Platform Administrator',
          handle: 'admin',
          role: 'SUPER_ADMIN',
          avatarUrl: null,
        },
      },
    ]);

    addCommentMock.mockResolvedValue({
      id: 2,
      body: 'A brand new reply',
      createdAt: new Date().toISOString(),
      author: {
        id: 1,
        fullName: 'Platform Administrator',
        handle: 'admin',
        role: 'SUPER_ADMIN',
        avatarUrl: null,
      },
    });
  });

  it('keeps the comment thread collapsed until asked', () => {
    renderCard();

    expect(screen.getByRole('button', { name: /comments/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByLabelText('Comment body')).not.toBeInTheDocument();
    expect(commentsMock).not.toHaveBeenCalled();
  });

  it('opens the thread and loads its comments', async () => {
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: /comments/i }));

    expect(
      await screen.findByText('Existing thread entry'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Comment body')).toBeInTheDocument();
  });

  it('posts a new comment and clears the input', async () => {
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: /comments/i }));

    const input = await screen.findByLabelText('Comment body');
    await userEvent.type(input, 'A brand new reply');
    await userEvent.click(screen.getByRole('button', { name: 'Post' }));

    await waitFor(() => {
      expect(addCommentMock).toHaveBeenCalledWith(7, 'A brand new reply');
    });

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('exposes the like and bookmark controls as buttons', () => {
    renderCard();

    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bookmark' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
  });
});
