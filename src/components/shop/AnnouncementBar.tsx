import { useState, useEffect } from 'react';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { useLanguage } from '../../hooks/useLanguage';

export default function AnnouncementBar() {
  const { announcements, loading } = useAnnouncements(true);
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const isMk = language === 'mk';

  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setIsVisible(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  if (loading || announcements.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          backgroundColor: '#0A0A0A',
          borderBottom: '1px solid #1A1A1A',
          height: '35px'
        }}
      />
    );
  }

  const current = announcements[currentIndex];

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#0A0A0A',
        borderBottom: '1px solid #1A1A1A',
        height: '35px'
      }}
    >
      <a
        href={current.link || '#'}
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 16px',
          textDecoration: 'none',
          transition: 'opacity 0.2s'
        }}
      >
        <span
          style={{
            fontSize: '12px',
            letterSpacing: '0.5px',
            color: '#FFFFFF',
            transition: 'opacity 0.3s',
            opacity: isVisible ? 1 : 0
          }}
        >
          {(isMk && current.text_mk) || current.text}
          <strong style={{ fontWeight: 700, color: '#FBBE63' }}>{(isMk && current.highlight_mk) || current.highlight}</strong>
          {(isMk && current.suffix_mk) || current.suffix}
        </span>
      </a>
    </div>
  );
}
