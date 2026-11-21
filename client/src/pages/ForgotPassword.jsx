
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useForgotPassword } from '../api/hooks.js';
import { AuthLayout, AuthLink } from '../components/layout/AuthLayout.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [devToken, setDevToken] = useState('');

  const forgotPassword = useForgotPassword();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      // The backend responds identically whether or not the email exists.
      // In development, it also returns a token for testing the reset flow.
      const data = await forgotPassword.mutateAsync({ email });

      setDone(true);
      if (data.token) setDevToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="No worries. Enter the email associated with your account and we'll help you get back in."
      footer={
        <>
          Remembered your password?{' '}
          <AuthLink to="/auth/login">Sign in</AuthLink>
        </>
      }
    >
      {error && <Alert>{error}</Alert>}

      {done ? (
        <div className="flex flex-col gap-3">
          <Alert tone="success">
            If an account exists for that email, a password reset link is on its way.
            The link expires in 1 hour.
          </Alert>

          {devToken && (
            <Alert tone="info">
              <div className="flex flex-col gap-2">
                <p className="m-0 text-[12px] leading-relaxed">
                  Development only — reset email has not been sent yet.
                </p>

                <Link
                  to={`/auth/reset-password?token=${encodeURIComponent(devToken)}`}
                  className="w-fit text-[12px] font-semibold text-brand-strong underline underline-offset-4 transition-colors hover:text-brand-strong-hover"
                >
                  Open the reset page
                </Link>
              </div>
            </Alert>
          )}

          <Button
            type="button"
            variant="secondary"
            className="mt-1 w-full"
            onClick={() => {
              setDone(false);
              setDevToken('');
              setError('');
            }}
          >
            Try another email
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <Button
            type="submit"
            loading={forgotPassword.isPending}
            className="mt-1 w-full"
            size="lg"
          >
            {forgotPassword.isPending ? 'Sending reset link…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
