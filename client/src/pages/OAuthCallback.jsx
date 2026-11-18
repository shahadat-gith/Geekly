
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { clearSession, setSession } from '../utils/tokens.js';
import { useAuth } from '../context/authContext.js';
import { AuthLayout, AuthLink } from '../components/layout/AuthLayout.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';

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
      .catch(() => {
        clearSession();
        setFailed('We could not finish signing you in. Please try again.');
      });
  }, [params, navigate, syncUser]);

  const error =
    params.get('error') ||
    failed ||
    (!params.get('token')
      ? 'The sign-in link is incomplete. Please try signing in again.'
      : '');

  if (!error) {
    return (
      <AuthLayout
        title="Signing you in"
        description="Just a moment while we securely connect your account."
      >
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-xl border border-border bg-surface-secondary px-4 py-4"
        >
          <span
            aria-hidden="true"
            className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-border border-t-[#527C42]"
          />

          <p className="m-0 text-[13px] font-medium text-text-secondary">
            Finishing sign-in…
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Unable to sign you in"
      description="Something went wrong while connecting your account."
      footer={
        <>
          Having trouble?{' '}
          <AuthLink to="/auth/login">Return to sign in</AuthLink>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert>{error}</Alert>

        <Button
          as="a"
          href="/auth/login"
          className="w-full"
        >
          Back to sign in
        </Button>
      </div>
    </AuthLayout>
  );
}
