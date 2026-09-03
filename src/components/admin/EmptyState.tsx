import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export default function EmptyState({ icon, title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div style={{ padding: '80px 32px', textAlign: 'center' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 28px',
          borderRadius: '16px',
          backgroundColor: '#F5F5F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#BBBBBB',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '20px',
          fontWeight: 500,
          color: '#0A0A0A',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: '#888888', maxWidth: '340px', margin: '0 auto 24px' }}>
        {description}
      </p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#B8860B',
            color: '#FFFFFF',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
