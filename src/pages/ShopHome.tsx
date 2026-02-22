import { useMemo } from 'react';
import { Hero, ProductCarousel, USPSection, GalleryTour, BrandStory } from '../components/shop';
import type { ProductCardProps } from '../components/shop';
import { useProducts } from '../hooks/useProducts';
import { useLanguage } from '../hooks/useLanguage';
import { useProductCollectionMap } from '../hooks/useProductCollectionMap';
import { localize } from '../lib/localize';
import type { Product } from '../types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=533&fit=crop';

const mapProductToCard = (product: Product, collectionName?: string, language = 'en'): ProductCardProps => ({
  id: product.id,
  title: localize(product.title, product.title_mk, language),
  slug: product.slug,
  brand: collectionName || 'dysnomia',
  price: Number(product.price) || 0,
  image: product.image_url || FALLBACK_IMAGE,
  hoverImage: product.image_url || FALLBACK_IMAGE,
  badge: product.status === 'sold' ? 'limited' : product.is_featured ? 'artist' : undefined,
  sizes: ['50x70 cm', '70x100 cm', '100x150 cm']
});

export default function ShopHome() {
  const { products, loading } = useProducts(false, { limit: 10 });
  const { t, language } = useLanguage();
  const productCollectionMap = useProductCollectionMap();

  const featuredProducts = useMemo(() => {
    const featured = products.filter((product) => product.is_featured);
    const source = featured.length > 0 ? featured : products;
    return source.slice(0, 10).map((p) => mapProductToCard(p, productCollectionMap[p.id], language));
  }, [products, productCollectionMap, language]);


  return (
    <>
      {/* Hero Section - Full-screen Gallery Showcase */}
      <Hero />

      {/* Featured Artworks Carousel */}
      {loading ? (
        <FeaturedCarouselSkeleton />
      ) : featuredProducts.length > 0 ? (
        <ProductCarousel title={t('home.featuredArtworks')} viewAllLink="/shop" products={featuredProducts} />
      ) : (
        <section style={{ padding: '60px 0', backgroundColor: '#FFFFFF' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px', textAlign: 'center' }}>
            <p style={{ color: '#666666', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {t('home.featuredEmpty')}
            </p>
          </div>
        </section>
      )}

      {/* Gallery Tour Preview - Collection Showcase */}
      <GalleryTour />

      {/* USP Section - Brand Values */}
      <USPSection />

      {/* Brand Story - Dysnomia Narrative */}
      <BrandStory />

    </>
  );
}

function FeaturedCarouselSkeleton() {
  return (
    <section style={{ padding: '60px 0', backgroundColor: '#FFFFFF' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ height: '28px', width: '240px', backgroundColor: '#f0f0f0' }} />
          <div style={{ height: '16px', width: '120px', backgroundColor: '#f0f0f0' }} />
        </div>
        <div style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ flex: '0 0 260px' }}>
              <div style={{ aspectRatio: '3 / 4', backgroundColor: '#f5f5f5', marginBottom: '12px' }} />
              <div style={{ height: '16px', width: '70%', backgroundColor: '#f0f0f0', marginBottom: '8px' }} />
              <div style={{ height: '14px', width: '50%', backgroundColor: '#f0f0f0' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
