import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/api/auth.api';
import { setAccessToken, setUnauthorizedHandler } from '@/api/client';
import { hasPermission as checkPermission } from '@/lib/permissions';
import type { AuthUser, Permission } from '@/lib/api-types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const profile = await authApi.me();
        if (cancelled) return;
        setUser(profile);
        setStatus('authenticated');
        return;
      } catch {
        try {
          const result = await authApi.refresh();
          if (cancelled) return;
          setAccessToken(result.accessToken);
          setUser(result.user);
          setStatus('authenticated');
          return;
        } catch {
          if (cancelled) return;
          setAccessToken(null);
          setUser(null);
          setStatus('anonymous');
        }
      }
    };

    restore();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setUser(null);
      setStatus('anonymous');
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setAccessToken(result.accessToken);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const can = useCallback(
    (permission: Permission) => checkPermission(user?.role, permission),
    [user?.role],
  );

  const value = useMemo(
    () => ({ user, status, login, logout, can }),
    [user, status, login, logout, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
