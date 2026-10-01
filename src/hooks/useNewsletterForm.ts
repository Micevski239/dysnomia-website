import { useState, type FormEvent } from 'react';
import { useLanguage } from './useLanguage';
import { subscribeToNewsletter, type NewsletterError } from '../lib/newsletter';
import { storageGet, storageSet } from '../lib/storage';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const ERROR_KEYS: Record<NewsletterError, string> = {
  invalid_email: 'newsletter.invalidEmail',
  consent_required: 'newsletter.consentRequired',
  rate_limited: 'newsletter.rateLimited',
  invalid_token: 'newsletter.error',
  server_error: 'newsletter.error',
};

// Set once this browser has signed up or closed the first-visit popup.
const POPUP_SEEN_KEY = 'newsletterPopupSeen';

export function hasSeenNewsletterPopup(): boolean {
  return storageGet('local', POPUP_SEEN_KEY) !== null;
}

export function markNewsletterPopupSeen(): void {
  storageSet('local', POPUP_SEEN_KEY, '1');
}

/** State and submit logic shared by every newsletter sign-up form; `source` records where the sign-up came from. */
export function useNewsletterForm(source: string) {
  const { language, t } = useLanguage();
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
    const result = await subscribeToNewsletter({ email: email.trim(), consent, language, website, source });
    if (result.success) {
      setStatus('success');
      setMessage(t('newsletter.success'));
      setEmail('');
      setConsent(false);
      markNewsletterPopupSeen();
    } else {
      setStatus('error');
      setMessage(t(ERROR_KEYS[result.error || 'server_error']));
    }
  };

  return { email, setEmail, consent, setConsent, website, setWebsite, status, message, handleSubmit };
}
