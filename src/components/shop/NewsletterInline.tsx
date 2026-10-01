import { useId } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useNewsletterForm } from '../../hooks/useNewsletterForm';

interface NewsletterInlineProps {
  /** Where the form sits ('home', 'blog', 'popup'…) — stored with the sign-up. */
  source: string;
  title?: string;
  description?: string;
  /** 'card' = beige rounded block inside a page; 'plain' = no background (used inside the popup). */
  variant?: 'card' | 'plain';
}

/** Light-background newsletter sign-up for use inside pages (the footer has its own dark version). */
export default function NewsletterInline({ source, title, description, variant = 'card' }: NewsletterInlineProps) {
  const { t } = useLanguage();
  const { isMobile } = useBreakpoint();
  const inputId = useId();
  const { email, setEmail, consent, setConsent, website, setWebsite, status, message, handleSubmit } =
    useNewsletterForm(source);

  const isCard = variant === 'card';

  return (
    <div
      style={
        isCard
          ? {
              backgroundColor: '#f6f3ed',
              borderRadius: '32px',
              padding: isMobile ? '32px 24px' : '48px',
              textAlign: 'center',
            }
          : { textAlign: 'center' }
      }
    >
      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(22px, 3vw, 30px)',
          fontWeight: 400,
          color: '#0A0A0A',
          marginBottom: '10px',
        }}
      >
        {title || t('newsletter.title')}
      </h2>
      <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 24px' }}>
        {description || t('newsletter.description')}
      </p>

      {status === 'success' ? (
        <p role="status" style={{ fontSize: '15px', color: '#0A0A0A', fontWeight: 500 }}>
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
            <label htmlFor={inputId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              {t('newsletter.placeholder')}
            </label>
            <input
              id={inputId}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              disabled={status === 'sending'}
              style={{
                flex: 1,
                padding: '14px 18px',
                fontSize: '14px',
                color: '#0A0A0A',
                backgroundColor: '#FFFFFF',
                border: '1px solid #e0dcd2',
                borderRadius: '999px',
                outline: 'none',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#FBBE63')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e0dcd2')}
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
                color: '#FFFFFF',
                backgroundColor: '#0A0A0A',
                border: 'none',
                borderRadius: '999px',
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
              color: '#666666',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ marginTop: '3px', accentColor: '#0A0A0A', flexShrink: 0 }}
            />
            {t('newsletter.consent')}
          </label>

          {message && (
            <p role="alert" style={{ marginTop: '12px', fontSize: '13px', color: '#c62828', textAlign: 'left' }}>
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
