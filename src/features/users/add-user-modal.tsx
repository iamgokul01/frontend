import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { extractErrorMessage } from '@/api/client';
import { usersApi } from '@/api/users.api';
import { useToast } from '@/context/toast-context';
import { useQueryClient } from '@tanstack/react-query';
import { ROLE_LABELS, ROLE_ORDER } from '@/lib/permissions';
import type { Role, UserStatus } from '@/lib/api-types';
import { Icon } from '@/components/ui/icon';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddUserModal({ open, onClose }: AddUserModalProps) {
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('EDITOR');
  const [status, setStatus] = useState<UserStatus>('PENDING');
  const [jobTitle, setJobTitle] = useState('');
  const [sendInvitation, setSendInvitation] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('EDITOR');
    setStatus('PENDING');
    setJobTitle('');
    setSendInvitation(true);
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await usersApi.create({
        fullName,
        email,
        password,
        role,
        status,
        jobTitle: jobTitle || undefined,
        sendInvitation: sendInvitation,
      });

      await queryClient.invalidateQueries({ queryKey: ['users'] });
      notify(`${fullName} was added to the community`);
      handleClose();
    } catch (caught) {
      setError(extractErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add New Member"
      subtitle="Invite a team member and assign their role."
      icon="person_add"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <Icon name="progress_activity" className="animate-spin text-[18px]" />
            ) : (
              <Icon name="add_task" className="text-[18px]" />
            )}
            {submitting ? 'Adding' : 'Add User'}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="member-name" className="text-xs font-semibold text-on-surface">
              Full Name
            </label>
            <span className="text-[11px] text-on-surface-variant">required</span>
          </div>
          <div className="relative flex items-center">
            <Icon name="badge" className="pointer-events-none absolute left-3.5 text-[18px] text-outline" />
            <input
              id="member-name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Alex Morgan"
              className="field pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="member-email" className="text-xs font-semibold text-on-surface">
              Email Address
            </label>
            <span className="text-[11px] text-on-surface-variant">corporate account</span>
          </div>
          <div className="relative flex items-center">
            <Icon name="mail" className="pointer-events-none absolute left-3.5 text-[18px] text-outline" />
            <input
              id="member-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="alex@vibesocial.com"
              className="field pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="member-password" className="text-xs font-semibold text-on-surface">
            Temporary Password
          </label>
          <div className="relative flex items-center">
            <Icon name="lock" className="pointer-events-none absolute left-3.5 text-[18px] text-outline" />
            <input
              id="member-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="field pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="member-role" className="text-xs font-semibold text-on-surface">
            Access Role &amp; Permissions
          </label>
          <select
            id="member-role"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="field"
          >
            {ROLE_ORDER.map((candidate) => (
              <option key={candidate} value={candidate}>
                {ROLE_LABELS[candidate]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="member-status" className="text-xs font-semibold text-on-surface">
            Status
          </label>
          <select
            id="member-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as UserStatus)}
            className="field"
          >
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Inactive (Pending)</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="member-title" className="text-xs font-semibold text-on-surface">
            Job Title
          </label>
          <input
            id="member-title"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            placeholder="Content Strategist"
            className="field"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-surface-container p-4">
          <input
            type="checkbox"
            checked={sendInvitation}
            onChange={(event) => setSendInvitation(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-outline-variant accent-primary"
          />
          <span>
            <span className="block text-sm font-bold text-on-surface">
              Send invitation email immediately
            </span>
            <span className="block text-xs text-on-surface-variant">
              Records the invite on the member and writes an audit entry. No mail is sent.
            </span>
          </span>
        </label>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-error/40 bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container"
          >
            {error}
          </div>
        ) : null}

        <p className="text-[11px] text-on-surface-variant">
          Role changes will be recorded in the security audit ledger.
        </p>
      </form>
    </Modal>
  );
}
