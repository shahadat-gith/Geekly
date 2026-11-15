import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NavTabs } from './NavTabs.jsx';
import { Topbar } from './Topbar.jsx';

export function AdminLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="h-svh overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col overflow-hidden rounded-shell bg-surface shadow-shell">
        <Topbar />
        <NavTabs />

        <main
          ref={mainRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-bg/60 px-5 py-7 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
        >
          <div className="mx-auto w-full max-w-[1360px]">
            <div key={pathname} className="animate-page">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
