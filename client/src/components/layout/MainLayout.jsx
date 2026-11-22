import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

export function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="relative isolate min-h-svh overflow-x-clip bg-bg text-text">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Application shell */}
      <div className="relative z-10 flex min-h-svh flex-col">
        <Navbar />

        {/* Route content */}
        <main
          key={pathname}
          id="main-content"
          className="relative min-w-0 flex-1 animate-page"
        >
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
