import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { extractErrorMessage } from '@/api/client';
import { usersApi } from '@/api/users.api';
import { useToast } from '@/context/toast-context';
import {
  PERMISSION_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_ORDER,
  ROLE_PERMISSIONS,
  ROLE_TIERS,
} from '@/lib/permissions';
import type { Member, Permission, Role } from '@/lib/api-types';
import { Icon } from '@/components/ui/icon';

const CAPABILITY_ORDER: Permission[] = [
  'posts:publish',
  'posts:update',
  'analytics:read',
  'users:assignRole',
];

interface EditRoleModalProps {
  member: Member | null;
  onClose: () => void;
}

export function EditRoleModal({ member, onClose }: EditRoleModalProps) {
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Role>('MEMBER');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setSelected(member.role);
      setError('');
    }
  }, [member]);

  if (!member) return null;

  const capabilities = ROLE_PERMISSIONS[selected] ?? [];

  const handleSave = async () => {
    setError('');
    setSubmitting(true);

    try {
      await usersApi.updateRole(member.id, selected);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      notify(`${member.fullName} is now a ${ROLE_LABELS[selected]}`);
      onClose();
    } catch (caught) {
      setError(extractErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    setError('');
    setSubmitting(true);

    try {
      await usersApi.revokeAccess(member.id);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      notify(`All access was revoked for ${member.fullName}`);
      onClose();
    } catch (caught) {
      setError(extractErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(member)}
      onClose={onClose}
      title={member.fullName}
      subtitle={member.email}
      icon="badge"
      width="max-w-xl"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={handleRevoke}
            disabled={submitting}
            className="mr-auto text-error"
          >
            <Icon name="person_remove" className="text-[18px]" />
            Revoke All Access
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? (
              <Icon name="progress_activity" className="animate-spin text-[18px]" />
            ) : (
              <Icon name="check" className="text-[18px]" />
            )}
            Save Changes
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
            Select Access Level
          </p>
          <p className="text-[11px] text-on-surface-variant">
            Last changed {new Date(member.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {ROLE_ORDER.map((role) => {
            const isSelected = role === selected;

            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelected(role)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-primary/50 bg-primary-container/25'
                    : 'border-outline-variant bg-surface-container hover:bg-surface-container-high'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected ? 'border-primary' : 'border-outline-variant'
                  }`}
                >
                  {isSelected ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  ) : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-headline text-base font-bold text-on-surface">
                      {ROLE_LABELS[role]}
                    </span>
                    {role === member.role ? (
                      <span className="role-badge border-primary/40 bg-primary-container/40 text-primary">
                        Current Tier
                      </span>
                    ) : null}
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                      {ROLE_TIERS[role]}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-on-surface-variant">
                    {ROLE_DESCRIPTIONS[role]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-surface-container p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              Granular Capabilities Included
            </p>
            <p className="text-[11px] text-on-surface-variant">
              Inherited from {ROLE_LABELS[selected]}
            </p>
          </div>

          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CAPABILITY_ORDER.map((permission) => {
              const granted = capabilities.includes(permission);

              return (
                <li
                  key={permission}
                  className={`flex items-center gap-2 text-sm ${
                    granted ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}
                >
                  <Icon
                    name={granted ? 'check' : 'close'}
                    className={`text-[16px] ${
                      granted ? 'text-primary' : 'text-error'
                    }`}
                  />
                  {PERMISSION_LABELS[permission]}
                </li>
              );
            })}
          </ul>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-error/40 bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container"
          >
            {error}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
