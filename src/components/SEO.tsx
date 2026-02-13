import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  price?: number;
  currency?: string;
}

const DEFAULT_TITLE = 'Dysnomia Art Gallery';
const DEFAULT_DESCRIPTION = 'Discover unique artworks and decorative pieces at Dysnomia Art Gallery. Each piece is crafted with care, style, and sustainability in mind.';
const DEFAULT_IMAGE = '/logo.webp';
const SITE_NAME = 'Dysnomia Art Gallery';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  price,
  currency = 'EUR',
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const imageUrl = image.startsWith('http') ? image : `${typeof window !== 'undefined' ? window.location.origin : ''}${image}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to set or create meta tags
    const setMetaTag = (property: string, content: string, isName = false) => {
      const attr = isName ? 'name' : 'property';
      let meta = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Standard meta tags
    setMetaTag('description', description, true);

    // Open Graph tags
    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', description);
    setMetaTag('og:image', imageUrl);
    setMetaTag('og:url', currentUrl);
    setMetaTag('og:type', type);
    setMetaTag('og:site_name', SITE_NAME);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', fullTitle, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', imageUrl, true);

    // Product-specific tags
    if (type === 'product' && price !== undefined) {
      setMetaTag('product:price:amount', price.toString());
      setMetaTag('product:price:currency', currency);
    }

    // Cleanup on unmount - restore defaults
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [fullTitle, description, imageUrl, currentUrl, type, price, currency]);

  return null;
}

// JSON-LD structured data component for products
export function ProductStructuredData({
  name,
  description,
  image,
  price,
  currency = 'EUR',
  availability = 'InStock',
  sku,
  url,
}: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  url?: string;
}) {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image,
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        url: url || (typeof window !== 'undefined' ? window.location.href : ''),
      },
      ...(sku && { sku }),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    script.id = 'product-structured-data';

    // Remove existing script if any
    const existing = document.getElementById('product-structured-data');
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('product-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [name, description, image, price, currency, availability, sku, url]);

  return null;
}
