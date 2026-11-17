import { useCallback, useState } from 'react';

// Artwork shown inside a (portrait) frame of a room photo.
// Portrait / near-square artworks fill the frame. Horizontal artworks are shown
// whole on a white passe-partout (mat) so they are not cropped or stretched.
const MAT_COLOR = '#F7F5F0';
const LANDSCAPE_RATIO = 1.15;

interface FramedArtworkProps {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
}

export default function FramedArtwork({ src, alt, loading }: FramedArtworkProps) {
  const [landscape, setLandscape] = useState(false);

  const measure = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth > 0) {
      setLandscape(img.naturalWidth / img.naturalHeight > LANDSCAPE_RATIO);
    }
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: landscape ? MAT_COLOR : 'transparent',
        boxShadow: landscape ? 'inset 0 0 6px rgba(0,0,0,0.12)' : undefined,
      }}
    >
      <img
        ref={measure}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={(e) => {
          const img = e.currentTarget;
          setLandscape(img.naturalWidth / img.naturalHeight > LANDSCAPE_RATIO);
        }}
        style={
          landscape
            ? { maxWidth: '84%', maxHeight: '84%', objectFit: 'contain', display: 'block', boxShadow: '0 1px 5px rgba(0,0,0,0.35)' }
            : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
        }
      />
    </div>
  );
}
