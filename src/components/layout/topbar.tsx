import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Avatar, RoleBadge } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { Icon } from "@/components/ui/icon";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-outline-variant bg-surface px-4 py-3 lg:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container lg:hidden"
      >
        <Icon name="menu" className="text-[20px]" />
      </button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-outline"
        />
        <input
          type="search"
          placeholder="Search community posts, topics, members..."
          className="field pl-10"
          aria-label="Global search"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name="notifications" className="text-[20px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-tertiary" />
        </button> */}

        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-surface-container"
          >
            <Avatar
              name={user?.fullName ?? "Member"}
              url={user?.avatarUrl}
              size="sm"
            />
            <span className="hidden text-left lg:block">
              <span className="block text-sm font-bold leading-tight text-on-surface">
                {user?.fullName}
              </span>
              <span className="block text-[11px] text-on-surface-variant">
                {user?.jobTitle ?? "Community Member"}
              </span>
            </span>
            <Icon
              name="expand_more"
              className="text-[18px] text-on-surface-variant"
            />
          </button>

          {menuOpen ? (
            <div className="surface-card absolute right-0 top-[calc(100%+0.5rem)] z-30 w-60 p-2">
              <div className="border-b border-outline-variant px-3 py-2.5">
                <p className="text-sm font-bold text-on-surface">
                  {user?.fullName}
                </p>
                <p className="text-xs text-on-surface-variant">{user?.email}</p>
                {user ? (
                  <div className="mt-2">
                    <RoleBadge role={user.role} />
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/posts");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <Icon name="dynamic_feed" className="text-[18px]" />
                Community feed
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-error transition-colors hover:bg-error/10"
              >
                <Icon name="logout" className="text-[18px]" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
