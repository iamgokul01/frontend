import { apiClient, type ApiEnvelope } from './client';
import type { AuditEntry, Paginated, RoleMatrixEntry } from '@/lib/api-types';

export const auditApi = {
  list: async (params: { page?: number; limit?: number; action?: string }) => {
    const { data } = await apiClient.get<ApiEnvelope<Paginated<AuditEntry>>>('/audit', {
      params,
    });
    return data.data;
  },
};

export const rbacApi = {
  matrix: async (): Promise<{ roles: RoleMatrixEntry[] }> => {
    const { data } = await apiClient.get<
      ApiEnvelope<{ roles: RoleMatrixEntry[]; permissions: string[] }>
    >('/roles/matrix');
    return data.data;
  },
};
