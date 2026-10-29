import { apiClient, type ApiEnvelope } from './client';
import type { Comment, Paginated, Post, TopicCount } from '@/lib/api-types';

export interface ListPostsParams {
  sort?: 'trending' | 'latest' | 'announcements';
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreatePostPayload {
  title: string;
  body: string;
  category: string;
  tags?: string[];
  visibility?: 'PUBLIC' | 'MEMBERS_ONLY';
  imageUrl?: string;
}

export const postsApi = {
  list: async (params: ListPostsParams): Promise<Paginated<Post>> => {
    const { data } = await apiClient.get<ApiEnvelope<Paginated<Post>>>('/posts', {
      params,
    });
    return data.data;
  },

  findOne: async (id: number): Promise<Post> => {
    const { data } = await apiClient.get<ApiEnvelope<Post>>(`/posts/${id}`);
    return data.data;
  },

  create: async (payload: CreatePostPayload): Promise<Post> => {
    const { data } = await apiClient.post<ApiEnvelope<Post>>('/posts', payload);
    return data.data;
  },

  update: async (id: number, payload: Partial<CreatePostPayload>): Promise<Post> => {
    const { data } = await apiClient.patch<ApiEnvelope<Post>>(`/posts/${id}`, payload);
    return data.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  toggleLike: async (id: number): Promise<{ postId: number; liked: boolean; likeCount: number }> => {
    const { data } = await apiClient.post<
      ApiEnvelope<{ postId: number; liked: boolean; likeCount: number }>
    >(`/posts/${id}/like`);
    return data.data;
  },

  recordView: async (id: number): Promise<{ postId: number; views: number }> => {
    const { data } = await apiClient.post<ApiEnvelope<{ postId: number; views: number }>>(
      `/posts/${id}/view`,
    );
    return data.data;
  },

  trendingTopics: async (): Promise<TopicCount[]> => {
    const { data } = await apiClient.get<ApiEnvelope<TopicCount[]>>(
      '/posts/trending-topics',
    );
    return data.data;
  },

  comments: async (postId: number): Promise<Comment[]> => {
    const { data } = await apiClient.get<ApiEnvelope<Comment[]>>(
      `/posts/${postId}/comments`,
    );
    return data.data;
  },

  addComment: async (postId: number, body: string): Promise<Comment> => {
    const { data } = await apiClient.post<ApiEnvelope<Comment>>(
      `/posts/${postId}/comments`,
      { body },
    );
    return data.data;
  },
};
