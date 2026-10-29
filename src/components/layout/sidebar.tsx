import { NavLink } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';

import { Icon, type IconName } from '@/components/ui/icon';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  permission?: 'users:read' | 'analytics:read';
}

const NAV_ITEMS: NavItem[] = [
  { to: '/analytics', label: 'Dashboard / Analytics', icon: 'insights', permission: 'analytics:read' },
  { to: '/users', label: 'User Management', icon: 'group', permission: 'users:read' },
  { to: '/posts', label: 'Posts & Feed', icon: 'dynamic_feed' },
  { to: '/safety', label: 'Safety & Roles', icon: 'verified_user', permission: 'users:read' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { can } = usePermissions();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || can(item.permission),
  );

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-outline-variant bg-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/40 text-primary">
            <Icon name="spa" className="text-[22px]" />
          </span>
          <div className="min-w-0">
            <p className="font-headline text-[17px] font-bold leading-tight text-on-surface">
              VibeSocial
            </p>
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              Community &amp; Roles
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3">
          <p className="px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
            Navigation
          </p>

          <ul className="flex flex-col gap-1">
            {visibleItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`
                  }
                >
                  <Icon name={item.icon} className="text-[20px]" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

       

       
      </aside>
    </>
  );
}
