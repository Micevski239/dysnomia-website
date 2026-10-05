import { useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { priceMatrix } from '../config/printOptions';

export const SITE_URL = 'https://dysnomiagallery.com';
const SITE_NAME = 'Dysnomia Art Gallery';
const DEFAULT_TITLE = 'Dysnomia Art Gallery — Canvas Prints & Framed Wall Art';
const DEFAULT_DESCRIPTION =
  'Discover unique canvas prints, rolled canvas and framed wall art at Dysnomia Art Gallery. Sizes from 50×70 to 100×150 cm with fast delivery across Macedonia.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  /** Canonical path (e.g. "/artwork/my-piece"). Defaults to the current pathname. */
  path?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

function setMetaTag(key: string, content: string, isName = false) {
  const attr = isName ? 'name' : 'property';
  let meta = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function setLinkTag(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let link = document.querySelector(selector) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    if (hreflang) link.hreflang = hreflang;
    link.setAttribute('data-seo-managed', 'true');
    document.head.appendChild(link);
  }
  link.href = href;
}

function removeManagedLinks() {
  document.querySelectorAll('link[data-seo-managed="true"]').forEach((el) => el.remove());
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  path,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const { language } = useLanguage();

  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonicalPath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  // English lives at the bare URL, Macedonian at ?lang=mk (LanguageContext reads
  // that param on load). Each language version is canonical to itself so the
  // hreflang alternates below are reciprocal and valid.
  const enUrl = `${SITE_URL}${canonicalPath}`;
  const mkUrl = `${enUrl}${enUrl.includes('?') ? '&' : '?'}lang=mk`;
  const canonicalUrl = language === 'mk' ? mkUrl : enUrl;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  useEffect(() => {
    document.title = fullTitle;

    setMetaTag('description', description, true);
    setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow', true);

    // Canonical + language alternates
    setLinkTag('canonical', canonicalUrl);
    if (noindex) {
      document
        .querySelectorAll('link[rel="alternate"][data-seo-managed="true"]')
        .forEach((el) => el.remove());
    } else {
      setLinkTag('alternate', enUrl, 'en');
      setLinkTag('alternate', mkUrl, 'mk');
      setLinkTag('alternate', enUrl, 'x-default');
    }

    // Open Graph tags
    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', description);
    setMetaTag('og:image', imageUrl);
    setMetaTag('og:url', canonicalUrl);
    setMetaTag('og:type', type);
    setMetaTag('og:site_name', SITE_NAME);
    setMetaTag('og:locale', language === 'mk' ? 'mk_MK' : 'en_US');
    setMetaTag('og:locale:alternate', language === 'mk' ? 'en_US' : 'mk_MK');

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', fullTitle, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', imageUrl, true);

    return () => {
      document.title = DEFAULT_TITLE;
      removeManagedLinks();
    };
  }, [fullTitle, description, imageUrl, canonicalUrl, enUrl, mkUrl, type, noindex, language]);

  return null;
}

/** Injects a JSON-LD script tag into <head>, replacing any previous one with the same id. */
function useJsonLd(id: string, data: object) {
  useEffect(() => {
    document.getElementById(id)?.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.getElementById(id)?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, JSON.stringify(data)]);
}

const allPrices = Object.values(priceMatrix).flatMap((sizes) => Object.values(sizes));
const LOW_PRICE_MKD = Math.min(...allPrices);
const HIGH_PRICE_MKD = Math.max(...allPrices);
const OFFER_COUNT = allPrices.length;

// JSON-LD structured data for products. Prices come from the print type × size
// matrix, so offers are expressed as an AggregateOffer range in MKD.
export function ProductStructuredData({
  name,
  description,
  image,
  slug,
  status,
}: {
  name: string;
  description: string;
  image: string | string[];
  slug: string;
  status?: string;
}) {
  useJsonLd('product-structured-data', {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: Array.isArray(image) ? image : [image],
    brand: { '@type': 'Brand', name: 'Dysnomia' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: LOW_PRICE_MKD,
      highPrice: HIGH_PRICE_MKD,
      offerCount: OFFER_COUNT,
      priceCurrency: 'MKD',
      availability:
        status === 'sold' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `${SITE_URL}/artwork/${slug}`,
    },
  });

  return null;
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  useJsonLd('breadcrumb-structured-data', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  });

  return null;
}

/** schema.org ExhibitionEvent for one АРТ Сцена page. */
export function ExhibitionStructuredData({
  name,
  description,
  image,
  artist,
  startDate,
  endDate,
  venue,
  city,
  organizer,
  officialUrl,
  slug,
}: {
  name: string;
  description: string;
  image?: string | null;
  artist: string;
  startDate: string;
  endDate?: string | null;
  venue: string;
  city: string;
  organizer?: string | null;
  officialUrl?: string | null;
  slug: string;
}) {
  useJsonLd('exhibition-structured-data', {
    '@context': 'https://schema.org',
    '@type': 'ExhibitionEvent',
    name,
    description,
    ...(image && { image: [image] }),
    startDate,
    ...(endDate && { endDate }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: venue,
      address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: 'MK' },
    },
    performer: { '@type': 'Person', name: artist },
    ...(organizer && {
      organizer: { '@type': 'Organization', name: organizer, ...(officialUrl && { url: officialUrl }) },
    }),
    url: `${SITE_URL}/art-scena/${slug}`,
  });

  return null;
}

/** schema.org CollectionPage + ItemList for the /art-scena listing. */
export function ExhibitionListStructuredData({
  name,
  description,
  items,
}: {
  name: string;
  description: string;
  items: { name: string; slug: string }[];
}) {
  useJsonLd('exhibition-list-structured-data', {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${SITE_URL}/art-scena`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: `${SITE_URL}/art-scena/${item.slug}`,
      })),
    },
  });

  return null;
}

export function ArticleStructuredData({
  headline,
  description,
  image,
  author,
  datePublished,
  dateModified,
  slug,
}: {
  headline: string;
  description: string;
  image?: string | null;
  author: string;
  datePublished?: string | null;
  dateModified?: string;
  slug: string;
}) {
  useJsonLd('article-structured-data', {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description,
    ...(image && { image: [image] }),
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
  });

  return null;
}
