import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { unsubscribeFromNewsletter } from '../lib/newsletter';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { t } = useLanguage();
  const [status, setStatus] = useState<'working' | 'done' | 'invalid'>(token ? 'working' : 'invalid');

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    unsubscribeFromNewsletter(token).then((result) => {
      if (isMounted) setStatus(result.success ? 'done' : 'invalid');
    });
    return () => { isMounted = false; };
  }, [token]);

  const message =
    status === 'working' ? t('newsletter.unsubscribing')
    : status === 'done' ? t('newsletter.unsubscribed')
    : t('newsletter.unsubscribeInvalid');

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '70vh', paddingTop: '140px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(28px, 5vw, 40px)',
            color: '#0A0A0A',
            marginBottom: '20px',
          }}
        >
          {t('newsletter.unsubscribeTitle')}
        </h1>
        <p role="status" style={{ fontSize: '16px', lineHeight: 1.7, color: '#666666', marginBottom: '32px' }}>
          {message}
        </p>
        {status !== 'working' && (
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            {t('newsletter.backHome')}
          </Link>
        )}
      </div>
    </div>
  );
}
