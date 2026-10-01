/**
 * Generates public/sitemap.xml from static routes plus published products,
 * active collections and published blog posts fetched from Supabase.
 *
 * Runs automatically before `npm run build` (see the "prebuild" script).
 * If Supabase is unreachable (or env vars are missing) the existing
 * public/sitemap.xml is kept as-is, so a short outage during a deploy never
 * drops every artwork from the sitemap.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE_URL = 'https://dysnomiagallery.com';

// Load env vars from .env / .env.local when not already provided (local builds).
for (const file of ['.env', '.env.local']) {
  try {
    const content = readFileSync(join(ROOT, file), 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/i);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  } catch {
    // file missing — fine
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/shop', priority: '0.9', changefreq: 'daily' },
  { path: '/collections', priority: '0.8', changefreq: 'weekly' },
  { path: '/new-arrivals', priority: '0.8', changefreq: 'daily' },
  { path: '/top-sellers', priority: '0.8', changefreq: 'weekly' },
  { path: '/kids-pictures', priority: '0.7', changefreq: 'weekly' },
  { path: '/blog', priority: '0.6', changefreq: 'weekly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/shipping', priority: '0.5', changefreq: 'monthly' },
  { path: '/faq', priority: '0.4', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

const PAGE_SIZE = 1000; // PostgREST max rows per request

async function fetchRows(table, query) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${query}&order=slug&limit=${PAGE_SIZE}&offset=${offset}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) throw new Error(`${table}: HTTP ${res.status}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function urlEntry({ path, lastmod, priority, changefreq }) {
  const loc = escapeXml(`${SITE_URL}${path}`);
  const mkLoc = escapeXml(`${SITE_URL}${path}${path.includes('?') ? '&' : '?'}lang=mk`);
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${loc}"/>`,
    `    <xhtml:link rel="alternate" hreflang="mk" href="${mkLoc}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

async function main() {
  const entries = STATIC_ROUTES.map((route) => urlEntry(route));

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('sitemap: Supabase env vars missing — keeping the existing public/sitemap.xml');
    return;
  }

  try {
    const [products, collections, posts] = await Promise.all([
      fetchRows('products', 'select=slug,updated_at&status=in.(published,sold)'),
      fetchRows('collections', 'select=slug,updated_at&is_active=eq.true'),
      fetchRows('blog_posts', 'select=slug,updated_at&is_published=eq.true'),
    ]);

    for (const p of products) {
      entries.push(
        urlEntry({ path: `/artwork/${p.slug}`, lastmod: p.updated_at, priority: '0.8', changefreq: 'weekly' })
      );
    }
    for (const c of collections) {
      entries.push(
        urlEntry({ path: `/collections/${c.slug}`, lastmod: c.updated_at, priority: '0.7', changefreq: 'weekly' })
      );
    }
    for (const b of posts) {
      entries.push(
        urlEntry({ path: `/blog/${b.slug}`, lastmod: b.updated_at, priority: '0.6', changefreq: 'monthly' })
      );
    }

    console.log(
      `sitemap: ${STATIC_ROUTES.length} static, ${products.length} products, ${collections.length} collections, ${posts.length} blog posts`
    );
  } catch (err) {
    console.warn(`sitemap: Supabase fetch failed (${err.message}) — keeping the existing public/sitemap.xml`);
    return;
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  writeFileSync(join(ROOT, 'public', 'sitemap.xml'), xml);
  console.log(`sitemap: wrote public/sitemap.xml (${entries.length} URLs)`);
}

main();
