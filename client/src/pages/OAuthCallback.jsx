import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setSession } from '../utils/tokens.js';
import { useAuth } from '../context/authContext.js';
import { AuthLayout, AuthLink } from '../components/layout/AuthLayout.jsx';
import { Alert } from '../components/ui/Alert.jsx';

// Where the backend redirects after Google/GitHub consent:
//   /auth/callback?token=...&refreshToken=...   on success
//   /auth/callback?error=...                    on failure
export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { syncUser } = useAuth();
  const handled = useRef(false);
  const [failed, setFailed] = useState('');

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    if (!token) return;

    setSession({ token, refreshToken });
    syncUser()
      .then(() => navigate('/', { replace: true }))
      .catch(() => setFailed('We could not finish signing you in.'));
  }, [params, navigate, syncUser]);

  const error = params.get('error') || failed;

  if (!error) {
    return (
      <AuthLayout title="Signing you in">
        <p className="flex items-center gap-2.5 text-[14px] text-text-secondary">
          <span
            role="status"
            aria-label="Loading"
            className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-brand"
          />
          Finishing sign-in…
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Sign-in failed"
      description="We could not finish signing you in. Please try again."
      footer={<AuthLink to="/auth/login">Sign in</AuthLink>}
    >
      <Alert>{error}</Alert>
    </AuthLayout>
  );
}
