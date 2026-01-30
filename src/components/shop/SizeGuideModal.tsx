import { useEffect } from 'react';
import { X } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '40px',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#6b6b6b',
          }}
        >
          <X style={{ width: '24px', height: '24px' }} />
        </button>

        {/* Content */}
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 300,
            color: '#1a1a1a',
            marginBottom: '24px',
          }}
        >
          Size Guide
        </h2>

        <div style={{ color: '#4a4a4a', lineHeight: 1.7 }}>
          <p style={{ marginBottom: '16px' }}>
            All artwork dimensions are provided in the product details section. Measurements are given in centimeters (cm) unless otherwise specified.
          </p>

          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: '24px',
              marginBottom: '12px',
            }}
          >
            How to Measure
          </h3>
          <p style={{ marginBottom: '16px' }}>
            Height × Width dimensions refer to the artwork itself, not including any frame or mounting. If framing is included, additional dimensions will be noted.
          </p>

          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: '24px',
              marginBottom: '12px',
            }}
          >
            Need Help?
          </h3>
          <p>
            If you need specific measurements or have questions about sizing, please don't hesitate to contact us.
          </p>
        </div>
      </div>
    </div>
  );
}
