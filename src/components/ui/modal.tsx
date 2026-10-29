import { useEffect, type ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/icon';

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: IconName;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export function Modal({
  open,
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
  width = 'max-w-lg',
}: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: 'var(--app-backdrop)' }}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`surface-card relative z-10 w-full ${width} overflow-hidden`}
        style={{ boxShadow: 'var(--app-shadow-overlay)' }}
      >
        <div className="flex items-start gap-4 border-b border-outline-variant bg-surface-container-low px-6 py-5">
          {icon ? (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-container/40 text-primary">
              <Icon name={icon} className="text-[22px]" />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="font-headline text-lg font-bold text-on-surface">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-on-surface-variant">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
