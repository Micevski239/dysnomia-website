import { useState } from 'react';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import { useLanguage } from '../../hooks/useLanguage';
import type { Review } from '../../types';

interface ReviewListProps {
  reviews: Review[];
  averageRating: number | null;
  reviewCount: number;
  productId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewList({
  reviews,
  averageRating,
  reviewCount,
  productId,
  onReviewSubmitted,
}: ReviewListProps) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
            {t('reviews.reviews')} ({reviewCount})
          </h3>
          {averageRating !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StarRating rating={averageRating} size={18} />
              <span style={{ fontSize: '14px', color: '#6b6b6b' }}>
                {averageRating.toFixed(1)} average
              </span>
            </div>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#B8860B',
              color: '#ffffff',
              fontWeight: 500,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {t('reviews.writeReview')}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div
          style={{
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <ReviewForm
            productId={productId}
            onSuccess={() => {
              setShowForm(false);
              onReviewSubmitted();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div
          style={{
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#6b6b6b', marginBottom: '8px' }}>{t('reviews.noReviews')}</p>
          <p style={{ color: '#999999', fontSize: '14px' }}>{t('reviews.beFirstToReview')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: '24px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <StarRating rating={review.rating} size={16} />
                  {review.title && (
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#1a1a1a',
                        marginTop: '8px',
                      }}
                    >
                      {review.title}
                    </h4>
                  )}
                </div>
                <span style={{ fontSize: '13px', color: '#999999' }}>
                  {formatDate(review.created_at)}
                </span>
              </div>

              {review.content && (
                <p
                  style={{
                    color: '#4a4a4a',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    marginBottom: '12px',
                  }}
                >
                  {review.content}
                </p>
              )}

              <p style={{ fontSize: '13px', color: '#6b6b6b' }}>- {review.customer_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
