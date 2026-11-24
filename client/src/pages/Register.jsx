import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGithub, FaGoogle } from 'react-icons/fa6';

import { useAuth } from '../context/authContext.js';
import { AuthLayout, AuthLink } from '../components/layout/AuthLayout.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Divider } from '../components/ui/Divider.jsx';
import { Input } from '../components/ui/Input.jsx';
import { githubOAuthUrl, googleOAuthUrl } from '../api/auth.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < 8;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);

    try {
      await register({ fullname, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="One account for topics, resume reviews and your published sites"
      footer={
        <>
          Already have an account?{' '}
          <AuthLink to="/auth/login">Sign in</AuthLink>
        </>
      }
    >
      {/* Social registration */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          as="a"
          href={googleOAuthUrl}
          variant="secondary"
          disabled={busy}
          className="w-full"
        >
          <FaGoogle aria-hidden="true" className="text-[15px]" />
          Google
        </Button>

        <Button
          as="a"
          href={githubOAuthUrl}
          variant="secondary"
          disabled={busy}
          className="w-full"
        >
          <FaGithub aria-hidden="true" className="text-[16px]" />
          GitHub
        </Button>
      </div>

      <Divider label="or use email" className="my-5" />

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && <Alert>{error}</Alert>}

        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          required
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          placeholder="Your full name"
          disabled={busy}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={busy}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          disabled={busy}
          error={passwordTooShort ? 'Use at least 8 characters.' : undefined}
          hint={passwordTooShort ? undefined : 'At least 8 characters.'}
        />

        <Button
          type="submit"
          loading={busy}
          className="mt-1 w-full"
          size="lg"
        >
          {busy ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="m-0 px-1 text-center text-[11.5px] leading-[1.7] text-text-tertiary">
          By creating an account, you agree to our{' '}
          <Link
            to="/terms"
            className="font-medium text-brand-strong underline underline-offset-2 transition-colors hover:text-brand-strong-hover"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="/privacy"
            className="font-medium text-brand-strong underline underline-offset-2 transition-colors hover:text-brand-strong-hover"
          >
            Privacy Policy
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
