import { describe, expect, it } from 'vitest';
import {
  hasAnyPermission,
  hasPermission,
  PERMISSION_LABELS,
  ROLE_PERMISSIONS,
} from './permissions';
import type { Permission, Role } from './api-types';

describe('permissions', () => {
  it('grants everything to a super admin', () => {
    const permissions: Permission[] = [
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
    ];

    permissions.forEach((permission) => {
      expect(hasPermission('SUPER_ADMIN', permission)).toBe(true);
    });
  });

  it('keeps the member role read only for the directory', () => {
    expect(hasPermission('MEMBER', 'users:read')).toBe(false);
    expect(hasPermission('MEMBER', 'posts:read')).toBe(true);
    expect(hasPermission('MEMBER', 'likes:create')).toBe(true);
    expect(hasPermission('MEMBER', 'analytics:read')).toBe(false);
  });

  it('never lets an admin delete member records', () => {
    expect(hasPermission('ADMIN', 'users:delete')).toBe(false);
    expect(hasPermission('ADMIN', 'users:assignRole')).toBe(true);
  });

  it('stops moderators from exporting analytics', () => {
    expect(hasPermission('MODERATOR', 'analytics:read')).toBe(true);
    expect(hasPermission('MODERATOR', 'analytics:export')).toBe(false);
  });

  it('resolves any-of checks', () => {
    expect(hasAnyPermission('EDITOR', ['analytics:export', 'analytics:read'])).toBe(true);
    expect(hasAnyPermission('EDITOR', ['analytics:export', 'users:read'])).toBe(false);
    expect(hasAnyPermission(undefined, ['posts:read'])).toBe(false);
  });

  it('labels every permission', () => {
    const roles = Object.keys(ROLE_PERMISSIONS) as Role[];

    roles.forEach((role) => {
      ROLE_PERMISSIONS[role].forEach((permission) => {
        expect(PERMISSION_LABELS[permission]).toBeTruthy();
      });
    });
  });
});
