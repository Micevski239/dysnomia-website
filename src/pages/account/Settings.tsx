import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../hooks/useCurrency';

export default function AccountSettings() {
  const { user, loading: authLoading } = useAuthContext();
  const { t, language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          Back to Account
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

        {saved && (
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
            }}
          >
            <p style={{ color: '#166534', fontSize: '14px' }}>Settings saved successfully!</p>
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
            Account Information
          </h2>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#6b6b6b',
                marginBottom: '4px',
              }}
            >
              Email
            </label>
            <p style={{ color: '#1a1a1a' }}>{user.email}</p>
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
            Preferences
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
              Language
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
              Currency
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
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#B8860B',
            color: '#ffffff',
            fontWeight: 500,
            fontSize: '15px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {t('common.save')} Settings
        </button>
      </div>
    </div>
  );
}
