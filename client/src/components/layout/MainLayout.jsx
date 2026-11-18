
import { Outlet, useLocation } from 'react-router-dom';
import { Background } from './Background.jsx';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

export function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="relative isolate min-h-svh overflow-x-clip bg-bg text-text">
      {/* Global ambient background */}
      <Background />

      {/* Application shell */}
      <div className="relative z-10 flex min-h-svh flex-col">
        <Navbar />

        {/* Route content */}
        <main
          key={pathname}
          className="relative min-w-0 flex-1 animate-page"
        >
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
