import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserManagementPage } from './user-management-page';
import { usersApi } from '@/api/users.api';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/context/toast-context';
import { ThemeProvider } from '@/theme/theme-provider';

vi.mock('@/api/users.api', () => ({
  usersApi: {
    list: vi.fn(),
    stats: vi.fn(),
    roles: vi.fn(),
    create: vi.fn(),
    updateRole: vi.fn(),
    updateStatus: vi.fn(),
    revokeAccess: vi.fn(),
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

const listMock = vi.mocked(usersApi.list);
const statsMock = vi.mocked(usersApi.stats);
const rolesMock = vi.mocked(usersApi.roles);

const renderPage = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter>
              <UserManagementPage />
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );

describe('UserManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    listMock.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
    });
    statsMock.mockResolvedValue({
      totalMembers: 0,
      activeAdmins: 0,
      contentEditors: 0,
      pendingInvites: 0,
      activeMembers: 0,
      healthyPercent: 0,
    });
    rolesMock.mockResolvedValue([]);
  });

  it('shows the empty state when there are no members', async () => {
    renderPage();

    expect(await screen.findByText('No members yet')).toBeInTheDocument();
  });

  it('shows a filtered empty state when a search has no matches', async () => {
    renderPage();

    await screen.findByText('No members yet');

    await userEvent.type(screen.getByLabelText('Search members'), 'Priya');

    await waitFor(() => {
      expect(listMock).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Priya' }),
      );
    });
  });

  it('clears the search when reset is pressed', async () => {
    renderPage();

    await screen.findByText('No members yet');

    const search = screen.getByLabelText('Search members');
    await userEvent.type(search, 'Priya');

    await waitFor(() => {
      expect(listMock).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Priya' }),
      );
    });

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    await waitFor(() => {
      expect(listMock).toHaveBeenCalledWith(
        expect.objectContaining({ search: undefined }),
      );
    });
  });

  it('renders member rows returned by the API', async () => {
    listMock.mockResolvedValue({
      items: [
        {
          id: 1,
          fullName: 'Priya Nair',
          email: 'pnair@vibesocial.com',
          handle: 'pnair',
          role: 'EDITOR',
          status: 'ACTIVE',
          jobTitle: 'Contributing Editor',
          division: null,
          avatarUrl: null,
          lastActiveAt: null,
          inviteSent: false,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      pageCount: 1,
    });

    renderPage();

    expect(await screen.findByText('Priya Nair')).toBeInTheDocument();
    expect(screen.getByText('pnair@vibesocial.com')).toBeInTheDocument();
  });
});
