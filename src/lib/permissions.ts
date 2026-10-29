import type { Permission, Role } from '@/lib/api-types';

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  EDITOR: 'Editor',
  MEMBER: 'Member',
};

export const ROLE_TIERS: Record<Role, string> = {
  SUPER_ADMIN: 'Full Privilege',
  ADMIN: 'Full Privilege',
  MODERATOR: 'Standard Publishing',
  EDITOR: 'Standard Publishing',
  MEMBER: 'Read Only',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN:
    'Unrestricted control over platform settings, team billing, RBAC assignments, global content moderation, and audit security exports.',
  ADMIN:
    'Unrestricted control over platform settings, team billing, RBAC assignments, global content moderation, and audit security exports.',
  MODERATOR:
    'Review and moderate community submissions, resolve reported content, and keep member conversations constructive across the platform.',
  EDITOR:
    'Create and publish official posts, manage editorial queue drafts, approve community stories, and inspect feed engagement analytics.',
  MEMBER:
    'Browse internal feeds, participate in comments and discussions, like community entries, and view public member profiles.',
};

export const ROLE_ORDER: Role[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'MODERATOR',
  'EDITOR',
  'MEMBER',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'users:activate',
    'users:assignRole',
    'posts:read',
    'posts:create',
    'posts:update',
    'posts:delete',
    'posts:publish',
    'posts:moderate',
    'comments:create',
    'comments:moderate',
    'likes:create',
    'analytics:read',
    'analytics:export',
  ],
  ADMIN: [
    'users:read',
    'users:create',
    'users:update',
    'users:activate',
    'users:assignRole',
    'posts:read',
    'posts:create',
    'posts:update',
    'posts:delete',
    'posts:publish',
    'posts:moderate',
    'comments:create',
    'comments:moderate',
    'likes:create',
    'analytics:read',
    'analytics:export',
  ],
  MODERATOR: [
    'users:read',
    'posts:read',
    'posts:create',
    'posts:update',
    'posts:delete',
    'posts:publish',
    'posts:moderate',
    'comments:create',
    'comments:moderate',
    'likes:create',
    'analytics:read',
  ],
  EDITOR: [
    'posts:read',
    'posts:create',
    'posts:update',
    'posts:delete',
    'posts:publish',
    'comments:create',
    'likes:create',
    'analytics:read',
  ],
  MEMBER: ['posts:read', 'comments:create', 'likes:create'],
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  'users:read': 'View member directory',
  'users:create': 'Invite new members',
  'users:update': 'Edit member profiles',
  'users:delete': 'Delete member records',
  'users:activate': 'Activate or deactivate members',
  'users:assignRole': 'Modify user roles',
  'posts:read': 'Browse community feed',
  'posts:create': 'Draft new posts',
  'posts:update': 'Edit community stories',
  'posts:delete': 'Remove own posts',
  'posts:publish': 'Publish public articles',
  'posts:moderate': 'Moderate flagged content',
  'comments:create': 'Join discussions',
  'comments:moderate': 'Moderate comments',
  'likes:create': 'Like community entries',
  'analytics:read': 'Access analytics dashboard',
  'analytics:export': 'Export analytics reports',
};

export const hasPermission = (role: Role | undefined, permission: Permission): boolean =>
  role ? (ROLE_PERMISSIONS[role] ?? []).includes(permission) : false;

export const hasAnyPermission = (
  role: Role | undefined,
  permissions: Permission[],
): boolean => permissions.some((permission) => hasPermission(role, permission));

export const roleBadgeClass = (role: Role): string => {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return 'bg-role-admin-bg text-role-admin-text border-role-admin-border';
    case 'MODERATOR':
      return 'bg-role-moderator-bg text-role-moderator-text border-role-moderator-border';
    case 'EDITOR':
      return 'bg-role-editor-bg text-role-editor-text border-role-editor-border';
    default:
      return 'bg-role-member-bg text-role-member-text border-role-member-border';
  }
};
