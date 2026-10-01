import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { supabase } from '../../lib/supabase';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.resetFailed'));
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
          {sent ? t('auth.checkYourEmail') : t('auth.resetPassword')}
        </h1>
        <p
          style={{
            color: '#6b6b6b',
            textAlign: 'center',
            marginBottom: '32px',
            lineHeight: 1.6,
          }}
        >
          {sent ? (
            <>
              {t('auth.resetSentBefore')} <strong>{email.trim()}</strong>
              {t('auth.resetSentAfter')}
            </>
          ) : (
            t('auth.forgotIntro')
          )}
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

        {!sent && (
          <form onSubmit={handleSubmit}>
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
              {loading ? t('common.loading') : t('auth.sendResetLink')}
            </button>
          </form>
        )}

        <p
          style={{
            textAlign: 'center',
            fontSize: '14px',
          }}
        >
          <Link
            to="/login"
            style={{
              color: '#B8860B',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            {t('auth.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
