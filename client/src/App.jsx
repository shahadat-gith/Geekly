import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { useAuth } from './context/authContext.js';
import { getRefreshToken } from './utils/tokens.js';
import { MainLayout } from './components/layout/MainLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import OAuthCallback from './pages/OAuthCallback.jsx';
import Home from './pages/Home.jsx';
import LegalPage from './pages/LegalPage.jsx';
import Article from './pages/Article.jsx';

export default function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <ToastProvider>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}

// Every route change re-mounts the page with a soft entrance transition.
function AnimatedRoutes() {
  const { pathname, hash } = useLocation();

  // Honour in-page links such as /#topics once the new page has mounted.
  useEffect(() => {
    if (!hash) return undefined;
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return (
    <Routes>
      {/* Public site: header, pages and footer. */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<LegalPage page="terms" />} />
        <Route path="/privacy" element={<LegalPage page="privacy" />} />
        {/* Topics and articles share one nested content route:
            /system-design, /system-design/basics,
            /system-design/basics/caching */}
        <Route path="*" element={<Article />} />
      </Route>

      {/* Auth screens render their own layout, without the site header.
          Signed-in users are sent back to the app. */}
      <Route
        path="/auth/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/auth/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <GuestOnly>
            <ForgotPassword />
          </GuestOnly>
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          <GuestOnly>
            <ResetPassword />
          </GuestOnly>
        }
      />
      {/* The OAuth provider redirects here with tokens, so this route stays
          available even when a session already exists. */}
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Old auth URLs keep working. */}
      <Route path="/login" element={<RedirectTo to="/auth/login" />} />
      <Route path="/register" element={<RedirectTo to="/auth/register" />} />
      <Route path="/forgot-password" element={<RedirectTo to="/auth/forgot-password" />} />
      <Route path="/reset-password" element={<RedirectTo to="/auth/reset-password" />} />
    </Routes>
  );
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const restoring = Boolean(getRefreshToken()) && loading;

  if (restoring) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <span
          role="status"
          aria-label="Loading"
          className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand"
        />
      </div>
    );
  }

  if (user) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  return children;
}

function RedirectTo({ to }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}
