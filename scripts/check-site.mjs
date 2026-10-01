/**
 * Pre-deploy smoke checks. Runs automatically before `npm run build`
 * (see the "prebuild" script), so every new version on Vercel is verified.
 *
 * 1. Kids Pictures — the kids collection must be readable with the public
 *    (anon) key and contain at least one published artwork. This page has
 *    regressed twice because the collection slug changed in the admin.
 * 2. Social links — the old, deleted Instagram handle must not reappear.
 *
 * A failed check stops the build so a broken version never goes live.
 * If Supabase is unreachable (network/outage) the content check only warns.
 * Set SKIP_SITE_CHECKS=1 to bypass in an emergency.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

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

if (process.env.SKIP_SITE_CHECKS === '1') {
  console.warn('[check-site] SKIP_SITE_CHECKS=1 — checks skipped.');
  process.exit(0);
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Keep in sync with src/lib/kidsCollection.ts
const KIDS_COLLECTION_SLUGS = ['kids', 'kid', 'kids-pictures', 'kids-room', 'kids-posters', 'kids-collection', 'detski-sliki'];
const KIDS_TITLE_PATTERN = /\bkids?\b|детск|за деца/i;

// Deleted/renamed profiles that must never be linked again
const FORBIDDEN_SOCIAL = ['dysnomia_art.gallery666', 'dysnomiaartgallery'];

const failures = [];

async function getJson(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path.split('?')[0]}`);
  return res.json();
}

async function checkKidsCollection() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[check-site] Supabase env vars missing — kids collection check skipped (local build).');
    return;
  }

  let collections;
  try {
    collections = await getJson('collections?select=id,slug,title,title_mk');
  } catch (err) {
    console.warn(`[check-site] Supabase unreachable, kids check skipped: ${err.message}`);
    return;
  }

  const kids =
    KIDS_COLLECTION_SLUGS.map((slug) => collections.find((c) => c.slug?.toLowerCase() === slug)).find(Boolean) ||
    collections.find((c) => KIDS_TITLE_PATTERN.test(c.title || '') || KIDS_TITLE_PATTERN.test(c.title_mk || ''));

  if (!kids) {
    failures.push(
      'Kids Pictures: no public kids collection found. Check that a collection with slug "kids" exists and that ' +
        'migration 009 is applied (it keeps the kids collection readable even when hidden from /collections).'
    );
    return;
  }

  const rows = await getJson(
    `collection_products?select=product:products(id,status)&collection_id=eq.${encodeURIComponent(kids.id)}`
  );
  const visible = rows.filter((r) => r.product && ['published', 'sold'].includes(r.product.status));
  if (visible.length === 0) {
    failures.push(`Kids Pictures: collection "${kids.slug}" has no published artworks — the page would be empty.`);
    return;
  }
  console.log(`[check-site] Kids Pictures OK — "${kids.slug}" has ${visible.length} published artworks.`);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?|mjs|html)$/.test(name)) out.push(full);
  }
  return out;
}

function checkSocialLinks() {
  const files = [...walk(join(ROOT, 'src')), ...walk(join(ROOT, 'api')), join(ROOT, 'index.html')];
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const handle of FORBIDDEN_SOCIAL) {
      if (content.includes(handle)) {
        failures.push(`Social links: old Instagram handle "${handle}" found in ${relative(ROOT, file)}.`);
      }
    }
  }
  console.log('[check-site] Social links checked.');
}

/** Parse priceMatrix from src/config/printOptions.ts → { canvas: { '50x70': 1299, ... }, ... } */
function readPriceMatrix() {
  const src = readFileSync(join(ROOT, 'src', 'config', 'printOptions.ts'), 'utf8');
  const start = src.indexOf('export const priceMatrix');
  const block = src.slice(start, src.indexOf('};', start));
  const matrix = {};
  for (const m of block.matchAll(/(canvas|roll|framed)\s*:\s*\{([^}]*)\}/g)) {
    matrix[m[1]] = {};
    for (const p of m[2].matchAll(/'([0-9x]+)'\s*:\s*(\d+)/g)) matrix[m[1]][p[1]] = Number(p[2]);
  }
  return matrix;
}

/**
 * Prices: the site shows priceMatrix, but orders are charged from the
 * print_prices table. A mismatch means customers pay a different price than
 * the one they saw. The prerender price range must also match.
 */
async function checkPrices() {
  const matrix = readPriceMatrix();
  const all = Object.values(matrix).flatMap((sizes) => Object.values(sizes));
  if (all.length === 0) {
    failures.push('Prices: could not read priceMatrix from src/config/printOptions.ts.');
    return;
  }

  const prerender = readFileSync(join(ROOT, 'api', 'prerender.js'), 'utf8');
  const range = prerender.match(/PRICE_RANGE_MKD = \{ low: (\d+), high: (\d+), count: (\d+) \}/);
  const expected = [Math.min(...all), Math.max(...all), all.length];
  if (!range || range.slice(1).map(Number).join() !== expected.join()) {
    failures.push(`Prices: PRICE_RANGE_MKD in api/prerender.js must be { low: ${expected[0]}, high: ${expected[1]}, count: ${expected[2]} }.`);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  let rows;
  try {
    rows = await getJson('print_prices?select=print_type,size_id,price_mkd');
  } catch (err) {
    console.warn(`[check-site] print_prices not readable, price check skipped: ${err.message}`);
    return;
  }
  const mismatches = [];
  for (const [type, sizes] of Object.entries(matrix)) {
    for (const [size, price] of Object.entries(sizes)) {
      const row = rows.find((r) => r.print_type === type && r.size_id === size);
      if (!row) mismatches.push(`${type} ${size}: missing in DB (site ${price})`);
      else if (Number(row.price_mkd) !== price) mismatches.push(`${type} ${size}: DB ${row.price_mkd} ≠ site ${price}`);
    }
  }
  if (mismatches.length > 0) {
    failures.push(
      `Prices: the database charges different prices than the site shows (${mismatches.slice(0, 4).join('; ')}${mismatches.length > 4 ? '; …' : ''}). Apply migration 010 or update print_prices.`
    );
  } else {
    console.log('[check-site] Prices OK — database matches the site.');
  }
}

/**
 * The code depends on migrations 009 + 010 (supabase/release/2026-10-release.sql):
 * e.g. checkout calls create_validated_order with p_language. Deploying the code
 * before the database would break checkout, so stop the build until the release
 * SQL is applied. public.slug_redirects (publicly readable) is the marker.
 */
async function checkDatabaseRelease() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/slug_redirects?select=entity&limit=1`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (res.status === 404 || res.status === 400) {
    failures.push(
      'Database: release SQL not applied yet. Run supabase/release/2026-10-release.sql in Supabase before deploying this code.'
    );
    return;
  }
  if (!res.ok) throw new Error(`slug_redirects: ${res.status}`);
  console.log('[check-site] Database release OK — migrations 009/010 are applied.');
}

checkSocialLinks();
for (const check of [checkDatabaseRelease, checkKidsCollection, checkPrices]) {
  try {
    await check();
  } catch (err) {
    console.warn(`[check-site] ${check.name} could not complete: ${err.message}`);
  }
}

if (failures.length > 0) {
  console.error('\n[check-site] FAILED — build stopped so the broken version does not go live:');
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error('\nFix the data/code above, or set SKIP_SITE_CHECKS=1 to bypass in an emergency.\n');
  process.exit(1);
}
console.log('[check-site] All checks passed.');
