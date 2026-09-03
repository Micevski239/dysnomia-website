import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { supabase } from '../../lib/supabase';

export default function CustomerLogin() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        paddingTop: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '48px 24px',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 300,
            color: '#1a1a1a',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          {t('auth.signIn')}
        </h1>
        <p
          style={{
            color: '#6b6b6b',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          Welcome back to Dysnomia
        </p>

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
            }}
          >
            <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1a1a1a',
                marginBottom: '8px',
              }}
            >
              {t('auth.emailAddress')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                outline: 'none',
              }}
              placeholder="email@example.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1a1a1a',
                }}
              >
                {t('auth.password')}
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: '13px',
                  color: '#B8860B',
                  textDecoration: 'none',
                }}
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading ? '#cccccc' : '#B8860B',
              color: '#ffffff',
              fontWeight: 500,
              fontSize: '15px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
            }}
          >
            {loading ? t('common.loading') : t('auth.signIn')}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            color: '#6b6b6b',
            fontSize: '14px',
          }}
        >
          {t('auth.dontHaveAccount')}{' '}
          <Link
            to="/register"
            style={{
              color: '#B8860B',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            {t('auth.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}
