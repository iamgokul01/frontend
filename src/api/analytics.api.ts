import { apiClient, type ApiEnvelope } from './client';
import type {
  AnalyticsSummary,
  Paginated,
  RoleEngagementResponse,
  Timeseries,
  TopPost,
  TopicCount,
} from '@/lib/api-types';

export type AnalyticsRange = 'today' | '7d' | '30d' | '90d';

export const analyticsApi = {
  summary: async (range: AnalyticsRange): Promise<AnalyticsSummary> => {
    const { data } = await apiClient.get<ApiEnvelope<AnalyticsSummary>>(
      '/analytics/summary',
      { params: { range } },
    );
    return data.data;
  },

  timeseries: async (range: AnalyticsRange): Promise<Timeseries> => {
    const { data } = await apiClient.get<ApiEnvelope<Timeseries>>(
      '/analytics/timeseries',
      { params: { range } },
    );
    return data.data;
  },

  byRole: async (range: AnalyticsRange): Promise<RoleEngagementResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<RoleEngagementResponse>>(
      '/analytics/by-role',
      { params: { range } },
    );
    return data.data;
  },

  topPosts: async (params: {
    range: AnalyticsRange;
    category?: string;
    sort?: 'views' | 'likes' | 'engagement';
    page?: number;
    limit?: number;
  }): Promise<Paginated<TopPost>> => {
    const { data } = await apiClient.get<ApiEnvelope<Paginated<TopPost>>>(
      '/analytics/top-posts',
      { params },
    );
    return data.data;
  },

  topics: async (range: AnalyticsRange): Promise<TopicCount[]> => {
    const { data } = await apiClient.get<ApiEnvelope<TopicCount[]>>(
      '/analytics/topics',
      { params: { range } },
    );
    return data.data;
  },

  exportUrl: (range: AnalyticsRange): string =>
    `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/analytics/export.csv?range=${range}`,
};
