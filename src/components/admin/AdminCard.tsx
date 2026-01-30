import { type ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function AdminCard({ children, title, action, className = '', noPadding = false }: AdminCardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E8E8E8',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {title && (
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid #E8E8E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAFAFA',
          }}
        >
          <h2
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {title}
          </h2>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={noPadding ? undefined : { padding: '32px' }}>{children}</div>
    </div>
  );
}
