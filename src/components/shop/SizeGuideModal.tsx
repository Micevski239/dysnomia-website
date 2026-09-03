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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <img
            src="/sizeguide1.webp"
            alt="Size guide 1"
            style={{ width: '100%', display: 'block' }}
          />
          <img
            src="/sizeguide2.webp"
            alt="Size guide 2"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
}
