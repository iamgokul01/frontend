import { apiClient, type ApiEnvelope } from './client';
import type { AuthUser } from '@/lib/api-types';

export interface LoginResult {
  accessToken: string;
  expiresIn: string;
  user: AuthUser;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResult> => {
    const { data } = await apiClient.post<ApiEnvelope<LoginResult>>('/auth/login', {
      email,
      password,
    });
    return data.data;
  },

  refresh: async (): Promise<LoginResult> => {
    const { data } = await apiClient.post<ApiEnvelope<LoginResult>>('/auth/refresh');
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<ApiEnvelope<AuthUser>>('/auth/me');
    return data.data;
  },
};
