
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useResetPassword } from '../api/hooks.js';
import { AuthLayout, AuthLink } from '../components/layout/AuthLayout.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const resetPassword = useResetPassword();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, password });
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthLayout
      title="Create a new password"
      description="Choose a strong password to secure your Geekly account."
      footer={
        <>
          Remembered your password?{' '}
          <AuthLink to="/auth/login">Sign in</AuthLink>
        </>
      }
    >
      {!token ? (
        <div className="flex flex-col gap-3">
          <Alert>
            This password reset link is missing its token. Request a new reset link to continue.
          </Alert>

          <Button as={Link} to="/auth/forgot-password" className="w-full">
            Request a new link
          </Button>
        </div>
      ) : done ? (
        <div className="flex flex-col gap-3">
          <Alert tone="success">
            Your password has been updated successfully. You can now sign in using your new password.
          </Alert>

          <Button as={Link} to="/auth/login" className="w-full">
            Sign in to Geekly
          </Button>
        </div>
      ) : (
        <>
          {error && <Alert>{error}</Alert>}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />

            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter your new password"
            />

            <Button
              type="submit"
              loading={resetPassword.isPending}
              className="mt-1 w-full"
              size="lg"
            >
              {resetPassword.isPending ? 'Updating password…' : 'Update password'}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
