import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Input } from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Spinner from '../../components/Spinner.jsx';

// Admin sign-in - uses the same generic POST /api/auth/login as the
// customer-facing email+password login (see pages/Login.jsx), just gated
// to only proceed to /admin if the authenticated account has role: admin.
export default function AdminLogin() {
  const { isAuthenticated, isAdmin, loading, refresh } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) navigate('/admin', { replace: true });
  }, [loading, isAuthenticated, isAdmin, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user.role !== 'admin') {
        // Don't leave them silently signed in as a non-admin after a
        // rejected admin-login attempt - undo the cookie this call just set.
        await api.post('/auth/logout');
        setError('This account does not have admin access.');
        return;
      }
      await refresh();
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4">
      <Card className="w-full p-8">
        <h1 className="text-center text-2xl font-bold text-brand">Admin Sign In</h1>
        <p className="mt-2 text-center text-sm text-gray-500">This login is for site administrators only.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="primary" disabled={submitting} className="w-full justify-center">
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
