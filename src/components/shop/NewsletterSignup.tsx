import { useState, type FormEvent } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { subscribeToNewsletter, type NewsletterError } from '../../lib/newsletter';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const ERROR_KEYS: Record<NewsletterError, string> = {
  invalid_email: 'newsletter.invalidEmail',
  consent_required: 'newsletter.consentRequired',
  rate_limited: 'newsletter.rateLimited',
  invalid_token: 'newsletter.error',
  server_error: 'newsletter.error',
};

export default function NewsletterSignup() {
  const { language, t } = useLanguage();
  const { isMobile } = useBreakpoint();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      setMessage(t('newsletter.invalidEmail'));
      return;
    }
    if (!consent) {
      setStatus('error');
      setMessage(t('newsletter.consentRequired'));
      return;
    }

    setStatus('sending');
    const result = await subscribeToNewsletter({ email: email.trim(), consent, language, website, source: 'footer' });
    if (result.success) {
      setStatus('success');
      setMessage(t('newsletter.success'));
      setEmail('');
      setConsent(false);
    } else {
      setStatus('error');
      setMessage(t(ERROR_KEYS[result.error || 'server_error']));
    }
  };

  return (
    <section
      style={{
        paddingBottom: 'clamp(32px, 5vw, 48px)',
        marginBottom: 'clamp(32px, 5vw, 48px)',
        borderBottom: '1px solid #1A1A1A',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '20px' : '48px',
        alignItems: 'start',
      }}
    >
      <div>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(22px, 3vw, 28px)',
            fontWeight: 400,
            color: '#FFFFFF',
            marginBottom: '10px',
          }}
        >
          {t('newsletter.title')}
        </h3>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          {t('newsletter.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
          <label htmlFor="newsletter-email" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            {t('newsletter.placeholder')}
          </label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletter.placeholder')}
            disabled={status === 'sending'}
            style={{
              flex: 1,
              padding: '14px 16px',
              fontSize: '14px',
              color: '#FFFFFF',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '0',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#FBBE63')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            style={{
              padding: '14px 28px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#0A0A0A',
              backgroundColor: '#FBBE63',
              border: 'none',
              cursor: status === 'sending' ? 'wait' : 'pointer',
              opacity: status === 'sending' ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {status === 'sending' ? t('newsletter.sending') : t('newsletter.button')}
          </button>
        </div>

        {/* Honeypot — hidden from people, bots fill it */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
        />

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginTop: '14px',
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ marginTop: '3px', accentColor: '#FBBE63', flexShrink: 0 }}
          />
          {t('newsletter.consent')}
        </label>

        {message && (
          <p
            role={status === 'error' ? 'alert' : 'status'}
            style={{
              marginTop: '12px',
              fontSize: '13px',
              color: status === 'success' ? '#FBBE63' : '#ff8a80',
            }}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
