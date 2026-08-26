import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Spinner from '../components/Spinner.jsx';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.7 29.6 4.7 24 4.7c-7.4 0-13.7 4.2-16.9 10.4z"
      />
      <path
        fill="#4CAF50"
        d="M24 44.7c5.5 0 10.4-1.9 14.2-5.1l-6.5-5.5c-2.1 1.5-4.8 2.4-7.7 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.1 40.4 15.9 44.7 24 44.7z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.5 36.1 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

// Email+password login and registration, added alongside the original
// Google-OAuth-only flow (still available below as "Continue with Google").
// Registering and logging in both land on the same account by email, so
// someone who registers with a password can later also sign in with Google
// using the same address (see passport.js's upsert-by-email logic).
export default function Login() {
  const { isAuthenticated, loading, loginWithGoogle, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [loading, isAuthenticated, location, navigate]);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function switchMode(next) {
    setMode(next);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'register') {
        await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      } else {
        await api.post('/auth/login', { email: form.email, password: form.password });
      }
      await refresh();
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || isAuthenticated) {
    return <Spinner label="Loading…" />;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <Card className="w-full p-8 sm:p-10">
        <h1 className="text-center text-3xl font-bold text-brand">Sign Up! / Login!</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-gray-600">
          Join us to get in touch with endless possibilities for your doors related solutions!
        </p>

        <div className="mt-6 flex rounded-md border border-gray-200 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 rounded py-2 transition-colors ${
              mode === 'login' ? 'bg-brand text-white' : 'text-gray-500 hover:text-brand'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 rounded py-2 transition-colors ${
              mode === 'register' ? 'bg-brand text-white' : 'text-gray-500 hover:text-brand'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <Input label="Name" type="text" required value={form.name} onChange={handleChange('name')} />
          )}
          <Input
            label="Email"
            type="email"
            required
            autoComplete="username"
            value={form.email}
            onChange={handleChange('email')}
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={mode === 'register' ? 8 : undefined}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            value={form.password}
            onChange={handleChange('password')}
          />
          {mode === 'register' && <p className="text-xs text-gray-400">At least 8 characters.</p>}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" variant="primary" disabled={submitting} className="w-full justify-center">
            {submitting ? 'Please wait…' : mode === 'register' ? 'Create Account' : 'Log In'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          or
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <Button variant="accent" className="w-full justify-center" onClick={loginWithGoogle}>
          <GoogleIcon />
          Continue with Google
        </Button>
      </Card>
    </div>
  );
}
