import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { Spinner } from '@/components/ui/empty-state';
import { LoginPage } from '@/features/auth/login-page';
import { UserManagementPage } from '@/features/users/user-management-page';
import { SafetyRolesPage } from '@/features/safety/safety-roles-page';
import { useAuth } from '@/context/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import type { Permission } from '@/lib/api-types';

const AnalyticsPage = lazy(() =>
  import('@/features/analytics/analytics-page').then((module) => ({
    default: module.AnalyticsPage,
  })),
);

const PostsFeedPage = lazy(() =>
  import('@/features/posts/posts-feed-page').then((module) => ({
    default: module.PostsFeedPage,
  })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner label="Loading" />
    </div>
  );
}

function RequireSession() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner label="Restoring your session" />
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace />;
  }

  return <AppShell />;
}

function RequirePermission({ permission, children }: { permission: Permission; children: React.ReactNode }) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <Navigate to="/analytics" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireSession />}>
        <Route index element={<Navigate to="/analytics" replace />} />
        <Route
          path="/analytics"
          element={
            <RequirePermission permission="analytics:read">
              <Suspense fallback={<RouteFallback />}>
                <AnalyticsPage />
              </Suspense>
            </RequirePermission>
          }
        />
        <Route
          path="/posts"
          element={
            <Suspense fallback={<RouteFallback />}>
              <PostsFeedPage />
            </Suspense>
          }
        />
        <Route
          path="/users"
          element={
            <RequirePermission permission="users:read">
              <UserManagementPage />
            </RequirePermission>
          }
        />
        <Route
          path="/safety"
          element={
            <RequirePermission permission="users:read">
              <SafetyRolesPage />
            </RequirePermission>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
