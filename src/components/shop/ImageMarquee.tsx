import { memo } from 'react';
import { Link } from 'react-router-dom';

interface ImageMarqueeProps {
  images: { src: string; slug: string; title: string }[];
}

const ImageMarquee = memo(function ImageMarquee({ images }: ImageMarqueeProps) {
  if (images.length === 0) return null;

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <section
      style={{
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#0A0A0A',
        margin: 0,
        padding: 0
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 0,
          animation: 'marquee 80s linear infinite',
          width: 'fit-content'
        }}
      >
        {duplicatedImages.map((image, index) => (
          <Link
            key={`${image.slug}-${index}`}
            to={`/artwork/${image.slug}`}
            style={{
              flex: '0 0 auto',
              width: '220px',
              height: '290px',
              overflow: 'hidden',
              display: 'block'
            }}
          >
            <img
              src={image.src}
              alt={image.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s, opacity 0.3s',
                opacity: 0.9
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.opacity = '0.9';
              }}
            />
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
});

export default ImageMarquee;
