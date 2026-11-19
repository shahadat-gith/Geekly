import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/adminAuthContext.js';
import { Button } from '../ui/Button.jsx';

function ProfileMenu() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const ref = useRef(null);

  function onLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        role="menuitem"
        onClick={onLogout}
        className="flex w-full items-center gap-2.5 rounded-button px-3 py-2.5 text-left text-[12.5px] font-medium text-error transition hover:bg-error/8"
      >
        <i aria-hidden="true" className="bx bx-log-out text-[17px]" />
        Sign out
      </button>


    </div>
  );
}

export function Topbar() {
  return (
    <header className="shrink-0 border-b border-border-secondary">
      <div className="mx-auto flex min-h-[68px] w-full max-w-[1360px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-12">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" aria-label="Geekly admin dashboard" className="inline-flex shrink-0 items-center rounded-button focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft">
            <img src="/logo.png" alt="Geekly" className="h-11 w-auto max-w-[180px] object-contain" />
          </Link>
          <span aria-hidden="true" className="hidden h-6 w-px bg-border sm:block" />
          <span className="hidden items-center gap-2 rounded-button border border-border-secondary bg-surface-secondary/70 px-3 py-2 text-[11.5px] font-semibold text-text-secondary md:inline-flex">
            <i aria-hidden="true" className="bx bx-shield-quarter text-[15px] text-brand" />
            Admin Panel
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">


          <Button as={Link} to="/editor" size="sm" className="px-3 sm:px-3.5">
            <i aria-hidden="true" className="bx bx-plus text-[17px]" />
            <span className="hidden xs:inline">New article</span>
            <span className="sr-only xs:hidden">New article</span>
          </Button>

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
