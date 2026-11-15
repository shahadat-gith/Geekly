import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/adminAuthContext.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Field.jsx';
import { IconButton } from '../components/ui/IconButton.jsx';
import { FullScreenLoader } from '../components/ui/Spinner.jsx';

export default function Login() {
  const { admin, loading, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = location.state?.from || '/';

  if (loading) return <FullScreenLoader label="Checking your session…" />;
  if (admin) return <Navigate to={from} replace />;

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-brand-soft/70 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-[380px] w-[380px] rounded-full bg-canvas-glow/70 blur-3xl" />
      </div>

      <div className="animate-rise relative w-full max-w-[430px]">
        

        <div className="rounded-card bg-surface p-6 shadow-shell sm:p-8">
          
          {error && <Alert className="mb-4">{error}</Alert>}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="Admin email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="[&_input]:pr-11"
              />
              <IconButton
                label={showPassword ? 'Hide password' : 'Show password'}
                size="sm"
                variant="plain"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute bottom-[9px] right-2"
              >
                <i aria-hidden="true" className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`} />
              </IconButton>
            </div>

            <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy}>
              {busy ? (
                <>
                  <i aria-hidden="true" className="bx bx-loader-alt animate-admin-spin text-[17px]" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to admin
                  <i aria-hidden="true" className="bx bx-right-arrow-alt text-[18px]" />
                </>
              )}
            </Button>
          </form>

         
        </div>

      </div>
    </div>
  );
}
