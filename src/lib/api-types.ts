export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'EDITOR' | 'MEMBER';

export type UserStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

export type Permission =
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:activate'
  | 'users:assignRole'
  | 'posts:read'
  | 'posts:create'
  | 'posts:update'
  | 'posts:delete'
  | 'posts:publish'
  | 'posts:moderate'
  | 'comments:create'
  | 'comments:moderate'
  | 'likes:create'
  | 'analytics:read'
  | 'analytics:export';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  handle: string;
  role: Role;
  status: UserStatus;
  jobTitle: string | null;
  division: string | null;
  avatarUrl: string | null;
  lastActiveAt: string | null;
}

export interface Member extends AuthUser {
  inviteSent: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface MemberStats {
  totalMembers: number;
  activeAdmins: number;
  contentEditors: number;
  pendingInvites: number;
  activeMembers: number;
  healthyPercent: number;
}

export interface RoleSummary {
  role: Role;
  label: string;
  count: number;
  permissions: Permission[];
}

export interface PostAuthor {
  id: number;
  fullName: string;
  handle: string;
  role: Role;
  avatarUrl: string | null;
  jobTitle: string | null;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  category: string;
  tags: string[];
  visibility: 'PUBLIC' | 'MEMBERS_ONLY';
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  likedByViewer: boolean;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor | null;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  author: {
    id: number;
    fullName: string;
    handle: string;
    role: Role;
    avatarUrl: string | null;
  };
}

export interface TopicCount {
  tag: string;
  postCount: number;
}

export interface AnalyticsSummary {
  range: string;
  window: { start: string; end: string; days: number };
  totalLikes: number;
  totalViews: number;
  totalPosts: number;
  totalComments: number;
  engagementRate: number;
  benchmark: number;
  tier: string;
  deltas: {
    likes: number;
    views: number;
    posts: number;
    engagement: number;
  };
}

export interface TimeseriesPoint {
  day: string;
  views: number;
  likes: number;
}

export interface Timeseries {
  range: string;
  series: TimeseriesPoint[];
  peak: { day: string; views: number; likes: number };
}

export interface RoleEngagement {
  role: Role;
  label: string;
  volume: number;
  percentage: number;
}

export interface RoleEngagementResponse {
  range: string;
  total: number;
  roles: RoleEngagement[];
  enforced: boolean;
}

export interface TopPost {
  id: number;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  engagement: number;
  createdAt: string;
  author: { fullName: string; role: Role; avatarUrl: string | null };
}

export interface AuditEntry {
  id: number;
  action: string;
  targetType: string | null;
  targetId: number | null;
  meta: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
  actor: { id: number; fullName: string; role: Role } | null;
}

export interface RoleMatrixEntry {
  role: Role;
  label: string;
  tier: string;
  description: string;
  permissions: Permission[];
}
