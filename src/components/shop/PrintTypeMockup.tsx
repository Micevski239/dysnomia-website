import type { PrintType } from '../../config/printOptions';

interface PrintTypeMockupProps {
  imageUrl: string;
  alt: string;
  printType: PrintType;
  width?: number;
  height?: number;
}

interface MockupSvgProps {
  imageUrl: string;
  alt: string;
  width: number;
  height: number;
}

function CanvasMockup({ imageUrl, alt, width, height }: MockupSvgProps) {
  const sideWidth = width * 0.04;
  const artX = sideWidth;
  const artY = 0;
  const artW = width - sideWidth;
  const artH = height;

  return (
    <svg viewBox={`0 0 ${width} ${height + 12}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <filter id="canvas-shadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="3" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.18" />
        </filter>
        <clipPath id="canvas-art-clip">
          <rect x={artX} y={artY} width={artW} height={artH} />
        </clipPath>
        <clipPath id="canvas-side-clip">
          <polygon points={`0,${sideWidth} ${sideWidth},0 ${sideWidth},${artH} 0,${artH + sideWidth}`} />
        </clipPath>
      </defs>

      <g filter="url(#canvas-shadow)">
        {/* Side wrap (left edge showing canvas depth) */}
        <image
          href={imageUrl}
          x={-artW * 0.92}
          y={artY}
          width={artW}
          height={artH}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#canvas-side-clip)"
          opacity="0.55"
        />
        {/* Darken the side */}
        <polygon
          points={`0,${sideWidth} ${sideWidth},0 ${sideWidth},${artH} 0,${artH + sideWidth}`}
          fill="rgba(0,0,0,0.25)"
        />

        {/* Main artwork face */}
        <image
          href={imageUrl}
          x={artX}
          y={artY}
          width={artW}
          height={artH}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#canvas-art-clip)"
        />
      </g>

      {/* Accessibility */}
      <title>{alt} – Canvas Print</title>
    </svg>
  );
}

function RollMockup({ imageUrl, alt, width, height }: MockupSvgProps) {
  const pad = width * 0.06;
  const artX = pad;
  const artY = pad;
  const artW = width - pad * 2;
  const artH = height - pad * 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <filter id="roll-shadow" x="-5%" y="-5%" width="115%" height="115%">
          <feDropShadow dx="2" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.12" />
        </filter>
        <clipPath id="roll-art-clip">
          <rect x={artX} y={artY} width={artW} height={artH} />
        </clipPath>
      </defs>

      {/* Paper background */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="#fafaf8"
        filter="url(#roll-shadow)"
      />

      {/* Artwork */}
      <image
        href={imageUrl}
        x={artX}
        y={artY}
        width={artW}
        height={artH}
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#roll-art-clip)"
      />

      <title>{alt} – Roll Print</title>
    </svg>
  );
}

function FramedMockup({ imageUrl, alt, width, height }: MockupSvgProps) {
  const frameThick = width * 0.06;
  const matThick = width * 0.07;
  const totalBorder = frameThick + matThick;
  const artX = totalBorder;
  const artY = totalBorder;
  const artW = width - totalBorder * 2;
  const artH = height - totalBorder * 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <filter id="frame-shadow" x="-5%" y="-5%" width="115%" height="115%">
          <feDropShadow dx="3" dy="5" stdDeviation="8" floodColor="#000" floodOpacity="0.22" />
        </filter>
        <clipPath id="frame-art-clip">
          <rect x={artX} y={artY} width={artW} height={artH} />
        </clipPath>
      </defs>

      {/* Frame (outer) */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="#2a2220"
        filter="url(#frame-shadow)"
      />
      {/* Inner frame highlight */}
      <rect
        x={frameThick * 0.5}
        y={frameThick * 0.5}
        width={width - frameThick}
        height={height - frameThick}
        fill="none"
        stroke="#3d3330"
        strokeWidth="1"
      />

      {/* Mat (white border) */}
      <rect
        x={frameThick}
        y={frameThick}
        width={width - frameThick * 2}
        height={height - frameThick * 2}
        fill="#f5f3ee"
      />

      {/* Artwork */}
      <image
        href={imageUrl}
        x={artX}
        y={artY}
        width={artW}
        height={artH}
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#frame-art-clip)"
      />

      <title>{alt} – Framed Print</title>
    </svg>
  );
}

export default function PrintTypeMockup({
  imageUrl,
  alt,
  printType,
  width = 400,
  height = 500,
}: PrintTypeMockupProps) {
  switch (printType) {
    case 'canvas':
      return <CanvasMockup imageUrl={imageUrl} alt={alt} width={width} height={height} />;
    case 'roll':
      return <RollMockup imageUrl={imageUrl} alt={alt} width={width} height={height} />;
    case 'framed':
      return <FramedMockup imageUrl={imageUrl} alt={alt} width={width} height={height} />;
    default:
      return <CanvasMockup imageUrl={imageUrl} alt={alt} width={width} height={height} />;
  }
}
