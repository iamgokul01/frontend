import { useQuery } from '@tanstack/react-query';
import { auditApi, rbacApi } from '@/api/audit.api';
import { extractErrorMessage } from '@/api/client';
import { EmptyState, Spinner } from '@/components/ui/empty-state';
import { RoleBadge } from '@/components/ui/avatar';
import { PERMISSION_LABELS, ROLE_LABELS } from '@/lib/permissions';
import { formatRelativeTime } from '@/lib/formatters';
import type { Permission } from '@/lib/api-types';

const PERMISSION_GROUPS: { entity: string; actions: string[] }[] = [
  {
    entity: 'users',
    actions: ['read', 'create', 'update', 'delete', 'activate', 'assignRole'],
  },
  {
    entity: 'posts',
    actions: ['read', 'create', 'update', 'delete', 'publish', 'moderate'],
  },
  { entity: 'comments', actions: ['create', 'moderate'] },
  { entity: 'likes', actions: ['create'] },
  { entity: 'analytics', actions: ['read', 'export'] },
];

const MATRIX_COLUMNS = PERMISSION_GROUPS.flatMap((group) =>
  group.actions.map((action) => ({
    entity: group.entity,
    action,
    key: `${group.entity}:${action}` as Permission,
  })),
);
import { Icon } from '@/components/ui/icon';

export function SafetyRolesPage() {
  const matrixQuery = useQuery({
    queryKey: ['rbac', 'matrix'],
    queryFn: rbacApi.matrix,
  });

  const auditQuery = useQuery({
    queryKey: ['audit'],
    queryFn: () => auditApi.list({ limit: 20 }),
  });

  const roles = matrixQuery.data?.roles ?? [];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
          Governance &amp; Access Control
        </p>
        <h1 className="mt-1 font-headline text-3xl font-bold tracking-tight text-on-surface">
          Safety &amp; Roles
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Review role hierarchies, capability inheritance and the security audit ledger.
        </p>
      </header>

      <section className="surface-card overflow-hidden">
        <div className="border-b border-outline-variant p-5">
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Role to Permission Matrix
          </h2>
          <p className="text-xs text-on-surface-variant">
            The backend is authoritative. This matrix mirrors it for visibility.
          </p>
        </div>

        {matrixQuery.isLoading ? (
          <Spinner label="Loading role matrix" />
        ) : matrixQuery.isError ? (
          <EmptyState
            icon="cloud_off"
            title="Could not load the role matrix"
            description={extractErrorMessage(matrixQuery.error)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th
                    rowSpan={2}
                    className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant"
                  >
                    Role
                  </th>
                  <th
                    rowSpan={2}
                    className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant"
                  >
                    Tier
                  </th>
                  {PERMISSION_GROUPS.map((group) => (
                    <th
                      key={group.entity}
                      colSpan={group.actions.length}
                      className="border-l border-outline-variant px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface"
                    >
                      {group.entity}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  {MATRIX_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      title={PERMISSION_LABELS[column.key]}
                      className="border-l border-outline-variant px-2 py-2 text-center text-[10px] font-semibold text-on-surface-variant"
                    >
                      {column.action}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {roles.map((role) => (
                  <tr
                    key={role.role}
                    className="border-b border-outline-variant/60 transition-colors last:border-0 hover:bg-surface-container/50"
                  >
                    <td className="px-5 py-3.5">
                      <RoleBadge role={role.role} label={ROLE_LABELS[role.role]} />
                      <p className="mt-1 max-w-xs text-xs text-on-surface-variant">
                        {role.description}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-on-surface-variant">{role.tier}</td>
                    {MATRIX_COLUMNS.map((column) => (
                      <td key={column.key} className="px-2 py-3.5 text-center">
                        {role.permissions.includes(column.key) ? (
                          <span
                            title={`${role.label} can ${column.entity} ${column.action}`}
                            className="inline-block"
                          >
                            <Icon name="check_circle" className="text-[16px] text-primary" />
                          </span>
                        ) : (
                          <span
                            title={`${role.label} cannot ${column.entity} ${column.action}`}
                            className="inline-block"
                          >
                            <Icon name="remove" className="text-[16px] text-outline opacity-40" />
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="surface-card overflow-hidden">
        <div className="border-b border-outline-variant p-5">
          <h2 className="font-headline text-xl font-bold text-on-surface">Security Audit Ledger</h2>
          <p className="text-xs text-on-surface-variant">
            Role changes, activations and revocations are recorded here.
          </p>
        </div>

        {auditQuery.isLoading ? (
          <Spinner label="Loading audit entries" />
        ) : auditQuery.isError ? (
          <EmptyState
            icon="cloud_off"
            title="Could not load the audit ledger"
            description={extractErrorMessage(auditQuery.error)}
          />
        ) : auditQuery.data?.items.length ? (
          <ul className="divide-y divide-outline-variant/60">
            {auditQuery.data.items.map((entry) => (
              <li key={entry.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
                  <Icon name="policy" className="text-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-on-surface">
                    {entry.action.replace(/_/g, ' ').toLowerCase()}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {entry.actor?.fullName ?? 'System'}
                    {entry.targetType ? ` · ${entry.targetType} #${entry.targetId}` : ''}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-on-surface-variant">
                  {formatRelativeTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="shield_person"
            title="No audit entries yet"
            description="Every privileged action is written here as it happens."
          />
        )}
      </section>
    </div>
  );
}
