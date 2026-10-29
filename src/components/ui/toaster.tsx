import { useToast } from '@/context/toast-context';
import { Icon, type IconName } from './icon';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const toneClass =
          toast.tone === 'error'
            ? 'border-error/40 bg-error-container text-on-error-container'
            : toast.tone === 'info'
              ? 'border-outline-variant bg-surface text-on-surface'
              : 'border-primary/40 bg-primary-container/40 text-on-primary-container';

        const icon: IconName =
          toast.tone === 'error'
            ? 'circle_alert'
            : toast.tone === 'info'
              ? 'info'
              : 'check_circle';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${toneClass}`}
          >
            <Icon name={icon} className="text-[18px]" />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="opacity-70 transition-opacity hover:opacity-100"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
