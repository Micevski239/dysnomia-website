import { Link } from 'react-router-dom';

export interface ActivityItem {
  id: string;
  type: 'order' | 'review' | 'product';
  title: string;
  description: string;
  timestamp: string;
  linkTo?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const activityConfig: Record<string, { emoji: string; bg: string; border: string }> = {
  order: { emoji: '🛒', bg: '#EFF6FF', border: '#DBEAFE' },
  review: { emoji: '⭐', bg: '#FFFBEB', border: '#FEF3C7' },
  product: { emoji: '✏️', bg: '#F0FDF4', border: '#DCFCE7' },
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function ActivityFeed({ activities, loading = false }: ActivityFeedProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }} className="animate-pulse">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F0F0F0', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '14px', width: '60%', backgroundColor: '#F0F0F0', borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '12px', width: '40%', backgroundColor: '#F0F0F0', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: '#888888', fontSize: '14px' }}>
        No recent activity
      </div>
    );
  }

  return (
    <div>
      {activities.map((activity, index) => {
        const config = activityConfig[activity.type] || activityConfig.product;

        const content = (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              padding: '20px',
              margin: '0 -20px',
              borderRadius: '12px',
              cursor: activity.linkTo ? 'pointer' : 'default',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F8F8')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: config.bg,
                border: `1px solid ${config.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              {config.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activity.title}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: '#888888',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px',
                }}
              >
                {activity.description}
              </p>
            </div>
            <span
              style={{
                fontSize: '12px',
                color: '#AAAAAA',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontWeight: 500,
              }}
            >
              {formatRelativeTime(activity.timestamp)}
            </span>
          </div>
        );

        return (
          <div key={activity.id}>
            {index > 0 && <div style={{ height: '1px', backgroundColor: '#F0F0F0', margin: '0 20px' }} />}
            {activity.linkTo ? (
              <Link to={activity.linkTo} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        );
      })}
    </div>
  );
}
