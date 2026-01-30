import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  linkText?: string;
  linkTo?: string;
  loading?: boolean;
  accentColor?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  linkText,
  linkTo,
  loading = false,
  accentColor = '#B8860B',
}: StatsCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E8E8E8',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '180px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: accentColor,
        }}
      />

      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: `${accentColor}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
          marginBottom: '20px',
        }}
      >
        {icon}
      </div>

      <p
        style={{
          fontSize: '12px',
          color: '#888888',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          marginBottom: '6px',
        }}
      >
        {title}
      </p>

      {loading ? (
        <div
          style={{
            height: '36px',
            width: '80px',
            backgroundColor: '#F0F0F0',
            borderRadius: '8px',
            marginBottom: '4px',
          }}
          className="animate-pulse"
        />
      ) : (
        <p
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#0A0A0A',
            lineHeight: 1.1,
            marginBottom: '4px',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {value}
        </p>
      )}

      {subtitle && (
        <p style={{ fontSize: '13px', color: '#888888', marginBottom: '12px' }}>{subtitle}</p>
      )}

      {linkText && linkTo && (
        <Link
          to={linkTo}
          style={{
            marginTop: 'auto',
            fontSize: '13px',
            color: accentColor,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {linkText}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
