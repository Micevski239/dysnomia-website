import { useState, useEffect, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../hooks/useCurrency';
import { useUserProfile } from '../../hooks/useUserProfile';

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: '14px',
  color: '#1a1a1a',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5e5',
  borderRadius: '4px',
  outline: 'none',
  boxSizing: 'border-box',
};

const fieldLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: '#6b6b6b',
  marginBottom: '4px',
};

export default function AccountSettings() {
  const { user, loading: authLoading } = useAuthContext();
  const { t, language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, error: profileError, saveProfile } = useUserProfile(user?.id);
  // Unsaved edits; fields fall back to the stored profile until edited.
  const [edits, setEdits] = useState<{ full_name?: string; phone?: string }>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'saved' | 'error' | null>(null);

  const fullName = edits.full_name ?? profile?.full_name ?? '';
  const phone = edits.phone ?? profile?.phone ?? '';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setStatus(null);
    const { error } = await saveProfile({
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
      preferred_language: language,
      preferred_currency: currency,
    });
    setSaving(false);
    if (error) {
      setStatus('error');
      return;
    }
    setEdits({});
    setStatus('saved');
    setTimeout(() => setStatus((s) => (s === 'saved' ? null : s)), 3000);
  };

  if (authLoading) {
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
            width: '40px',
            height: '40px',
            border: '3px solid #E5E5E5',
            borderTopColor: '#B8860B',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingTop: '120px' }}>
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        {/* Back Link */}
        <Link
          to="/account"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#6b6b6b',
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: '24px',
          }}
        >
          <svg
            style={{ width: '16px', height: '16px', marginRight: '8px' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {t('account.backToAccount')}
        </Link>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 300,
            color: '#1a1a1a',
            marginBottom: '32px',
          }}
        >
          {t('account.settings')}
        </h1>

        {status === 'saved' && (
          <div
            role="status"
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
            }}
          >
            <p style={{ color: '#166534', fontSize: '14px' }}>{t('account.settingsSaved')}</p>
          </div>
        )}
        {(status === 'error' || profileError) && (
          <div
            role="alert"
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
            }}
          >
            <p style={{ color: '#991b1b', fontSize: '14px' }}>
              {status === 'error' ? t('account.settingsSaveError') : t('account.settingsLoadError')}
            </p>
          </div>
        )}

        {/* Account Info */}
        <section
          style={{
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '16px',
            }}
          >
            {t('account.accountInformation')}
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <span style={fieldLabelStyle}>{t('account.email')}</span>
            <p style={{ color: '#1a1a1a' }}>{user.email}</p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="settings-full-name" style={fieldLabelStyle}>
              {t('account.fullName')}
            </label>
            <input
              id="settings-full-name"
              type="text"
              autoComplete="name"
              maxLength={120}
              value={fullName}
              disabled={profileLoading}
              onChange={(e) => setEdits((prev) => ({ ...prev, full_name: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="settings-phone" style={fieldLabelStyle}>
              {t('account.phone')}
            </label>
            <input
              id="settings-phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              value={phone}
              disabled={profileLoading}
              onChange={(e) => setEdits((prev) => ({ ...prev, phone: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </section>

        {/* Preferences */}
        <section
          style={{
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '20px',
            }}
          >
            {t('account.preferences')}
          </h2>

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
              {t('account.language')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setLanguage('en')}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: language === 'en' ? '#B8860B' : '#ffffff',
                  color: language === 'en' ? '#ffffff' : '#4a4a4a',
                  border: language === 'en' ? 'none' : '1px solid #e5e5e5',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('mk')}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: language === 'mk' ? '#B8860B' : '#ffffff',
                  color: language === 'mk' ? '#ffffff' : '#4a4a4a',
                  border: language === 'mk' ? 'none' : '1px solid #e5e5e5',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Македонски
              </button>
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1a1a1a',
                marginBottom: '8px',
              }}
            >
              {t('account.currency')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrency('MKD')}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: currency === 'MKD' ? '#B8860B' : '#ffffff',
                  color: currency === 'MKD' ? '#ffffff' : '#4a4a4a',
                  border: currency === 'MKD' ? 'none' : '1px solid #e5e5e5',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                MKD (ден.)
              </button>
              <button
                onClick={() => setCurrency('EUR')}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: currency === 'EUR' ? '#B8860B' : '#ffffff',
                  color: currency === 'EUR' ? '#ffffff' : '#4a4a4a',
                  border: currency === 'EUR' ? 'none' : '1px solid #e5e5e5',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                EUR (€)
              </button>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || profileLoading}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#B8860B',
            color: '#ffffff',
            fontWeight: 500,
            fontSize: '15px',
            border: 'none',
            borderRadius: '4px',
            cursor: saving || profileLoading ? 'default' : 'pointer',
            opacity: saving || profileLoading ? 0.7 : 1,
          }}
        >
          {saving ? t('account.saving') : t('account.saveSettings')}
        </button>
      </div>
    </div>
  );
}
