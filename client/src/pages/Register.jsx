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
      title="Create account"
      description="Set up an account with your email, Google or GitHub."
      footer={
        <>
          Already have an account? <AuthLink to="/auth/login">Sign in</AuthLink>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Button as="a" href={googleOAuthUrl} variant="secondary" className="w-full px-4">
          <FaGoogle aria-hidden="true" className="text-[17px]" /> Google
        </Button>
        <Button as="a" href={githubOAuthUrl} variant="secondary" className="w-full px-4">
          <FaGithub aria-hidden="true" className="text-[17px]" /> GitHub
        </Button>
      </div>
      <Divider label="or" className="my-1" />
      {error && <Alert>{error}</Alert>}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          required
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          placeholder="Your name"
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
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
        />
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Creating…' : 'Create account'}
        </Button>
        <p className="m-0 text-center text-[12px] leading-relaxed text-text-tertiary">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="text-text-secondary underline underline-offset-2">
            terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-text-secondary underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  );
}
