import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  fontSize: '15px',
  border: '1px solid #e5e5e5',
  borderRadius: '4px',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#1a1a1a',
  marginBottom: '8px',
};

const linkStyle = {
  color: '#B8860B',
  textDecoration: 'none',
  fontWeight: 500,
};

/**
 * Landing page for the link in the password-reset e-mail. Supabase reads the
 * token from the URL and signs the visitor in, so a signed-in user here means
 * the link was valid; no user means it expired or was already used.
 */
export default function ResetPassword() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuthContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  const linkInvalid = !authLoading && !user && !done;

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
          {t('auth.resetPassword')}
        </h1>

        {authLoading ? (
          <p style={{ color: '#6b6b6b', textAlign: 'center' }}>{t('common.loading')}</p>
        ) : done ? (
          <>
            <p style={{ color: '#6b6b6b', textAlign: 'center', marginBottom: '32px', lineHeight: 1.6 }}>
              {t('auth.passwordUpdated')}
            </p>
            <p style={{ textAlign: 'center', fontSize: '14px' }}>
              <Link to="/account" style={linkStyle}>
                {t('auth.continueToAccount')}
              </Link>
            </p>
          </>
        ) : linkInvalid ? (
          <>
            <p style={{ color: '#6b6b6b', textAlign: 'center', marginBottom: '32px', lineHeight: 1.6 }}>
              {t('auth.resetLinkInvalid')}
            </p>
            <p style={{ textAlign: 'center', fontSize: '14px' }}>
              <Link to="/forgot-password" style={linkStyle}>
                {t('auth.requestNewLink')}
              </Link>
            </p>
          </>
        ) : (
          <>
            <p style={{ color: '#6b6b6b', textAlign: 'center', marginBottom: '32px' }}>
              {t('auth.chooseNewPassword')}
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
                <label style={labelStyle}>{t('auth.newPassword')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={inputStyle}
                  placeholder={t('auth.passwordPlaceholder')}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>{t('auth.confirmPassword')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={inputStyle}
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
                }}
              >
                {loading ? t('common.loading') : t('auth.saveNewPassword')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
