import type { MemberStats } from '@/lib/api-types';
import { Icon, type IconName } from '@/components/ui/icon';

interface MemberStatsProps {
  stats?: MemberStats;
}

export function MemberStatsStrip({ stats }: MemberStatsProps) {
  const cards: { label: string; value: number; caption: string; icon: IconName; tone: string }[] = [
    {
      label: 'Total Members',
      value: stats?.totalMembers ?? 0,
      caption: 'Across all access levels',
      icon: 'group',
      tone: 'bg-primary-container/30 text-primary',
    },
    {
      label: 'Active Admins',
      value: stats?.activeAdmins ?? 0,
      caption: 'Elevated permissions',
      icon: 'shield_person',
      tone: 'bg-primary-container/30 text-primary',
    },
    {
      label: 'Content Editors',
      value: stats?.contentEditors ?? 0,
      caption: 'Publishing access',
      icon: 'edit_note',
      tone: 'bg-tertiary-container/30 text-tertiary',
    },
    {
      label: 'Pending Invites',
      value: stats?.pendingInvites ?? 0,
      caption: 'Awaiting activation',
      icon: 'outgoing_mail',
      tone: 'bg-secondary-container/50 text-secondary',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="surface-card flex items-center gap-4 p-5">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tone}`}
          >
            <Icon name={card.icon} className="text-[22px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              {card.label}
            </p>
            <p className="font-headline text-2xl font-bold leading-tight text-on-surface">
              {card.value}
            </p>
            <p className="truncate text-xs text-on-surface-variant">{card.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
