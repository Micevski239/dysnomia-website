import { Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogPost } from '../hooks/useBlog';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLanguage } from '../hooks/useLanguage';
import { localize } from '../lib/localize';
import SEO, { ArticleStructuredData, BreadcrumbStructuredData } from '../components/SEO';
import type { BlogImage } from '../types';

function estimateReadTime(content: string | null): number {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Split on blank lines; tolerates Windows line endings and whitespace-only lines. */
function splitParagraphs(content: string | null): string[] {
  if (!content) return [];
  return content
    .split(/\r?\n[ \t]*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Place each extra image after a paragraph. Images with an explicit
 * after_paragraph go there; the rest are spread evenly through the text.
 * Images whose position is past the last paragraph are returned as trailing.
 */
function placeImages(images: BlogImage[], paragraphCount: number) {
  const byParagraph = new Map<number, BlogImage[]>();
  const trailing: BlogImage[] = [];
  images.forEach((image, i) => {
    const target = image.after_paragraph && image.after_paragraph > 0
      ? image.after_paragraph - 1
      : Math.round((paragraphCount * (i + 1)) / (images.length + 1)) - 1;
    if (target >= 0 && target < paragraphCount - 1) {
      byParagraph.set(target, [...(byParagraph.get(target) || []), image]);
    } else {
      trailing.push(image);
    }
  });
  return { byParagraph, trailing };
}

function BlogFigure({ image, language }: { image: BlogImage; language: string }) {
  const caption = localize(image.caption || '', image.caption_mk, language);
  return (
    <figure style={{ display: 'flow-root', margin: '8px 0 28px' }}>
      <img
        src={image.url}
        alt={caption || ''}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      {caption && (
        <figcaption style={{ fontSize: '13px', color: '#6b6b6b', marginTop: '10px', lineHeight: 1.6, fontStyle: 'italic' }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
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

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, error } = useBlogPost(slug || '');
  const { language, t } = useLanguage();
  const { isMobile } = useBreakpoint();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', padding: '48px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ height: '14px', width: '120px', backgroundColor: '#f5f5f5', marginBottom: '32px' }} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '48px',
            }}
          >
            <div style={{ aspectRatio: '3/4', backgroundColor: '#f5f5f5' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ height: '32px', backgroundColor: '#f5f5f5', width: '75%' }} />
              <div style={{ height: '14px', backgroundColor: '#f5f5f5', width: '40%' }} />
              <div style={{ height: '128px', backgroundColor: '#f5f5f5' }} />
              <div style={{ height: '16px', backgroundColor: '#f5f5f5', width: '100%' }} />
              <div style={{ height: '16px', backgroundColor: '#f5f5f5', width: '90%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <SEO title={language === 'mk' ? 'Написот не е пронајден' : 'Post Not Found'} noindex />
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', border: '2px solid #e5e5e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '32px', height: '32px', color: '#6b6b6b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a', marginBottom: '16px' }}>
            {t('blog.postNotFound')}
          </h2>
          <p style={{ color: '#6b6b6b', marginBottom: '32px' }}>
            {t('blog.postNotFoundDesc')}
          </p>
          <Link
            to="/blog"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#B8860B',
              color: '#ffffff',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textDecoration: 'none',
            }}
          >
            {t('blog.backToBlog')}
          </Link>
        </div>
      </div>
    );
  }

  const title = localize(post.title, post.title_mk, language);
  const content = localize(post.content, post.content_mk, language);
  const readTime = estimateReadTime(content);
  const paragraphs = splitParagraphs(content);
  const galleryImages = (post.gallery_images || []).filter((img) => img?.url).slice(0, 2);
  const { byParagraph: imagesByParagraph, trailing: trailingImages } = placeImages(galleryImages, paragraphs.length);

  const excerpt = localize(post.excerpt, post.excerpt_mk, language) || content || title;
  const seoDescription = excerpt.length > 160 ? `${excerpt.slice(0, 157)}...` : excerpt;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 24px)' }}>
      <SEO
        title={title}
        description={seoDescription}
        image={post.cover_image || undefined}
        path={`/blog/${post.slug}`}
        type="article"
      />
      <ArticleStructuredData
        headline={title}
        description={seoDescription}
        image={post.cover_image}
        author={post.author}
        datePublished={post.published_at}
        dateModified={post.updated_at}
        slug={post.slug}
      />
      <BreadcrumbStructuredData
        items={[
          { name: language === 'mk' ? 'Почетна' : 'Home', path: '/' },
          { name: language === 'mk' ? 'Блог' : 'Blog', path: '/blog' },
          { name: title, path: `/blog/${post.slug}` },
        ]}
      />
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          to="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#6b6b6b',
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: 'clamp(16px, 3vw, 32px)',
          }}
        >
          <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('blog.backToBlog')}
        </Link>

        {/* Article: cover floats left, text wraps beside it and continues full-width below */}
        <article style={{ display: 'flow-root' }}>
          {/* Cover Image */}
          <div
            style={
              isMobile
                ? { width: '100%', marginBottom: '24px' }
                : { float: 'left', width: '44%', marginRight: 'clamp(28px, 4vw, 48px)', marginBottom: '24px' }
            }
          >
            {post.cover_image ? (
              <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                <img
                  src={post.cover_image}
                  alt={title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            ) : (
              <div style={{ aspectRatio: '3/4', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '64px', height: '64px', color: '#e5e5e5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Header — flow-root keeps the divider line from running under the floated cover */}
          <header style={{ display: 'flow-root' }}>
            <p style={{ color: '#B8860B', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
              {t('blog.title')}
            </p>

            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, color: '#1a1a1a', marginBottom: '12px' }}>
              {title}
            </h1>

            {/* Meta */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#6b6b6b',
                letterSpacing: '0.05em',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid #e5e5e5',
              }}
            >
              <span>{t('blog.by')} {post.author}</span>
              <span>&middot;</span>
              <span>{formatDate(post.published_at, language)}</span>
              <span>&middot;</span>
              <span>{readTime} {t('blog.minuteRead')}</span>
            </div>
          </header>

          {/* Content with up to two extra images between paragraphs */}
          {paragraphs.map((paragraph, index) => (
            <Fragment key={index}>
              <p
                style={{
                  color: '#4a4a4a',
                  lineHeight: 1.8,
                  marginBottom: '20px',
                  fontSize: '16px',
                  whiteSpace: 'pre-line',
                }}
              >
                {paragraph}
              </p>
              {(imagesByParagraph.get(index) || []).map((image) => (
                <BlogFigure key={image.url} image={image} language={language} />
              ))}
            </Fragment>
          ))}
          {trailingImages.map((image) => (
            <BlogFigure key={image.url} image={image} language={language} />
          ))}

          {/* Back to Blog CTA */}
          <div style={{ clear: 'both', paddingTop: '32px' }}>
            <Link
              to="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#0A0A0A',
                textDecoration: 'none',
                borderBottom: '2px solid #FBBE63',
                paddingBottom: '4px',
              }}
            >
              {t('blog.backToBlog')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
