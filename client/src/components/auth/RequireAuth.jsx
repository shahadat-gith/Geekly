import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { getRefreshToken } from '../../utils/tokens.js';

/** Sends signed-out visitors to the login screen and back afterwards. */
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const restoring = Boolean(getRefreshToken()) && loading;

  if (restoring) {
    return (
      <div className="flex min-h-[50svh] items-center justify-center">
        <span
          role="status"
          aria-label="Restoring your session"
          className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand-strong"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
}
