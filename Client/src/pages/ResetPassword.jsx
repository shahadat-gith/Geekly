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
      title="Set a new password"
      description="Choose a new password for your account."
      footer={<AuthLink to="/auth/login">Sign in</AuthLink>}
    >
      {!token ? (
        <Alert>The reset link is missing its token. Request a new one from the forgot-password page.</Alert>
      ) : done ? (
        <Alert tone="success">
          Password updated.{' '}
          <Link to="/auth/login" className="font-semibold underline">
            Sign in with your new password
          </Link>
        </Alert>
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
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat the new password"
            />
            <Button type="submit" disabled={resetPassword.isPending} className="w-full">
              {resetPassword.isPending ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
