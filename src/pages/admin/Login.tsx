import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { validateLogin, type LoginFormErrors } from '../../lib/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});

  const { signIn, signOut, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  // Only admins go on to the dashboard; a signed-in customer sees the notice below.
  useEffect(() => {
    if (user && isAdmin && !authLoading) {
      navigate('/admin/products');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const isNonAdminUser = Boolean(user) && !isAdmin && !authLoading;

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const validationResult = validateLogin({ email, password });
    if (!validationResult.success) {
      setFieldErrors(validationResult.errors);
      return;
    }

    setLoading(true);

    const { error } = await signIn(email, password);

    setLoading(false);
    if (error) {
      setError(error.message);
    }
    // On success, the effect above navigates once admin status is confirmed.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-medium text-primary tracking-wider">DYSNOMIA</h1>
            <p className="text-xs text-muted mt-1 uppercase tracking-widest">Admin Portal</p>
          </Link>
        </div>

        {isNonAdminUser ? (
        <div className="bg-white border border-border p-8 shadow-sm text-center">
          <h2 className="text-xl font-medium text-dark mb-3">Access Denied</h2>
          <p className="text-sm text-muted mb-6">
            You are signed in as <span className="font-medium text-dark">{user?.email}</span>,
            which does not have admin privileges.
          </p>
          <div className="space-y-3">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? 'Signing out...' : 'Sign out and use another account'}
            </Button>
            <Link
              to="/"
              className="block text-sm text-muted hover:text-primary transition-colors"
            >
              Continue to the shop
            </Link>
          </div>
        </div>
        ) : (
        <div className="bg-white border border-border p-8 shadow-sm">
          <h2 className="text-xl font-medium text-dark mb-6 text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading || (Boolean(user) && authLoading) ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
        )}

        <p className="text-center mt-6 text-muted text-sm">
          <Link to="/" className="hover:text-primary transition-colors">
            &larr; Back to Gallery
          </Link>
        </p>
      </div>
    </div>
  );
}
