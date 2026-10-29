import { useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { hasAnyPermission, hasPermission } from '@/lib/permissions';
import type { Permission } from '@/lib/api-types';

export function usePermissions() {
  const { user } = useAuth();

  const can = useCallback(
    (permission: Permission) => hasPermission(user?.role, permission),
    [user?.role],
  );

  const canAny = useCallback(
    (permissions: Permission[]) => hasAnyPermission(user?.role, permissions),
    [user?.role],
  );

  return { can, canAny, role: user?.role };
}
