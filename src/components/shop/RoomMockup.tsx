import { memo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

// Room templates for the product detail page
export const ROOM_TEMPLATES = [
  {
    id: 'living-room',
    name: 'Living Room',
    bgColor: '#F5F5F0',
    wallColor: '#FAFAF8',
    floorColor: '#C4B8A8',
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    bgColor: '#F0EDE8',
    wallColor: '#FAF9F7',
    floorColor: '#D4CFC8',
  },
  {
    id: 'office',
    name: 'Office',
    bgColor: '#EAEAEA',
    wallColor: '#F8F8F8',
    floorColor: '#A0A0A0',
  },
];

interface RoomMockupProps {
  artworkImage: string;
  artworkTitle: string;
  isKidsRoom?: boolean;
}

// Simple room preview for product cards - uses real room photo
const RoomMockup = memo(function RoomMockup({ artworkImage, artworkTitle, isKidsRoom = false }: RoomMockupProps) {
  const { t } = useLanguage();

  const roomImage = isKidsRoom ? '/roomcursor.webp' : '/room-preview.jpg';
  const artworkPosition = isKidsRoom
    ? { top: '21%', left: '60%', width: '35%', height: '35%' }
    : { top: '11.5%', left: '66.4%', width: '45.5%', height: '46%' };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Room Photo Background */}
      <img
        src={roomImage}
        alt="Room interior"
        loading="lazy"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: isKidsRoom ? 'left center' : 'center center',
        }}
      />

      {/* Artwork Frame on Wall - positioned to fit the room */}
      <div
        style={{
          position: 'absolute',
          top: artworkPosition.top,
          left: artworkPosition.left,
          transform: 'translateX(-50%)',
          width: artworkPosition.width,
          height: artworkPosition.height,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }}
      >
        <img
          src={artworkImage}
          alt={`${artworkTitle} in room`}
          loading="lazy"
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Room Preview Label */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          color: '#FFFFFF',
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '2px'
        }}
      >
        {t('home.roomPreview')}
      </div>
    </div>
  );
});

// Room Mockup View for Product Detail page
interface RoomMockupViewProps {
  artworkUrl: string;
  artworkTitle: string;
  roomId: string;
}

export function RoomMockupView({ artworkUrl, artworkTitle, roomId }: RoomMockupViewProps) {
  const room = ROOM_TEMPLATES.find(r => r.id === roomId) || ROOM_TEMPLATES[0];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3/4',
        backgroundColor: room.bgColor,
        overflow: 'hidden'
      }}
    >
      {/* Wall */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '70%',
          backgroundColor: room.wallColor
        }}
      />

      {/* Floor */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          backgroundColor: room.floorColor
        }}
      />

      {/* Artwork on Wall */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50%',
          aspectRatio: '3/4',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          padding: '12px'
        }}
      >
        <img
          src={artworkUrl}
          alt={`${artworkTitle} in ${room.name}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Room name label */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#FFFFFF',
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          padding: '6px 12px',
          borderRadius: '4px'
        }}
      >
        {room.name}
      </div>
    </div>
  );
}

// Room Thumbnail for Product Detail page
interface RoomThumbnailProps {
  room: typeof ROOM_TEMPLATES[0];
  artworkUrl: string;
  isSelected: boolean;
  onClick: () => void;
}

export function RoomThumbnail({ room, artworkUrl, isSelected, onClick }: RoomThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '72px',
        height: '72px',
        padding: 0,
        border: isSelected ? '2px solid #B8860B' : '2px solid #e5e5e5',
        borderRadius: '6px',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: isSelected ? 1 : 0.7,
        transition: 'all 0.15s ease',
        flexShrink: 0,
        position: 'relative',
        backgroundColor: room.bgColor
      }}
      title={room.name}
    >
      {/* Mini wall */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '70%',
          backgroundColor: room.wallColor
        }}
      />
      {/* Mini floor */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          backgroundColor: room.floorColor
        }}
      />
      {/* Mini artwork */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40%',
          aspectRatio: '3/4',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        <img
          src={artworkUrl}
          alt={`Preview in ${room.name}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    </button>
  );
}

export default RoomMockup;
