import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useLanguage } from '../hooks/useLanguage';
import { localize } from '../lib/localize';
import { useBreakpoint } from '../hooks/useBreakpoint';
import Accordion from '../components/ui/Accordion';
import SizeGuideModal from '../components/shop/SizeGuideModal';
import VariantSelector from '../components/shop/VariantSelector';
import ImageLightbox from '../components/shop/ImageLightbox';
import ReviewList from '../components/shop/ReviewList';
import StarRating from '../components/shop/StarRating';
import ProductCard from '../components/shop/ProductCard';
import { useReviews } from '../hooks/useReviews';
import { productContent } from '../config/productContent';
import { type PrintType } from '../config/printOptions';
import { type Product } from '../types';
import { supabase } from '../lib/supabase';

// Adjust these per frame color to position the artwork on each livingroom photo
const FRAME_DIMENSIONS: Record<string, { top: string; left: string; width: string; height: string }> = {
  gold:   { top: '7.3%', left: '48.9%', width: '46.6%', height: '63%' },
  silver: { top: '8.6%', left: '49%', width: '47.7%', height: '61.9%' },
  white:  { top: '7.3%', left: '48.9%', width: '46.6%', height: '63%' },
  black:  { top: '8%', left: '48.9%', width: '46.5%', height: '62.4%' },
};

// Kids bedroom mockup dimensions - same shape, tunable per image
const KIDS_FRAME_DIMENSIONS: Record<string, { top: string; left: string; width: string; height: string }> = {
  gold:   { top: '21%', left: '69.2%', width: '18.6%', height: '39.2%' },
  silver: { top: '21%', left: '69.15%', width: '18.8%', height: '39.1%' },
  white:  { top: '20.9%', left: '69.15%', width: '18.8%', height: '39%' },
  black:  { top: '21%', left: '69%', width: '19.1%', height: '39.1%' },
};

// Kids thumbnail dimensions - tunable separately from the main image
const KIDS_THUMB_DIMENSIONS: Record<string, { top: string; left: string; width: string; height: string }> = {
  gold:   { top: '21%', left: '78.2%', width: '27%', height: '39.2%' },
  silver: { top: '21%', left: '69.15%', width: '18.8%', height: '39.1%' },
  white:  { top: '20.9%', left: '69.15%', width: '18.8%', height: '39%' },
  black:  { top: '21%', left: '69%', width: '19.1%', height: '39.1%' },
};

const STATIC_REVIEWS_DATA = [
  {
    id: 'static-1',
    customer_name: 'Андријана',
    rating: 5,
    created_at: '2025-03-15T10:00:00Z',
    title: { en: null as string | null, mk: null as string | null },
    content: {
      en: 'The canvas is premium quality - the colors are vivid and the texture looks authentic. It fit perfectly into my minimalist interior and immediately became the center of attention. Delivery was timely and secure.',
      mk: 'Канвасот е премиум изработка - боите се живи, а текстурата изгледа автентично. Одлично се вклопи во мојот минималистички ентериер и веднаш стана центар на вниманието. Испораката беше навремена и безбедна.',
    },
  },
  {
    id: 'static-2',
    customer_name: 'Лазе',
    rating: 5,
    created_at: '2025-04-02T10:00:00Z',
    title: { en: 'Art That Enriches the Home' as string | null, mk: 'Уметност што го збогатува домот' as string | null },
    content: {
      en: 'A truly unique canvas - the frame is elegant and the print looks premium. The space gained warmth and style, and guests constantly ask where I bought it. Fast delivery and secure packaging - highly recommend!',
      mk: 'Навистина уникатен канвас - рамката е елегантна, а печатот изгледа премиум. Просторот доби топлина и стил, а гостите постојано ме прашуваат од каде е купен. Брза испорака и сигурно пакување - препорачувам!',
    },
  },
  {
    id: 'static-3',
    customer_name: 'Никола',
    rating: 5,
    created_at: '2025-04-18T10:00:00Z',
    title: { en: 'Elegant Canvas for Any Space' as string | null, mk: 'Елегантен канвас во секој простор' as string | null },
    content: {
      en: 'The canvas looks modern and sophisticated - the frame is slim and adds elegance. The colors bring harmony and instantly make the space more inviting. Delivery was timely and packaging secure.',
      mk: 'Канвасот изгледа модерно и софистицирано - рамката е тенка и додава елеганција. Боите внесуваат хармонија и веднаш го прават просторот попријатен. Испораката беше навремена, а пакувањето сигурно.',
    },
  },
  {
    id: 'static-4',
    customer_name: 'Зоки',
    rating: 5,
    created_at: '2025-05-05T10:00:00Z',
    title: { en: 'Luxurious Art in the Home' as string | null, mk: 'Луксузна уметност во домот' as string | null },
    content: {
      en: 'This canvas is the real choice for those who want style and quality. The texture is authentic, the frame sturdy, and the entire piece looks premium. The space gained new energy and warmth.',
      mk: 'Овој канвас е вистински избор за оние што сакаат стил и квалитет. Текстурата е автентична, рамката стабилна, а целата изработка изгледа премиум. Просторот доби нова енергија и топлина.',
    },
  },
  {
    id: 'static-5',
    customer_name: 'Оли',
    rating: 5,
    created_at: '2025-05-20T10:00:00Z',
    title: { en: 'Perfect Detail for the Interior' as string | null, mk: 'Совршен детал за ентериер' as string | null },
    content: {
      en: 'The painting is impressive and immediately draws attention. The colors are vivid and the frame is minimalist and modern. Fast delivery and secure packaging - truly satisfied with the choice.',
      mk: 'Сликата е впечатлива и веднаш привлекува внимание. Боите се живи, а рамката е минималистичка и модерна. Брза испорака и сигурно пакување - навистина задоволен сум од изборот.',
    },
  },
  {
    id: 'static-6',
    customer_name: 'Антонио',
    rating: 5,
    created_at: '2025-06-01T10:00:00Z',
    title: { en: 'Warm Recommendation for Dysnomia Gallery' as string | null, mk: 'Топла препорака за Dysnomia Gallery' as string | null },
    content: {
      en: 'I warmly recommend Dysnomia Gallery because every order comes with a unique gift of their random choice. The canvases are premium quality, the colors bring warmth and style, and the frames look elegant. Fast delivery and secure packaging - a true pleasure to shop from them.',
      mk: 'Топло ја препорачувам Dysnomia Gallery затоа што секоја нарачка носи уникатен подарок по нивен случаен избор. Канвасите се премиум изработка, боите внесуваат топлина и стил, а рамките изгледаат елегантно. Брза испорака и сигурно пакување - вистинско задоволство да се купува од нив.',
    },
  },
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug || '');
  const { addToCart } = useCart();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();
  const { t, language } = useLanguage();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedPrintType, setSelectedPrintType] = useState<PrintType>('canvas');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('50x70');
  const [addedToCart, setAddedToCart] = useState(false);
  const [frameColor, setFrameColor] = useState<string>('gold');
  const [imageLoading, setImageLoading] = useState(false);
  const loadStartRef = useRef<number>(0);
  const { isMobile } = useBreakpoint();
  const [isKidsCollection, setIsKidsCollection] = useState(false);
  const [collectionData, setCollectionData] = useState<{ title: string; title_mk?: string } | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLifestyleLightboxOpen, setIsLifestyleLightboxOpen] = useState(false);
  const [lifestyleLightboxIndex, setLifestyleLightboxIndex] = useState(0);

  useEffect(() => {
    if (!product) return;
    supabase
      .from('collection_products')
      .select('collection_id, collection:collections(slug,title,title_mk)')
      .eq('product_id', product.id)
      .then(({ data }) => {
        const rows = data || [];
        const collections = rows.flatMap((r: any) => {
          const c = r.collection;
          return Array.isArray(c) ? c : [c].filter(Boolean);
        });
        setIsKidsCollection(collections.some((c: any) => c.slug === 'kids'));
        if (collections.length > 0) {
          setCollectionData({ title: collections[0].title, title_mk: collections[0].title_mk });
        }

        // Fetch related products from the same collection
        const collectionId = rows[0]?.collection_id;
        if (!collectionId) return;
        supabase
          .from('collection_products')
          .select('product:products(*)')
          .eq('collection_id', collectionId)
          .neq('product_id', product.id)
          .limit(5)
          .then(({ data: relData }) => {
            const products = (relData || []).flatMap((r: any) => {
              const p = r.product;
              return Array.isArray(p) ? p : [p].filter(Boolean);
            }).filter((p: Product) => p.status === 'published');
            setRelatedProducts(products);
          });
      });
  }, [product?.id]);

  const roomPrefix = isKidsCollection ? '/kids' : '/livingroom';
  const frameDims = isKidsCollection ? KIDS_FRAME_DIMENSIONS : FRAME_DIMENSIONS;

  const MIN_LOADING_MS = 250;

  const startImageLoading = useCallback(() => {
    loadStartRef.current = Date.now();
    setImageLoading(true);
  }, []);

  const onImageLoaded = useCallback(() => {
    const elapsed = Date.now() - loadStartRef.current;
    const remaining = MIN_LOADING_MS - elapsed;
    if (remaining > 0) {
      setTimeout(() => setImageLoading(false), remaining);
    } else {
      setImageLoading(false);
    }
  }, []);

  // Get image URL based on selected print type
  const getImageForType = (type: PrintType): string | null => {
    if (!product) return null;
    switch (type) {
      case 'canvas':
        return product.image_url_canvas || product.image_url;
      case 'roll':
        return product.image_url_canvas || product.image_url;
      case 'framed':
        return product.image_url_framed || product.image_url;
      default:
        return product.image_url;
    }
  };

  const currentImage = getImageForType(selectedPrintType);

  // Lightbox images
  const lightboxImages = currentImage
    ? [{ url: currentImage, alt: product?.title || 'Product' }]
    : [];

  const handleImageClick = () => {
    setLightboxIndex(0);
    setIsLightboxOpen(true);
  };

  const handleAddToCart = () => {
    if (!product || !currentImage) return;

    addToCart({
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug,
      imageUrl: currentImage,
      printType: selectedPrintType,
      sizeId: selectedSizeId,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlistToggle = () => {
    if (!product || !currentImage) return;

    toggleWishlist({
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug,
      imageUrl: currentImage,
    });
  };

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Reviews
  const {
    reviews,
    averageRating,
    reviewCount,
    refetch: refetchReviews,
  } = useReviews(product?.id);

  const staticReviews = STATIC_REVIEWS_DATA.map(r => ({
    id: r.id,
    product_id: product?.id || '',
    customer_name: r.customer_name,
    customer_email: '',
    rating: r.rating,
    title: language === 'mk' ? r.title.mk : r.title.en,
    content: language === 'mk' ? r.content.mk : r.content.en,
    is_approved: true,
    created_at: r.created_at,
  }));

  const allReviews = [...reviews, ...staticReviews];
  const adjustedCount = reviewCount + STATIC_REVIEWS_DATA.length;
  const adjustedAverage = allReviews.length > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px' }}>
            <div style={{ aspectRatio: '3/4', backgroundColor: '#f5f5f5' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ height: '32px', backgroundColor: '#f5f5f5', width: '75%' }} />
              <div style={{ height: '24px', backgroundColor: '#f5f5f5', width: '25%' }} />
              <div style={{ height: '128px', backgroundColor: '#f5f5f5' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', border: '2px solid #e5e5e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '32px', height: '32px', color: '#6b6b6b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a', marginBottom: '16px' }}>{t('product.artworkNotFound')}</h2>
          <p style={{ color: '#6b6b6b', marginBottom: '32px' }}>
            {t('product.artworkNotFoundDesc')}
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#B8860B',
              color: '#ffffff',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textDecoration: 'none'
            }}
          >
            {t('product.backToGallery')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 24px)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#6b6b6b',
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: 'clamp(16px, 3vw, 32px)'
          }}
        >
          <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('product.backToGallery')}
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'clamp(24px, 5vw, 64px)' }}>
          {/* Image Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentImage ? (
              <>
                {/* Main big image */}
                <div style={{ position: 'relative' }}>
                  {/* Canvas / Roll - full image */}
                  {(selectedPrintType === 'canvas' || selectedPrintType === 'roll') && (
                    <div onClick={imageLoading ? undefined : handleImageClick} style={{ cursor: imageLoading ? 'default' : 'zoom-in', position: 'relative' }}>
                      <img
                        src={currentImage}
                        alt={product.title}
                        style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }}
                        onLoad={onImageLoaded}
                      />
                      {imageLoading && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                          <div style={{ width: '36px', height: '36px', border: '3px solid #E5E5E5', borderTopColor: '#B8860B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Framed - livingroom mockup */}
                  {selectedPrintType === 'framed' && (
                    <div
                      onClick={imageLoading ? undefined : handleImageClick}
                      style={{ cursor: imageLoading ? 'default' : 'zoom-in', position: 'relative', width: '100%', overflow: 'hidden' }}
                    >
                      <img
                        src={`${roomPrefix}${frameColor}.webp`}
                        alt="Room interior"
                        style={{ width: '100%', display: 'block' }}
                        onLoad={onImageLoaded}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: frameDims[frameColor].top,
                          left: frameDims[frameColor].left,
                          transform: 'translateX(-50%)',
                          width: frameDims[frameColor].width,
                          height: frameDims[frameColor].height,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={currentImage}
                          alt={`${product.title} - framed`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                      {/* Loading overlay */}
                      {imageLoading && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(2px)',
                          }}
                        >
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              border: '3px solid #E5E5E5',
                              borderTopColor: '#B8860B',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Zoom hint */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      pointerEvents: 'none',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                    {t('product.clickToZoom')}
                  </div>

                  {product.status === 'sold' && (
                    <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
                      <span style={{ backgroundColor: '#1a1a1a', color: '#ffffff', padding: '8px 16px', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                        {t('product.sold')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Two smaller thumbnails below */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['canvas', 'roll', 'framed'] as const)
                    .filter((v) => v !== selectedPrintType)
                    .map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setSelectedPrintType(view)}
                        style={{
                          position: 'relative',
                          width: '80px',
                          height: '80px',
                          padding: 0,
                          border: '2px solid #e5e5e5',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          background: 'none',
                          flexShrink: 0,
                          transition: 'border-color 0.15s ease',
                        }}
                      >
                        {/* Canvas / Roll thumbnail */}
                        {(view === 'canvas' || view === 'roll') && (
                          <img
                            src={currentImage}
                            alt={product.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        )}

                        {/* Framed thumbnail */}
                        {view === 'framed' && (
                          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <img
                              src={`${roomPrefix}${frameColor}.webp`}
                              alt="Room interior"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            {(() => {
                              const thumbDims = isKidsCollection ? KIDS_THUMB_DIMENSIONS : frameDims;
                              return (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: thumbDims[frameColor].top,
                                    left: thumbDims[frameColor].left,
                                    transform: 'translateX(-50%)',
                                    width: thumbDims[frameColor].width,
                                    height: thumbDims[frameColor].height,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <img
                                    src={currentImage}
                                    alt={`${product.title} - framed`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  />
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </button>
                    ))}
                </div>
              </>
            ) : (
              <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '64px', height: '64px', color: '#e5e5e5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {collectionData && (
              <p style={{ color: '#B8860B', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
                {localize(collectionData.title, collectionData.title_mk, language)}
              </p>
            )}

            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, color: '#1a1a1a', marginBottom: '12px' }}>
              {localize(product.title, product.title_mk, language)}
            </h1>

            {/* Rating Display */}
            {adjustedAverage !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <StarRating rating={adjustedAverage} size={18} />
                <span style={{ fontSize: '14px', color: '#6b6b6b' }}>
                  {adjustedAverage.toFixed(1)} ({adjustedCount} {adjustedCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            {product.status === 'sold' ? (
              <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', padding: '24px', marginBottom: '32px' }}>
                <p style={{ color: '#4a4a4a', fontSize: '14px' }}>
                  {t('product.soldMessage')}
                </p>
              </div>
            ) : (
              <>
                {/* Variant Selector */}
                <div style={{ marginBottom: '24px' }}>
                  <VariantSelector
                    printType={selectedPrintType}
                    onSelectionChange={(printType, sizeId, _price, newFrameColor) => {
                      const switchesToOrFromFramed = (printType === 'framed') !== (selectedPrintType === 'framed');
                      const frameChanged = newFrameColor && newFrameColor !== frameColor;
                      if (switchesToOrFromFramed || frameChanged) startImageLoading();
                      setSelectedPrintType(printType);
                      setSelectedSizeId(sizeId);
                      if (newFrameColor) setFrameColor(newFrameColor);
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                  <button
                    onClick={handleAddToCart}
                    style={{
                      flex: 1,
                      padding: '16px 40px',
                      backgroundColor: addedToCart ? '#22c55e' : '#B8860B',
                      color: '#ffffff',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '15px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {addedToCart ? t('product.added') : t('product.addToCart')}
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    style={{
                      width: '56px',
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e5',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={isWishlisted ? t('product.removeFromWishlist') : t('product.addToWishlist')}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={isWishlisted ? '#B8860B' : 'none'}
                      stroke={isWishlisted ? '#B8860B' : '#4a4a4a'}
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* Product ID and Size Guide Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '20px',
              borderBottom: '1px solid #e5e5e5',
              marginBottom: '0'
            }}>
              {product.product_code && (
                <span style={{
                  fontSize: '12px',
                  color: '#6b6b6b',
                  letterSpacing: '0.05em'
                }}>
                  {t('product.productId')}: {product.product_code}
                </span>
              )}
              {!product.product_code && <span />}
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                style={{
                  fontSize: '12px',
                  color: '#6b6b6b',
                  textDecoration: 'underline',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {t('product.sizeGuide')}
              </button>
            </div>

            {/* Accordion Sections */}
            <div>
              <Accordion title={t('product.description')} defaultOpen={true}>
                <p style={{ color: '#4a4a4a', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {localize(product.description, product.description_mk, language) || 'No description available.'}
                </p>
              </Accordion>

              <Accordion title={t('product.details')}>
                {(() => {
                  const text = localize(product.details, product.details_mk, language);
                  if (!text) return <p style={{ color: '#4a4a4a', lineHeight: 1.7 }}>No additional details available.</p>;
                  const lines = text.split('\n').filter((l: string) => l.trim());
                  return (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {lines.map((line: string, i: number) => {
                        const colonIdx = line.indexOf(':');
                        if (colonIdx === -1) return <li key={i} style={{ color: '#4a4a4a', fontSize: '14px', lineHeight: 1.6 }}>{line}</li>;
                        return (
                          <li key={i} style={{ color: '#4a4a4a', fontSize: '14px', lineHeight: 1.6 }}>
                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{line.slice(0, colonIdx)}:</span>
                            {line.slice(colonIdx + 1)}
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </Accordion>

              <Accordion title={t('product.frames')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {productContent.frames.map((frame, idx) => (
                    <Accordion key={idx} title={language === 'mk' ? frame.nameMk : frame.name}>
                      <p style={{ margin: '0 0 12px 0', color: '#4a4a4a', fontSize: '14px', lineHeight: 1.7 }}>
                        {language === 'mk' ? frame.descriptionMk : frame.description}
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <li style={{ color: '#4a4a4a', fontSize: '13px', lineHeight: 1.6 }}>
                          <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{language === 'mk' ? 'Ширина на раб' : 'Width Face'}:</span> {frame.dimensions.widthFace}
                        </li>
                        <li style={{ color: '#4a4a4a', fontSize: '13px', lineHeight: 1.6 }}>
                          <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{language === 'mk' ? 'Висина' : 'Height'}:</span> {frame.dimensions.height}
                        </li>
                        <li style={{ color: '#4a4a4a', fontSize: '13px', lineHeight: 1.6 }}>
                          <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{language === 'mk' ? 'Длабочина' : 'Rabbet Depth'}:</span> {frame.dimensions.rabbetDepth}
                        </li>
                      </ul>
                    </Accordion>
                  ))}
                </div>
              </Accordion>

              <Accordion title={t('product.deliveryReturns')}>
                <div style={{ color: '#4a4a4a', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {(language === 'mk' ? productContent.deliveryAndReturnsMk : productContent.deliveryAndReturns)
                    .split('\n')
                    .map((line, i) => {
                      const boldWords = ['Packaging', 'Returns', 'Пакување', 'Враќање'];
                      if (boldWords.includes(line.trim())) {
                        return <p key={i} style={{ fontWeight: 600, marginTop: '16px', marginBottom: '4px', color: '#0A0A0A' }}>{line}</p>;
                      }
                      return <span key={i}>{line}{'\n'}</span>;
                    })}
                </div>
              </Accordion>

              <Accordion title={t('product.support')}>
                <p style={{ color: '#4a4a4a', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {language === 'mk' ? productContent.supportMk : productContent.support}
                </p>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Customer Photos Strip */}
        <div style={{
          marginTop: '64px',
          paddingTop: '48px',
          paddingBottom: '48px',
          borderTop: '1px solid #e5e5e5',
          borderBottom: '1px solid #e5e5e5',
        }}>
          <h2 style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: '24px',
            letterSpacing: '0.02em',
          }}>
            {language === 'mk' ? 'Од нашите купувачи' : 'From Our Customers'}
          </h2>
          <div
            className="lifestyle-strip"
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            } as React.CSSProperties}
          >
            {([
              '/lifestyle/lifestyle3.webp',
              '/lifestyle/lifestyle2.webp',
              '/lifestyle/lifestyle4.webp',
            ] as const).map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`Customer photo ${i + 1}`}
                onClick={() => { setLifestyleLightboxIndex(i); setIsLifestyleLightboxOpen(true); }}
                style={{
                  height: '270px',
                  width: 'auto',
                  flexShrink: 0,
                  display: 'block',
                  cursor: 'zoom-in',
                }}
              />
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: '64px' }}>
          <ReviewList
            reviews={allReviews}
            averageRating={adjustedAverage}
            reviewCount={adjustedCount}
            productId={product.id}
            onReviewSubmitted={refetchReviews}
          />
        </div>

        {/* More from this collection */}
        {relatedProducts.length > 0 && collectionData && (
          <div style={{ marginTop: '80px', paddingTop: '48px', borderTop: '1px solid #e5e5e5' }}>
            <h2 style={{
              fontSize: 'clamp(20px, 3vw, 28px)',
              fontWeight: 300,
              color: '#1a1a1a',
              marginBottom: '32px',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}>
              {language === 'mk' ? 'Повеќе од' : 'More from'}{' '}
              {localize(collectionData.title, collectionData.title_mk, language)}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? 'repeat(2, 1fr)'
                : 'repeat(4, 1fr)',
              gap: isMobile ? '16px' : '24px',
            }}>
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={localize(p.title, p.title_mk, language)}
                  slug={p.slug}
                  price={p.price}
                  image={p.image_url_canvas || p.image_url || ''}
                  isKidsRoom={isKidsCollection}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      {/* Lifestyle Fullscreen Overlay */}
      {isLifestyleLightboxOpen && (() => {
        const lifestyleImages = [
          '/lifestyle/lifestyle3.webp',
          '/lifestyle/lifestyle2.webp',
          '/lifestyle/lifestyle4.webp',
        ];
        return (
          <div
            onClick={() => setIsLifestyleLightboxOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0,0,0,0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Close */}
            <button
              onClick={() => setIsLifestyleLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                color: '#ffffff',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {/* Prev */}
            {lifestyleLightboxIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLifestyleLightboxIndex(i => i - 1); }}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#ffffff',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            {/* Next */}
            {lifestyleLightboxIndex < lifestyleImages.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLifestyleLightboxIndex(i => i + 1); }}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#ffffff',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
            {/* Image */}
            <img
              src={lifestyleImages[lifestyleLightboxIndex]}
              alt={`Customer photo ${lifestyleLightboxIndex + 1}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            {/* Counter */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#ffffff',
              fontSize: '14px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '8px 16px',
              borderRadius: '20px',
            }}>
              {lifestyleLightboxIndex + 1} / {lifestyleImages.length}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
