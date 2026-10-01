import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              backgroundColor: '#f0fdf4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 300,
              color: '#1a1a1a',
              marginBottom: '12px',
            }}
          >
            {t('auth.checkYourEmail')}
          </h1>
          <p
            style={{
              color: '#6b6b6b',
              marginBottom: '32px',
            }}
          >
            {t('auth.confirmationSentBefore')} <strong>{email}</strong>{t('auth.confirmationSentAfter')}
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#B8860B',
              color: '#ffffff',
              fontWeight: 500,
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

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
          {t('auth.createAccount')}
        </h1>
        <p
          style={{
            color: '#6b6b6b',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          {t('auth.joinGallery')}
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
              {t('auth.fullName')}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              {t('auth.password')}
            </label>
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
              placeholder={t('auth.passwordPlaceholder')}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1a1a1a',
                marginBottom: '8px',
              }}
            >
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? t('common.loading') : t('auth.createAccount')}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            color: '#6b6b6b',
            fontSize: '14px',
          }}
        >
          {t('auth.alreadyHaveAccount')}{' '}
          <Link
            to="/login"
            style={{
              color: '#B8860B',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
