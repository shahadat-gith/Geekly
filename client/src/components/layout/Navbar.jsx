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
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6">
        <Link
          to="/"
          aria-label="Geekly home"
          className="inline-flex shrink-0 items-center rounded-button focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
        >
          <img
            src="/brand_light.png"
            alt="Geekly"
            className="h-8 w-auto max-w-[160px] object-contain sm:h-9"
          />
        </Link>

        <div className="flex items-center gap-2">
          {loading ? (
            <div
              role="status"
              aria-label="Restoring your session"
              className="h-9 w-9 animate-pulse rounded-full bg-surface-secondary"
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
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
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
      <IconButton
        label="Profile"
        variant="bare"
        shape="round"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={user.avatar?.url} name={user.fullname} />
      </IconButton>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-card border border-border bg-surface shadow-dropdown"
        >
          <div className="border-b border-border-secondary px-4 py-3.5">
            <p className="m-0 truncate text-[13.5px] font-semibold">{user.fullname}</p>
            <p className="m-0 mt-0.5 truncate text-[12.5px] text-text-secondary">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center px-4 py-2.5 text-left text-[13.5px] font-medium text-text transition hover:bg-surface-secondary"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
