import { useState, useEffect } from 'react';

const announcements = [
  {
    text: 'Welcome to ',
    highlight: 'Dysnomia Art Gallery',
    suffix: ' — Where Art Meets Lifestyle',
    link: '#about'
  },
  {
    text: 'New Collection: ',
    highlight: 'Limited Edition Artworks',
    suffix: ' — Explore Now',
    link: '#collections'
  },
  {
    text: 'Free shipping on orders over ',
    highlight: '€100',
    suffix: ' — Eco-friendly packaging',
    link: '#shipping'
  }
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setIsVisible(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
        href={current.link}
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
          {current.text}
          <strong style={{ fontWeight: 700, color: '#FBBE63' }}>{current.highlight}</strong>
          {current.suffix}
        </span>
      </a>
    </div>
  );
}
