
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaGithub, FaGoogle } from 'react-icons/fa6';

import { useAuth } from '../context/authContext.js';
import { AuthLayout, AuthLink } from '../components/layout/AuthLayout.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Divider } from '../components/ui/Divider.jsx';
import { Input } from '../components/ui/Input.jsx';
import { githubOAuthUrl, googleOAuthUrl } from '../api/auth.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      await login({ email, password });
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue learning and growing with Geekly."
      footer={
        <>
          New to Geekly?{' '}
          <AuthLink to="/auth/register">Create an account</AuthLink>
        </>
      }
    >
      {/* Social login */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          as="a"
          href={googleOAuthUrl}
          variant="secondary"
          className="w-full gap-2.5"
        >
          <FaGoogle aria-hidden="true" className="text-[16px]" />
          Google
        </Button>

        <Button
          as="a"
          href={githubOAuthUrl}
          variant="secondary"
          className="w-full gap-2.5"
        >
          <FaGithub aria-hidden="true" className="text-[17px]" />
          GitHub
        </Button>
      </div>

      <Divider label="or continue with email" className="my-1" />

      {error && <Alert>{error}</Alert>}

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <div className="flex flex-col gap-2">
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="
                text-[12.5px] font-medium text-[#527C42]
                transition-colors hover:text-[#365D2B]
                focus-visible:rounded-sm focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-brand-active
              "
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={busy}
          className="mt-1 w-full"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
