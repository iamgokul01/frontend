import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { extractErrorMessage } from '@/api/client';
import { useDebounce } from '@/hooks/use-debounce';
import { usePagination } from '@/hooks/use-pagination';
import { usePermissions } from '@/hooks/use-permissions';
import { useToast } from '@/context/toast-context';
import { Button } from '@/components/ui/button';
import { Avatar, RoleBadge } from '@/components/ui/avatar';
import { EmptyState, Spinner } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { MemberStatsStrip } from './member-stats';
import { AddUserModal } from './add-user-modal';
import { EditRoleModal } from './edit-role-modal';
import { ROLE_LABELS, ROLE_ORDER } from '@/lib/permissions';
import { formatRelativeTime } from '@/lib/formatters';
import type { Member, Role, UserStatus } from '@/lib/api-types';
import { Icon } from '@/components/ui/icon';

export function UserManagementPage() {
  const { can } = usePermissions();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const debouncedSearch = useDebounce(search);
  const pagination = usePagination(10);

  const membersQuery = useQuery({
    queryKey: [
      'users',
      debouncedSearch,
      roleFilter,
      statusFilter,
      pagination.page,
      pagination.limit,
    ],
    queryFn: () =>
      usersApi.list({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page: pagination.page,
        limit: pagination.limit,
      }),
  });

  const statsQuery = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: usersApi.stats,
  });

  const rolesQuery = useQuery({
    queryKey: ['users', 'roles'],
    queryFn: usersApi.roles,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: UserStatus }) =>
      usersApi.updateStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      notify('Member status updated');
    },
    onError: (error) => notify(extractErrorMessage(error), 'error'),
  });

  const filtersActive = Boolean(search || roleFilter || statusFilter);

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    pagination.reset();
  };

  const roleCounts = useMemo(() => {
    const map = new Map<Role, number>();
    rolesQuery.data?.forEach((entry) => map.set(entry.role, entry.count));
    return map;
  }, [rolesQuery.data]);

  const members = membersQuery.data?.items ?? [];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
            Directory &amp; Access
          </p>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
            Community Members
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            View, invite, and organize your VibeSocial members and team permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-surface-container px-4 py-2 text-xs font-bold text-on-surface-variant">
            {statsQuery.data?.totalMembers ?? 0} total members
          </span>
          {can('users:create') ? (
            <Button onClick={() => setAddOpen(true)}>
              <Icon name="person_add" className="text-[18px]" />
              Add User
            </Button>
          ) : null}
        </div>
      </header>

      <MemberStatsStrip stats={statsQuery.data} />

      <section className="surface-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                pagination.reset();
              }}
              placeholder="Search by name or email..."
              aria-label="Search members"
              className="field pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as Role | '');
                pagination.reset();
              }}
              aria-label="Filter by role"
              className="field w-auto min-w-[150px]"
            >
              <option value="">All Roles</option>
              {ROLE_ORDER.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]} ({roleCounts.get(role) ?? 0})
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as UserStatus | '');
                pagination.reset();
              }}
              aria-label="Filter by status"
              className="field w-auto min-w-[140px]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <Button variant="ghost" onClick={resetFilters} disabled={!filtersActive}>
              <Icon name="restart_alt" className="text-[18px]" />
              Reset
            </Button>
          </div>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {['User', 'Email', 'Role', 'Status', 'Last Active', 'Actions'].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {membersQuery.isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <Spinner label="Loading members" />
                  </td>
                </tr>
              ) : null}

              {membersQuery.isError ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="cloud_off"
                      title="Could not load members"
                      description={extractErrorMessage(membersQuery.error)}
                    />
                  </td>
                </tr>
              ) : null}

              {!membersQuery.isLoading && !membersQuery.isError && members.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="group"
                      title={filtersActive ? 'No members match those filters' : 'No members yet'}
                      description={
                        filtersActive
                          ? 'Try a different search term, role or status.'
                          : 'Invite the first member to start building the community.'
                      }
                      action={
                        filtersActive ? (
                          <Button variant="secondary" onClick={resetFilters}>
                            Clear filters
                          </Button>
                        ) : can('users:create') ? (
                          <Button onClick={() => setAddOpen(true)}>
                            <Icon name="person_add" className="text-[18px]" />
                            Add the first member
                          </Button>
                        ) : null
                      }
                    />
                  </td>
                </tr>
              ) : null}

              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-outline-variant/60 transition-colors last:border-0 hover:bg-surface-container/50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.fullName} url={member.avatarUrl} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-on-surface">
                          {member.fullName}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">
                          {member.jobTitle ?? 'Community Member'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-sm text-on-surface-variant">
                    {member.email}
                  </td>

                  <td className="px-5 py-3.5">
                    <RoleBadge role={member.role} label={ROLE_LABELS[member.role]} />
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          member.status === 'ACTIVE'
                            ? 'bg-primary'
                            : member.status === 'PENDING'
                              ? 'bg-tertiary'
                              : 'bg-outline'
                        }`}
                      />
                      {member.status === 'PENDING' ? 'Pending' : member.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-sm text-on-surface-variant">
                    {formatRelativeTime(member.lastActiveAt)}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-4">
                      {can('users:assignRole') ? (
                        <button
                          type="button"
                          onClick={() => setEditing(member)}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Edit
                        </button>
                      ) : null}

                      {can('users:activate') ? (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: member.id,
                              status: member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                            })
                          }
                          className="text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                        >
                          {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          pageCount={membersQuery.data?.pageCount ?? 1}
          total={membersQuery.data?.total ?? 0}
          limit={pagination.limit}
          onPageChange={pagination.setPage}
        />
      </section>

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} />

      <EditRoleModal member={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
