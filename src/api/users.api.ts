import { apiClient, type ApiEnvelope } from './client';
import type {
  Member,
  MemberStats,
  Paginated,
  Role,
  RoleSummary,
  UserStatus,
} from '@/lib/api-types';

export interface ListUsersParams {
  search?: string;
  role?: Role;
  status?: UserStatus;
  page?: number;
  limit?: number;
}

export interface CreateMemberPayload {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  status?: UserStatus;
  jobTitle?: string;
  division?: string;
  sendInvitation?: boolean;
}

export const usersApi = {
  list: async (params: ListUsersParams): Promise<Paginated<Member>> => {
    const { data } = await apiClient.get<ApiEnvelope<Paginated<Member>>>('/users', {
      params,
    });
    return data.data;
  },

  stats: async (): Promise<MemberStats> => {
    const { data } = await apiClient.get<ApiEnvelope<MemberStats>>('/users/stats');
    return data.data;
  },

  roles: async (): Promise<RoleSummary[]> => {
    const { data } = await apiClient.get<ApiEnvelope<RoleSummary[]>>('/users/roles');
    return data.data;
  },

  create: async (payload: CreateMemberPayload): Promise<Member> => {
    const { data } = await apiClient.post<ApiEnvelope<Member>>('/users', payload);
    return data.data;
  },

  updateRole: async (id: number, role: Role): Promise<Member> => {
    const { data } = await apiClient.patch<ApiEnvelope<Member>>(
      `/users/${id}/role`,
      { role },
    );
    return data.data;
  },

  updateStatus: async (id: number, status: UserStatus): Promise<Member> => {
    const { data } = await apiClient.patch<ApiEnvelope<Member>>(
      `/users/${id}/status`,
      { status },
    );
    return data.data;
  },

  revokeAccess: async (id: number): Promise<Member> => {
    const { data } = await apiClient.delete<ApiEnvelope<Member>>(`/users/${id}/access`);
    return data.data;
  },
};
