import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useExhibition, useExhibitions } from '../hooks/useExhibitions';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLanguage } from '../hooks/useLanguage';
import { useSlugRedirect } from '../hooks/useSlugRedirect';
import SEO, { BreadcrumbStructuredData, ExhibitionStructuredData } from '../components/SEO';
import {
  ART_SCENE_PATH,
  cityForPhrase,
  cityName,
  exhibitionSeoDescription,
  exhibitionSeoTitle,
  exhibitionStatus,
  formatDateRange,
  pickText,
  todayInSkopje,
} from '../config/artScene';
import type { Exhibition as ExhibitionRow } from '../types';

/** Split on blank lines; tolerates Windows line endings and whitespace-only lines. */
function paragraphs(text: string): string[] {
  return text
    .split(/\r?\n[ \t]*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const STATUS_STYLE = {
  current: { backgroundColor: '#FBBE63', color: '#0A0A0A', border: '1px solid #FBBE63' },
  upcoming: { backgroundColor: '#FFFFFF', color: '#0A0A0A', border: '1px solid #0A0A0A' },
  ended: { backgroundColor: '#F2F2F2', color: '#666666', border: '1px solid #F2F2F2' },
} as const;

const STATUS_KEY = {
  current: 'artScene.statusCurrent',
  upcoming: 'artScene.statusUpcoming',
  ended: 'artScene.statusEnded',
} as const;

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontSize: '12px', color: '#666666' }}>{label}</span>
      <span style={{ fontSize: '16px', color: '#0A0A0A', lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}

function RelatedCard({ ex, language }: { ex: ExhibitionRow; language: string }) {
  const title = pickText(ex.title, ex.title_mk, language);
  return (
    <Link to={`${ART_SCENE_PATH}/${ex.slug}`} style={{ display: 'flex', flexDirection: 'column', gap: '10px', textDecoration: 'none', color: '#0A0A0A' }}>
      <div style={{ aspectRatio: '4 / 3', borderRadius: '22px', overflow: 'hidden', backgroundColor: '#f6f3ed' }}>
        {ex.cover_image && (
          <img src={ex.cover_image} alt={title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#666666' }}>
        {pickText(ex.artist, ex.artist_mk, language)}
      </span>
      <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', lineHeight: 1.25 }}>
        {language === 'mk' ? `„${title}“` : `“${title}”`}
      </span>
      <span style={{ fontSize: '13px', color: '#666666' }}>
        {pickText(ex.venue, ex.venue_mk, language)} · {formatDateRange(ex.start_date, ex.end_date, language)}
      </span>
    </Link>
  );
}

export default function Exhibition() {
  const { slug } = useParams<{ slug: string }>();
  const { exhibition, loading, notFound } = useExhibition(slug || '');
  const { exhibitions } = useExhibitions();
  const { language, t } = useLanguage();
  const { isMobile, isMobileOrTablet } = useBreakpoint();
  const checkingRedirect = useSlugRedirect('exhibition', slug, !loading && notFound, `${ART_SCENE_PATH}/`);

  const today = todayInSkopje();

  // Same city first, then anything still on or coming up; never the page itself
  const related = useMemo(() => {
    if (!exhibition) return [];
    const others = exhibitions.filter((ex) => ex.id !== exhibition.id);
    const live = (ex: ExhibitionRow) => exhibitionStatus(ex, today) !== 'ended';
    const sameCity = others.filter((ex) => ex.city === exhibition.city && live(ex));
    const rest = others.filter((ex) => !sameCity.includes(ex) && live(ex));
    return [...sameCity, ...rest].slice(0, 3);
  }, [exhibition, exhibitions, today]);

  const pagePadding = { padding: `0 clamp(16px, 4vw, 48px)` };

  if (loading || checkingRedirect) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', paddingTop: isMobileOrTablet ? '100px' : '120px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', ...pagePadding }}>
          <div style={{ height: '14px', width: '160px', backgroundColor: '#F5F5F5', margin: '32px 0' }} />
          <div style={{ height: '56px', width: '60%', backgroundColor: '#F5F5F5', marginBottom: '24px' }} />
          <div style={{ aspectRatio: '16 / 8', borderRadius: '36px', backgroundColor: '#F5F5F5' }} />
        </div>
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 48px' }}>
        <SEO title={t('artScene.notFound')} noindex />
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', fontWeight: 400, color: '#0A0A0A', marginBottom: '12px' }}>
            {t('artScene.notFound')}
          </h1>
          <p style={{ color: '#666666', marginBottom: '28px' }}>{t('artScene.notFoundDesc')}</p>
          <Link
            to={ART_SCENE_PATH}
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              borderRadius: '999px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '1px',
            }}
          >
            {t('artScene.back')}
          </Link>
        </div>
      </div>
    );
  }

  const status = exhibitionStatus(exhibition, today);
  const title = pickText(exhibition.title, exhibition.title_mk, language);
  const artist = pickText(exhibition.artist, exhibition.artist_mk, language);
  const venue = pickText(exhibition.venue, exhibition.venue_mk, language);
  const organizer = pickText(exhibition.organizer, exhibition.organizer_mk, language);
  const city = cityName(exhibition.city, language);
  const dates = formatDateRange(exhibition.start_date, exhibition.end_date, language);
  const content = paragraphs(pickText(exhibition.content, exhibition.content_mk, language));
  const summary = pickText(exhibition.summary, exhibition.summary_mk, language);
  const bio = paragraphs(pickText(exhibition.artist_bio, exhibition.artist_bio_mk, language));
  const alt = pickText(exhibition.cover_alt, exhibition.cover_alt_mk, language) || `${artist} – ${title}`;
  const typeLabel = t(exhibition.exhibition_type === 'solo' ? 'artScene.typeSolo' : 'artScene.typeGroup');
  const location = exhibition.city === 'other' ? venue : `${venue}, ${city}`;
  const quotedTitle = language === 'mk' ? `„${title}“` : `“${title}”`;
  const aboutParagraphs = content.length > 0 ? content : summary ? [summary] : [];

  const sectionTitle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#0A0A0A',
    marginBottom: '18px',
  };
  const bodyText: React.CSSProperties = { fontSize: '17px', lineHeight: 1.8, color: '#333333', marginBottom: '18px' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', paddingTop: isMobileOrTablet ? '100px' : '120px' }}>
      <SEO
        title={exhibitionSeoTitle(exhibition, language)}
        description={exhibitionSeoDescription(exhibition, language)}
        image={exhibition.cover_image || undefined}
        path={`${ART_SCENE_PATH}/${exhibition.slug}`}
        type="article"
      />
      <ExhibitionStructuredData
        name={`${artist} – ${title}`}
        description={exhibitionSeoDescription(exhibition, language)}
        image={exhibition.cover_image}
        artist={artist}
        startDate={exhibition.start_date}
        endDate={exhibition.end_date}
        venue={venue}
        city={cityForPhrase(exhibition.city, language)}
        organizer={organizer || null}
        officialUrl={exhibition.official_url}
        slug={exhibition.slug}
      />
      <BreadcrumbStructuredData
        items={[
          { name: language === 'mk' ? 'Почетна' : 'Home', path: '/' },
          { name: t('artScene.title'), path: ART_SCENE_PATH },
          { name: `${artist} – ${title}`, path: `${ART_SCENE_PATH}/${exhibition.slug}` },
        ]}
      />

      {/* Header */}
      <section style={{ maxWidth: '1180px', margin: '0 auto', ...pagePadding, paddingTop: 'clamp(16px, 3vw, 32px)', paddingBottom: '32px' }}>
        <Link to={ART_SCENE_PATH} style={{ fontSize: '14px', color: '#666666', textDecoration: 'none' }}>
          ← {t('artScene.back')}
        </Link>
        <p style={{ marginTop: 'clamp(24px, 4vw, 40px)', fontSize: '14px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#666666' }}>
          {artist}
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 400,
            fontSize: 'clamp(40px, 7vw, 72px)',
            lineHeight: 1.05,
            color: '#0A0A0A',
            margin: '10px 0 18px',
          }}
        >
          {quotedTitle}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 16px', fontSize: '16px', color: '#444444' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '5px 12px',
              borderRadius: '999px',
              ...STATUS_STYLE[status],
            }}
          >
            {t(STATUS_KEY[status])}
          </span>
          <span>{dates}</span>
          <span style={{ color: '#BBBBBB' }}>·</span>
          <span>{location}</span>
        </div>
      </section>

      {/* Cover */}
      {exhibition.cover_image && (
        <section style={{ maxWidth: '1180px', margin: '0 auto', ...pagePadding }}>
          <figure style={{ margin: 0 }}>
            <div style={{ borderRadius: isMobile ? '24px' : '36px', overflow: 'hidden', backgroundColor: '#f6f3ed' }}>
              <img
                src={exhibition.cover_image}
                alt={alt}
                style={{ display: 'block', width: '100%', maxHeight: '640px', objectFit: 'cover' }}
              />
            </div>
            {exhibition.photo_credit && (
              <figcaption style={{ marginTop: '8px', fontSize: '12px', color: '#666666' }}>
                {t('artScene.photo')}: {exhibition.photo_credit}
              </figcaption>
            )}
          </figure>
        </section>
      )}

      {/* Body + info */}
      <section
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
          ...pagePadding,
          paddingTop: 'clamp(40px, 6vw, 56px)',
          paddingBottom: 'clamp(40px, 6vw, 56px)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'clamp(32px, 5vw, 56px)',
          alignItems: 'flex-start',
        }}
      >
        <article style={{ flex: '999 1 520px', minWidth: 0 }}>
          {aboutParagraphs.length > 0 && (
            <>
              <h2 style={sectionTitle}>{t('artScene.aboutExhibition')}</h2>
              {aboutParagraphs.map((p, i) => (
                <p key={i} style={{ ...bodyText, whiteSpace: 'pre-line' }}>
                  {p}
                </p>
              ))}
            </>
          )}
          {bio.length > 0 && (
            <>
              <h2 style={{ ...sectionTitle, marginTop: '36px' }}>{t('artScene.aboutArtist')}</h2>
              {bio.map((p, i) => (
                <p key={i} style={{ ...bodyText, whiteSpace: 'pre-line' }}>
                  {p}
                </p>
              ))}
            </>
          )}
        </article>

        <aside
          style={{
            flex: '1 1 300px',
            minWidth: 0,
            backgroundColor: '#f6f3ed',
            borderRadius: '28px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <h2 style={{ ...sectionTitle, marginBottom: 0 }}>{t('artScene.information')}</h2>
          <InfoRow label={t('artScene.artist')} value={artist} />
          <InfoRow label={t('artScene.type')} value={typeLabel} />
          <InfoRow label={t('artScene.location')} value={location} />
          <InfoRow label={t('artScene.dates')} value={dates} />
          <InfoRow label={t('artScene.openingHours')} value={pickText(exhibition.opening_hours, exhibition.opening_hours_mk, language)} />
          <InfoRow label={t('artScene.admission')} value={pickText(exhibition.admission, exhibition.admission_mk, language)} />
          <InfoRow label={t('artScene.organizer')} value={organizer} />
          {exhibition.official_url && (
            <a
              href={exhibition.official_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: '6px',
                backgroundColor: '#0A0A0A',
                color: '#FFFFFF',
                textDecoration: 'none',
                textAlign: 'center',
                padding: '15px 20px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              {t('artScene.official')} →
            </a>
          )}
          <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#666666' }}>{t('artScene.disclaimer')}</p>
        </aside>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section style={{ maxWidth: '1180px', margin: '0 auto', ...pagePadding, paddingBottom: 'clamp(64px, 8vw, 96px)' }}>
          <h2 style={sectionTitle}>
            {related.every((ex) => ex.city === exhibition.city) && exhibition.city !== 'other'
              ? `${t('artScene.moreIn')} ${cityForPhrase(exhibition.city, language)}`
              : t('artScene.moreExhibitions')}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
              gap: isMobile ? '32px' : '28px',
            }}
          >
            {related.map((ex) => (
              <RelatedCard key={ex.id} ex={ex} language={language} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
