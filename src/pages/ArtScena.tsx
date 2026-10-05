import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useExhibitions } from '../hooks/useExhibitions';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLanguage } from '../hooks/useLanguage';
import { ExhibitionListStructuredData } from '../components/SEO';
import {
  ART_SCENE_PATH,
  EXHIBITION_CITIES,
  cityName,
  exhibitionStatus,
  formatDateRange,
  pickText,
  todayInSkopje,
  type ExhibitionStatus,
} from '../config/artScene';
import { getThumbnailUrl } from '../lib/utils';
import type { Exhibition, ExhibitionCity } from '../types';

type StatusFilter = 'all' | ExhibitionStatus;
type TypeFilter = 'all' | 'solo' | 'group';

const PAST_PREVIEW = 6;

const STATUS_KEYS: Record<ExhibitionStatus, string> = {
  current: 'artScene.statusCurrent',
  upcoming: 'artScene.statusUpcoming',
  ended: 'artScene.statusEnded',
};

function StatusBadge({ status, t }: { status: ExhibitionStatus; t: (key: string) => string }) {
  const styles: Record<ExhibitionStatus, React.CSSProperties> = {
    current: { backgroundColor: '#FBBE63', color: '#0A0A0A', border: '1px solid #FBBE63' },
    upcoming: { backgroundColor: '#FFFFFF', color: '#0A0A0A', border: '1px solid #0A0A0A' },
    ended: { backgroundColor: '#F2F2F2', color: '#666666', border: '1px solid #F2F2F2' },
  };
  return (
    <span
      style={{
        alignSelf: 'flex-start',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: '999px',
        ...styles[status],
      }}
    >
      {t(STATUS_KEYS[status])}
    </span>
  );
}

function ExhibitionCard({
  exhibition,
  status,
  language,
  t,
}: {
  exhibition: Exhibition;
  status: ExhibitionStatus;
  language: string;
  t: (key: string) => string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const title = pickText(exhibition.title, exhibition.title_mk, language);
  const artist = pickText(exhibition.artist, exhibition.artist_mk, language);
  const venue = pickText(exhibition.venue, exhibition.venue_mk, language);
  const alt = pickText(exhibition.cover_alt, exhibition.cover_alt_mk, language) || `${artist} – ${title}`;
  const href = `${ART_SCENE_PATH}/${exhibition.slug}`;

  return (
    <Link
      to={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', gap: '14px', textDecoration: 'none', color: '#0A0A0A' }}
    >
      <div
        style={{
          aspectRatio: '4 / 3',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#f6f3ed',
          opacity: status === 'ended' ? 0.85 : 1,
        }}
      >
        {exhibition.cover_image ? (
          <img
            src={getThumbnailUrl(exhibition.cover_image) || exhibition.cover_image}
            onError={(e) => {
              if (exhibition.cover_image && e.currentTarget.src !== exhibition.cover_image) {
                e.currentTarget.src = exhibition.cover_image;
              }
            }}
            alt={alt}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#b9ae98', padding: '24px', textAlign: 'center' }}>
              {title}
            </span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <StatusBadge status={status} t={t} />
        <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#666666' }}>
          {artist}
        </span>
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '24px',
            lineHeight: 1.2,
            color: isHovered ? '#8a6a1f' : '#0A0A0A',
            transition: 'color 0.2s',
          }}
        >
          {language === 'mk' ? `„${title}“` : `“${title}”`}
        </span>
        <span style={{ fontSize: '14px', color: '#444444' }}>
          {venue}, {cityName(exhibition.city, language)}
        </span>
        <span style={{ fontSize: '14px', color: '#444444' }}>
          {formatDateRange(exhibition.start_date, exhibition.end_date, language)} ·{' '}
          {t(exhibition.exhibition_type === 'solo' ? 'artScene.typeSolo' : 'artScene.typeGroup')}
        </span>
        <span
          style={{
            alignSelf: 'flex-start',
            marginTop: '4px',
            fontSize: '13px',
            fontWeight: 600,
            borderBottom: '2px solid #FBBE63',
            paddingBottom: '2px',
          }}
        >
          {t('artScene.moreInfo')} →
        </span>
      </div>
    </Link>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        minHeight: '44px',
        padding: '10px 18px',
        borderRadius: '999px',
        border: `1px solid ${active ? '#0A0A0A' : '#E5E1D8'}`,
        backgroundColor: active ? '#0A0A0A' : '#FFFFFF',
        color: active ? '#FFFFFF' : '#0A0A0A',
        fontSize: '14px',
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

export default function ArtScena() {
  const { exhibitions, loading } = useExhibitions();
  const { isMobile, isMobileOrTablet } = useBreakpoint();
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get('status');
  const status: StatusFilter = statusParam === 'current' || statusParam === 'upcoming' || statusParam === 'ended' ? statusParam : 'all';
  const cityParam = searchParams.get('city');
  const city = EXHIBITION_CITIES.some((c) => c.id === cityParam) ? (cityParam as ExhibitionCity) : null;
  const typeParam = searchParams.get('type');
  const type: TypeFilter = typeParam === 'solo' || typeParam === 'group' ? typeParam : 'all';

  const setFilter = (key: 'status' | 'city' | 'type', value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const today = todayInSkopje();
  const withStatus = useMemo(
    () => exhibitions.map((ex) => ({ ex, status: exhibitionStatus(ex, today) })),
    [exhibitions, today]
  );

  // Only offer cities that have at least one exhibition
  const cities = useMemo(
    () => EXHIBITION_CITIES.filter((c) => exhibitions.some((ex) => ex.city === c.id)),
    [exhibitions]
  );

  const filtered = withStatus.filter(
    ({ ex, status: s }) =>
      (status === 'all' || s === status) && (!city || ex.city === city) && (type === 'all' || ex.exhibition_type === type)
  );

  // Current: ending soonest first; upcoming: opening soonest first; past: most recent first
  const byEnd = (a: Exhibition, b: Exhibition) => (a.end_date || '9999').localeCompare(b.end_date || '9999');
  const byStart = (a: Exhibition, b: Exhibition) => a.start_date.localeCompare(b.start_date);
  const current = filtered.filter((i) => i.status === 'current').sort((a, b) => byEnd(a.ex, b.ex));
  const upcoming = filtered.filter((i) => i.status === 'upcoming').sort((a, b) => byStart(a.ex, b.ex));
  const ended = filtered.filter((i) => i.status === 'ended').sort((a, b) => byEnd(b.ex, a.ex));

  const sections: { key: ExhibitionStatus; label: string; items: typeof filtered }[] = [
    { key: 'current', label: t('artScene.sectionCurrent'), items: current },
    { key: 'upcoming', label: t('artScene.sectionUpcoming'), items: upcoming },
    {
      key: 'ended',
      label: t('artScene.sectionEnded'),
      items: status === 'ended' ? ended : ended.slice(0, PAST_PREVIEW),
    },
  ];

  const listItems = [...current, ...upcoming].map(({ ex }) => ({
    name: `${pickText(ex.artist, ex.artist_mk, language)} – ${pickText(ex.title, ex.title_mk, language)}`,
    slug: ex.slug,
  }));

  const gutter = 'clamp(16px, 4vw, 48px)';
  const grid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: isMobile ? '40px' : '40px 32px',
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#0A0A0A',
    marginBottom: '24px',
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobileOrTablet ? '100px' : '120px' }}>
      <ExhibitionListStructuredData
        name={t('artScene.title')}
        description={t('artScene.intro')}
        items={listItems}
      />

      {/* Intro */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: `clamp(24px, 5vw, 56px) ${gutter} 32px` }}>
        <p style={{ fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', color: '#8a6a1f', fontWeight: 600, marginBottom: '16px' }}>
          {t('artScene.eyebrow')}
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(40px, 7vw, 64px)',
            fontWeight: 400,
            color: '#0A0A0A',
            lineHeight: 1.05,
            marginBottom: '18px',
          }}
        >
          {t('artScene.title')}
        </h1>
        <p style={{ fontSize: '17px', lineHeight: 1.7, color: '#666666', maxWidth: '680px' }}>{t('artScene.intro')}</p>
      </section>

      {/* Filters */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: `0 ${gutter} 16px`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all', 'current', 'upcoming', 'ended'] as StatusFilter[]).map((s) => (
            <Chip key={s} active={status === s} onClick={() => setFilter('status', s)}>
              {t(
                s === 'all'
                  ? 'artScene.filterAll'
                  : s === 'current'
                    ? 'artScene.filterCurrent'
                    : s === 'upcoming'
                      ? 'artScene.filterUpcoming'
                      : 'artScene.filterEnded'
              )}
            </Chip>
          ))}
        </div>
        {(cities.length > 1 || exhibitions.length > 0) && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Chip active={!city} onClick={() => setFilter('city', null)}>
              {t('artScene.allCities')}
            </Chip>
            {cities.map((c) => (
              <Chip key={c.id} active={city === c.id} onClick={() => setFilter('city', c.id)}>
                {language === 'mk' ? c.mk : c.en}
              </Chip>
            ))}
            <span style={{ width: '1px', backgroundColor: '#E5E1D8', margin: '6px 4px' }} />
            <Chip active={type === 'solo'} onClick={() => setFilter('type', type === 'solo' ? null : 'solo')}>
              {t('artScene.filterSolo')}
            </Chip>
            <Chip active={type === 'group'} onClick={() => setFilter('type', type === 'group' ? null : 'group')}>
              {t('artScene.filterGroup')}
            </Chip>
          </div>
        )}
      </section>

      {/* Exhibitions */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: `32px ${gutter} 16px` }}>
        {loading ? (
          <div style={grid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div style={{ aspectRatio: '4 / 3', borderRadius: '24px', backgroundColor: '#F5F5F5', marginBottom: '14px' }} />
                <div style={{ height: '14px', width: '40%', backgroundColor: '#F5F5F5', marginBottom: '10px' }} />
                <div style={{ height: '22px', width: '70%', backgroundColor: '#F5F5F5' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 20px', backgroundColor: '#FAFAFA', borderRadius: '32px' }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: '#0A0A0A', marginBottom: '16px' }}>
              {exhibitions.length === 0 ? t('artScene.emptyAll') : t('artScene.empty')}
            </p>
            {exhibitions.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
                style={{
                  minHeight: '44px',
                  padding: '10px 22px',
                  borderRadius: '999px',
                  border: '1px solid #0A0A0A',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {t('artScene.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(48px, 7vw, 72px)' }}>
            {sections
              .filter((s) => s.items.length > 0)
              .map((s) => (
                <div key={s.key}>
                  <h2 style={sectionTitle}>{s.label}</h2>
                  <div style={grid}>
                    {s.items.map(({ ex, status: itemStatus }) => (
                      <ExhibitionCard key={ex.id} exhibition={ex} status={itemStatus} language={language} t={t} />
                    ))}
                  </div>
                  {s.key === 'ended' && status !== 'ended' && ended.length > PAST_PREVIEW && (
                    <button
                      type="button"
                      onClick={() => setFilter('status', 'ended')}
                      style={{
                        marginTop: '28px',
                        minHeight: '44px',
                        padding: '10px 22px',
                        borderRadius: '999px',
                        border: '1px solid #0A0A0A',
                        backgroundColor: '#FFFFFF',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      {t('artScene.sectionEnded')} ({ended.length}) →
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Call to organisers */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: `clamp(40px, 6vw, 64px) ${gutter} 24px` }}>
        <div
          style={{
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            borderRadius: isMobile ? '28px' : '40px',
            padding: isMobile ? '32px 24px' : '56px',
            display: 'flex',
            gap: '32px',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, fontSize: 'clamp(26px, 4vw, 36px)', marginBottom: '12px' }}>
              {t('artScene.ctaTitle')}
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>{t('artScene.ctaText')}</p>
          </div>
          <Link
            to="/contact"
            style={{
              flexShrink: 0,
              textAlign: 'center',
              backgroundColor: '#FBBE63',
              color: '#0A0A0A',
              textDecoration: 'none',
              padding: '16px 30px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            {t('artScene.ctaButton')} →
          </Link>
        </div>
      </section>

      {/* About (SEO text) */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: `32px ${gutter} clamp(64px, 8vw, 96px)` }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, fontSize: '26px', color: '#0A0A0A', marginBottom: '12px' }}>
          {t('artScene.aboutTitle')}
        </h2>
        <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#555555', maxWidth: '860px' }}>{t('artScene.aboutText')}</p>
      </section>
    </div>
  );
}
