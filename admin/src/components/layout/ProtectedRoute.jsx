import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/adminAuthContext.js';
import { FullScreenLoader } from '../ui/Spinner.jsx';

export function ProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!admin) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
}
