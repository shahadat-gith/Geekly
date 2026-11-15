import { Outlet, useLocation } from 'react-router-dom';
import { Background } from './Background.jsx';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';


export function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="relative isolate min-h-svh">
      <Background />
      <div className="relative z-10 flex min-h-svh flex-col">
        <Navbar />
        <main key={pathname} className="animate-page flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
