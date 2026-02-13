import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '../hooks/useBlog';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLanguage } from '../hooks/useLanguage';
import { localize } from '../lib/localize';
import type { BlogPost } from '../types';

function estimateReadTime(content: string | null): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr: string | null, language: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(language === 'mk' ? 'mk-MK' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function BlogCard({ post, language, t }: { post: BlogPost; language: string; t: (key: string) => string }) {
  const [isHovered, setIsHovered] = useState(false);
  const title = localize(post.title, post.title_mk, language);
  const content = localize(post.content, post.content_mk, language);
  const readTime = estimateReadTime(content);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transition: 'transform 0.3s' }}
    >
      {/* Image */}
      <Link
        to={`/blog/${post.slug}`}
        style={{
          display: 'block',
          position: 'relative',
          aspectRatio: '3/4',
          backgroundColor: '#F5F5F5',
          overflow: 'hidden',
          textDecoration: 'none',
          border: isHovered ? '1px solid #FBBE63' : '1px solid #E5E5E5',
          transition: 'border-color 0.3s',
        }}
      >
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={title}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s',
              transform: isHovered ? 'scale(1.03)' : 'scale(1)',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" style={{ color: '#E5E5E5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </Link>

      {/* Info */}
      <div style={{ paddingTop: '12px' }}>
        <p style={{ fontSize: '11px', color: '#666666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {formatDate(post.published_at, language)} &middot; {readTime} {t('blog.minuteRead')}
        </p>
        <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '13px',
              color: isHovered ? '#FBBE63' : '#0A0A0A',
              fontWeight: 500,
              lineHeight: 1.4,
              marginBottom: '8px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.2s',
            }}
          >
            {title}
          </h3>
        </Link>
      </div>
    </div>
  );
}

export default function Blog() {
  const { posts, loading } = useBlogPosts();
  const { isMobile } = useBreakpoint();
  const { language, t } = useLanguage();

  const spotlight = useMemo(() => posts[0] || null, [posts]);
  const gridPosts = useMemo(() => posts.slice(1), [posts]);

  const spotlightTitle = spotlight ? localize(spotlight.title, spotlight.title_mk, language) : '';
  const spotlightExcerpt = spotlight ? localize(spotlight.excerpt, spotlight.excerpt_mk, language) : '';
  const spotlightContent = spotlight ? localize(spotlight.content, spotlight.content_mk, language) : '';
  const spotlightReadTime = estimateReadTime(spotlightContent);

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: '120px' }}>
      {/* Hero Section */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: `0 clamp(16px, 4vw, 48px) clamp(40px, 8vw, 80px)` }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: spotlight && !isMobile ? '1fr 1fr' : '1fr',
            gap: 'clamp(24px, 5vw, 48px)',
            alignItems: 'center',
          }}
        >
          {/* Text Content */}
          <div>
            <p
              style={{
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#FBBE63',
                marginBottom: '16px',
              }}
            >
              {t('blog.title')}
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(32px, 6vw, 52px)',
                color: '#0A0A0A',
                letterSpacing: '1px',
                lineHeight: 1.1,
                marginBottom: '24px',
              }}
            >
              {t('blog.heroTitle')} <span style={{ color: '#FBBE63' }}>{t('blog.heroTitleAccent')}</span>
            </h1>
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.7,
                color: '#666666',
                maxWidth: '500px',
                marginBottom: '32px',
              }}
            >
              {t('blog.heroDescription')}
            </p>
            {spotlight && (
              <Link
                to={`/blog/${spotlight.slug}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FBBE63';
                  e.currentTarget.style.color = '#0A0A0A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0A0A0A';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                {t('blog.readMore')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* Featured Post Image */}
          {spotlight && (
            <Link
              to={`/blog/${spotlight.slug}`}
              style={{
                display: 'block',
                position: 'relative',
                aspectRatio: '4/5',
                backgroundColor: '#F5F5F5',
                overflow: 'hidden',
                textDecoration: 'none',
              }}
            >
              {spotlight.cover_image ? (
                <img
                  src={spotlight.cover_image}
                  alt={spotlightTitle}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F5F5F5',
                  }}
                >
                  <svg width="48" height="48" style={{ color: '#E5E5E5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '32px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  color: '#FFFFFF',
                }}
              >
                <p
                  style={{
                    fontSize: '11px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    color: '#FBBE63',
                  }}
                >
                  {formatDate(spotlight.published_at, language)} &middot; {spotlightReadTime} {t('blog.minuteRead')}
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '28px',
                    marginBottom: '8px',
                  }}
                >
                  {spotlightTitle}
                </h3>
                {spotlightExcerpt && (
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, maxWidth: '400px' }}>
                    {spotlightExcerpt}
                  </p>
                )}
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Posts Grid */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: `clamp(32px, 6vw, 60px) clamp(16px, 4vw, 48px) clamp(48px, 8vw, 80px)` }}>
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '32px',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div
                  style={{
                    aspectRatio: '3/4',
                    backgroundColor: '#F5F5F5',
                    marginBottom: '12px',
                  }}
                />
                <div style={{ height: '12px', width: '60%', backgroundColor: '#F5F5F5', marginBottom: '8px' }} />
                <div style={{ height: '16px', width: '80%', backgroundColor: '#F5F5F5', marginBottom: '8px' }} />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E5E5',
            }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#0A0A0A',
                marginBottom: '12px',
              }}
            >
              {t('blog.noPosts')}
            </p>
            <p style={{ fontSize: '15px', color: '#666666' }}>
              {t('blog.noPostsMessage')}
            </p>
          </div>
        ) : gridPosts.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '32px',
            }}
          >
            {gridPosts.map((post) => (
              <BlogCard key={post.id} post={post} language={language} t={t} />
            ))}
          </div>
        ) : null}
      </section>

      {/* Gold Accent Line */}
      <div style={{ height: '4px', backgroundColor: '#FBBE63' }} />
    </div>
  );
}
