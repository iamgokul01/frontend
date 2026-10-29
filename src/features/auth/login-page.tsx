import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { extractErrorMessage } from '@/api/client';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Icon } from '@/components/ui/icon';

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@vibesocial.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/analytics', { replace: true });
    }
  }, [status, navigate]);

  if (status === 'authenticated') {
    return <Navigate to="/analytics" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/analytics', { replace: true });
    } catch (caught) {
      setError(extractErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <main className="w-full max-w-md">
        <div className="surface-card relative overflow-hidden p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container/30 text-primary">
              <Icon name="spa" className="text-[30px] font-light" />
            </span>
            <span className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
              VibeSocial
            </span>
            <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              Enter your username and password to continue
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="auth-email" className="text-xs font-semibold text-on-surface">
                Username or Email
              </label>
              <div className="relative flex items-center">
                <Icon name="alternate_email" className="pointer-events-none absolute left-3.5 text-[18px] text-outline" />
                <input
                  id="auth-email"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="alex@vibesocial.com"
                  className="field pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="auth-password" className="text-xs font-semibold text-on-surface">
                  Password
                </label>
                <span className="text-xs font-semibold text-primary">Forgot password?</span>
              </div>
              <div className="relative flex items-center">
                <Icon name="lock" className="pointer-events-none absolute left-3.5 text-[18px] text-outline" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="field pl-10 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <Icon
                    name={showPassword ? 'visibility_off' : 'visibility'}
                    className="text-[18px]"
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant accent-primary"
                />
                Remember me
              </label>
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-error/40 bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container"
              >
                {error}
              </div>
            ) : null}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? (
                <Icon name="progress_activity" className="animate-spin text-[18px]" />
              ) : (
                <Icon name="login" className="text-[18px]" />
              )}
              {submitting ? 'Signing in' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <span className="font-bold text-primary">Join VibeSocial</span>
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-on-surface-variant">
          Password reset and self registration are outside the scope of this build.
        </p>
      </main>
    </div>
  );
}
