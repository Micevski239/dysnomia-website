import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCollections } from '../../hooks/useCollections';
import { useDashboardStats, useRecentActivity } from '../../hooks/useDashboardStats';
import { AdminCard, StatsCard, ActivityFeed } from '../../components/admin';
import {
  ShoppingCart,
  CalendarDays,
  DollarSign,
  MessageSquare,
  Plus,
  Package,
  Layers,
  ExternalLink,
} from 'lucide-react';

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 28px',
  backgroundColor: '#0A0A0A',
  color: '#FFFFFF',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 28px',
  backgroundColor: '#FFFFFF',
  color: '#1a1a1a',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  border: '1px solid #E5E5E5',
  cursor: 'pointer',
};

export default function Dashboard() {
  const { products, loading: productsLoading } = useProducts(true);
  const { collections, loading: collectionsLoading } = useCollections(true);
  const { stats, loading: statsLoading } = useDashboardStats();
  const { activities, loading: activitiesLoading } = useRecentActivity();

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.status === 'published').length;
  const totalCollections = collections.length;

  const formatPrice = (amount: number) => `${amount.toLocaleString()} MKD`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#999999', marginBottom: '8px', fontWeight: 600 }}>
          Overview
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '36px', fontWeight: 500, color: '#0A0A0A' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '15px', color: '#888888', marginTop: '8px' }}>
          Welcome to your gallery admin panel
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <Link to="/admin/products/new" style={btnPrimary}>
          <Plus style={{ width: '18px', height: '18px' }} />
          Add Product
        </Link>
        <Link to="/admin/collections/new" style={btnSecondary}>
          <Plus style={{ width: '18px', height: '18px' }} />
          Add Collection
        </Link>
        <Link to="/" target="_blank" style={btnSecondary}>
          <ExternalLink style={{ width: '18px', height: '18px' }} />
          View Store
        </Link>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<ShoppingCart style={{ width: '24px', height: '24px' }} />}
          linkText="View All"
          linkTo="/admin/orders"
          loading={statsLoading}
          accentColor="#E67E22"
        />
        <StatsCard
          title="Today's Orders"
          value={stats.todayOrders}
          icon={<CalendarDays style={{ width: '24px', height: '24px' }} />}
          linkText="View All"
          linkTo="/admin/orders"
          loading={statsLoading}
          accentColor="#3498DB"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatPrice(stats.monthlyRevenue)}
          subtitle="This Month"
          icon={<DollarSign style={{ width: '24px', height: '24px' }} />}
          loading={statsLoading}
          accentColor="#27AE60"
        />
        <StatsCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={<MessageSquare style={{ width: '24px', height: '24px' }} />}
          linkText="Moderate"
          linkTo="/admin/reviews"
          loading={statsLoading}
          accentColor="#9B59B6"
        />
      </div>

      {/* Inventory Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <StatsCard
          title="Total Products"
          value={totalProducts}
          icon={<Package style={{ width: '24px', height: '24px' }} />}
          linkText="Manage"
          linkTo="/admin/products"
          loading={productsLoading}
        />
        <StatsCard
          title="Published"
          value={publishedProducts}
          subtitle={`${totalProducts > 0 ? Math.round((publishedProducts / totalProducts) * 100) : 0}% of total`}
          icon={<Package style={{ width: '24px', height: '24px' }} />}
          loading={productsLoading}
        />
        <StatsCard
          title="Collections"
          value={totalCollections}
          icon={<Layers style={{ width: '24px', height: '24px' }} />}
          linkText="Manage"
          linkTo="/admin/collections"
          loading={collectionsLoading}
        />
      </div>

      {/* Recent Activity */}
      <AdminCard title="Recent Activity">
        <ActivityFeed activities={activities} loading={activitiesLoading} />
      </AdminCard>
    </div>
  );
}
