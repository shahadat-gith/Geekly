
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { Avatar } from '../ui/Avatar.jsx';
import { Button } from '../ui/Button.jsx';
import { IconButton } from '../ui/IconButton.jsx';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate('/auth/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Brand */}
        <Link
          to="/"
          aria-label="Geekly home"
          className="inline-flex shrink-0 items-center rounded-button transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
        >
          <img
            src="/logo.png"
            alt="Geekly"
            className="h-8 w-auto max-w-[160px] object-contain sm:h-9"
          />
        </Link>

        {/* Account actions */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div
              role="status"
              aria-label="Restoring your session"
              className="h-9 w-9 animate-pulse rounded-full bg-surface-tertiary"
            />
          ) : user ? (
            <ProfileMenu user={user} onLogout={onLogout} />
          ) : (
            <Button as={Link} to="/auth/login" size="sm">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Profile trigger */}
      <IconButton
        label="Open account menu"
        variant="bare"
        shape="round"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full ring-offset-2 transition hover:ring-2 hover:ring-brand/40"
      >
        <Avatar
          src={user.avatar?.url}
          name={user.fullname}
        />
      </IconButton>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-[calc(100%+12px)] z-50 w-64 overflow-hidden rounded-card border border-border bg-surface shadow-dropdown animate-page"
        >
          {/* Account information */}
          <div className="border-b border-border-secondary bg-surface-secondary/70 px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatar?.url}
                name={user.fullname}
              />

              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm font-semibold text-text">
                  {user.fullname}
                </p>

                <p className="m-0 mt-0.5 truncate text-xs text-text-secondary">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Account navigation */}
          <div className="p-1.5">
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-brand-soft hover:text-text focus-visible:bg-brand-soft focus-visible:outline-none"
            >
              My profile
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error transition-colors hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
