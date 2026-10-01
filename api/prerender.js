/**
 * Serves index.html with page-specific meta tags and JSON-LD injected for
 * crawlers and social scrapers, which never execute the SPA's JavaScript.
 *
 * Routed via vercel.json: bot user-agents requesting /artwork/:slug,
 * /collections/:slug or /blog/:slug land here; regular visitors keep getting
 * the plain SPA rewrite.
 */
const SITE_URL = 'https://dysnomiagallery.com';
const SITE_NAME = 'Dysnomia Art Gallery';

// Must match src/config/printOptions.ts — scripts/check-site.mjs fails the build if not.
export const PRICE_RANGE_MKD = { low: 749, high: 7039, count: 15 };

class UpstreamError extends Error {}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function truncate(text, max = 160) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

// Returns the row, null when the query succeeded with no rows, and throws
// UpstreamError when Supabase could not answer — so an outage is never
// reported to Google as 404 + noindex.
async function fetchRow(table, query) {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!base || !key) throw new UpstreamError('Supabase env missing');
  let res;
  try {
    res = await fetch(`${base}/rest/v1/${table}?${query}&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    throw new UpstreamError(String(err));
  }
  if (!res.ok) throw new UpstreamError(`${table}: ${res.status}`);
  const rows = await res.json();
  return rows[0] ?? null;
}

const pick = (en, mk, lang) => (lang === 'mk' && mk ? mk : en);

async function findRedirect(type, slug) {
  const entity = { artwork: 'product', collection: 'collection', blog: 'blog' }[type];
  if (!entity) return null;
  try {
    const row = await fetchRow(
      'slug_redirects',
      `select=new_slug&entity=eq.${entity}&old_slug=eq.${encodeURIComponent(slug)}`
    );
    return row?.new_slug || null;
  } catch {
    return null; // table may not exist yet
  }
}

async function buildMeta(type, slug, lang) {
  if (type === 'artwork') {
    const product = await fetchRow(
      'products',
      `select=title,title_mk,description,description_mk,slug,status,image_url,image_url_canvas,image_url_framed&slug=eq.${encodeURIComponent(slug)}&status=in.(published,sold)`
    );
    if (!product) return null;
    const images = [product.image_url, product.image_url_canvas, product.image_url_framed].filter(Boolean);
    const name = pick(product.title, product.title_mk, lang);
    const description =
      pick(product.description, product.description_mk, lang) ||
      `${product.title} — canvas print available as stretched canvas, rolled canvas or framed print, in sizes from 50×70 to 100×150 cm.`;
    return {
      title: `${name} | ${SITE_NAME}`,
      description: truncate(description),
      image: images[0] || `${SITE_URL}/og-image.jpg`,
      url: `${SITE_URL}/artwork/${product.slug}`,
      ogType: 'product',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${SITE_URL}/artwork/${product.slug}#product`,
        name,
        description,
        image: images,
        brand: { '@type': 'Brand', name: 'Dysnomia' },
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: PRICE_RANGE_MKD.low,
          highPrice: PRICE_RANGE_MKD.high,
          offerCount: PRICE_RANGE_MKD.count,
          priceCurrency: 'MKD',
          availability:
            product.status === 'sold' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          url: `${SITE_URL}/artwork/${product.slug}`,
        },
      },
    };
  }

  if (type === 'collection') {
    const collection = await fetchRow(
      'collections',
      `select=*&slug=eq.${encodeURIComponent(slug)}&is_active=eq.true`
    );
    if (!collection) return null;
    const colTitle = pick(collection.title, collection.title_mk, lang);
    return {
      title: `${colTitle} | ${SITE_NAME}`,
      description: truncate(
        pick(collection.description, collection.description_mk, lang) || `Explore the ${colTitle} collection at ${SITE_NAME}.`
      ),
      image: collection.cover_image || collection.cover_image_url || `${SITE_URL}/og-image.jpg`,
      url: `${SITE_URL}/collections/${collection.slug}`,
      ogType: 'website',
    };
  }

  if (type === 'blog') {
    const post = await fetchRow(
      'blog_posts',
      `select=title,title_mk,excerpt,excerpt_mk,content,content_mk,slug,cover_image,author,published_at,updated_at&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true`
    );
    if (!post) return null;
    const postTitle = pick(post.title, post.title_mk, lang);
    const description = truncate(
      pick(post.excerpt, post.excerpt_mk, lang) || pick(post.content, post.content_mk, lang) || postTitle
    );
    return {
      title: `${postTitle} | ${SITE_NAME}`,
      description,
      image: post.cover_image || `${SITE_URL}/og-image.jpg`,
      url: `${SITE_URL}/blog/${post.slug}`,
      ogType: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: postTitle,
        description,
        ...(post.cover_image && { image: [post.cover_image] }),
        author: { '@type': 'Person', name: post.author },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        ...(post.published_at && { datePublished: post.published_at }),
        ...(post.updated_at && { dateModified: post.updated_at }),
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
      },
    };
  }

  return null;
}

function injectMeta(html, meta, lang) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = escapeHtml(meta.image);
  const url = escapeHtml(meta.url);
  // Each language version is its own canonical so hreflang alternates are honoured
  const canonical = lang === 'mk' ? `${url}?lang=mk` : url;

  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`
    )
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(
      /<link rel="alternate" hreflang="en" href="[^"]*"\s*\/?>/,
      `<link rel="alternate" hreflang="en" href="${url}" />`
    )
    .replace(
      /<link rel="alternate" hreflang="mk" href="[^"]*"\s*\/?>/,
      `<link rel="alternate" hreflang="mk" href="${url}?lang=mk" />`
    )
    .replace(
      /<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/,
      `<link rel="alternate" hreflang="x-default" href="${url}" />`
    )
    .replace(/<meta property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${meta.ogType}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${description}" />`
    )
    .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta property="og:image:width" content="[^"]*"\s*\/?>\n?\s*/, '')
    .replace(/<meta property="og:image:height" content="[^"]*"\s*\/?>\n?\s*/, '')
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${description}" />`
    )
    .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`);

  if (meta.jsonLd) {
    // Escape characters that could break out of the <script> element while
    // keeping the payload valid JSON.
    const json = JSON.stringify(meta.jsonLd)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
    out = out.replace('</head>', `<script type="application/ld+json">${json}</script>\n</head>`);
  }

  return out;
}

export default async function handler(req, res) {
  const { type, slug } = req.query;
  const lang = req.query.lang === 'mk' ? 'mk' : 'en';
  // Fetch the SPA shell from the canonical origin, never from request headers
  // (a spoofed Host/X-Forwarded-Host would let attackers serve and edge-cache
  // arbitrary HTML under our URLs).
  const indexUrl = `${SITE_URL}/index.html`;

  let html = '';
  try {
    const indexRes = await fetch(indexUrl);
    if (!indexRes.ok) throw new Error(`index.html: ${indexRes.status}`);
    html = await indexRes.text();
  } catch {
    res.statusCode = 500;
    res.end('Internal error');
    return;
  }

  try {
    const meta = type && slug ? await buildMeta(type, slug, lang) : null;
    if (meta) {
      html = injectMeta(html, meta, lang);
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    } else {
      // Renamed slug — permanent redirect keeps links and rankings
      const newSlug = type && slug ? await findRedirect(type, slug) : null;
      if (newSlug) {
        const base = { artwork: '/artwork/', collection: '/collections/', blog: '/blog/' }[type];
        res.statusCode = 301;
        res.setHeader('Location', `${base}${encodeURIComponent(newSlug)}${lang === 'mk' ? '?lang=mk' : ''}`);
        res.setHeader('Cache-Control', 's-maxage=3600');
        res.end();
        return;
      }
      // Unknown slug — serve the SPA shell marked as not indexable.
      html = html.replace(
        /<meta name="robots" content="[^"]*"\s*\/?>/,
        '<meta name="robots" content="noindex, nofollow" />'
      );
      res.statusCode = 404;
    }
  } catch {
    // Supabase unavailable: serve the untouched shell with 200 and a short
    // cache — never 404/noindex for a page that may well exist.
    res.statusCode = 200;
    res.setHeader('Cache-Control', 's-maxage=60');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html);
}
