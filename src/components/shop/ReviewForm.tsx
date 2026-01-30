import { useState } from 'react';
import StarRating from './StarRating';
import { useLanguage } from '../../hooks/useLanguage';
import { useReviewMutations } from '../../hooks/useReviews';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

export default function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const { t } = useLanguage();
  const { createReview, loading } = useReviewMutations();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const result = await createReview({
      productId,
      customerName: name,
      customerEmail: email,
      rating,
      title: title || undefined,
      content: content || undefined,
    });

    if (result.success) {
      setSubmitted(true);
      onSuccess?.();
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          style={{ margin: '0 auto 16px' }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#166534', marginBottom: '8px' }}>
          {t('reviews.thankYouReview')}
        </h3>
        <p style={{ color: '#15803d', fontSize: '14px' }}>{t('reviews.reviewPending')}</p>
      </div>
    );
  }

  const inputStyle = (fieldName: string) => ({
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    border: errors[fieldName] ? '1px solid #dc2626' : '1px solid #e5e5e5',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    outline: 'none',
  });

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Rating */}
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
            {t('reviews.rating')} *
          </label>
          <StarRating rating={rating} interactive onChange={setRating} size={28} />
          {errors.rating && (
            <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.rating}</p>
          )}
        </div>

        {/* Name & Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle('name')}
            />
            {errors.name && (
              <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.name}</p>
            )}
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
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle('email')}
            />
            {errors.email && (
              <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>{errors.email}</p>
            )}
          </div>
        </div>

        {/* Title */}
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
            {t('reviews.reviewTitle')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle('title')}
            placeholder="Summarize your experience"
          />
        </div>

        {/* Content */}
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
            {t('reviews.reviewContent')}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            style={{
              ...inputStyle('content'),
              resize: 'vertical',
            }}
            placeholder="Share your thoughts about this artwork..."
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: loading ? '#cccccc' : '#B8860B',
              color: '#ffffff',
              fontWeight: 500,
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? t('common.loading') : t('reviews.submitReview')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '14px 24px',
              backgroundColor: '#ffffff',
              color: '#6b6b6b',
              fontWeight: 500,
              border: '1px solid #e5e5e5',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </form>
  );
}
