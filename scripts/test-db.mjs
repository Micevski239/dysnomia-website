/**
 * Runs every SQL file in the repo plus supabase/release/2026-10-release.sql on an
 * in-memory Postgres (PGlite) with a stub of the Supabase auth schema, then checks
 * the security rules (RLS, column privileges, admin RPCs, order validation).
 * Usage: npm run test:db
 */
import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const R = fileURLToPath(new URL('..', import.meta.url)).split(String.fromCharCode(92)).join('/');
const db = new PGlite({ extensions: { uuid_ossp, pgcrypto } });

const run = async (label, sql) => {
  try { await db.exec(sql); console.log('OK  ', label); }
  catch (e) { console.log('FAIL', label, '->', e.message); throw e; }
};
const expectFail = async (label, sql) => {
  try { await db.exec(sql); console.log('BAD ', label, '(should have failed)'); process.exitCode = 1; }
  catch (e) { console.log('OK  ', label, '-> blocked:', e.message.slice(0, 90)); }
  await db.exec('RESET ROLE;');
};
const q = async (sql) => (await db.query(sql)).rows;
const asRole = (role, sub, email) =>
  `SET ROLE ${role}; SELECT set_config('request.jwt.claims', '${JSON.stringify(sub ? { sub, email, role } : { role })}', false);`;
const reset = 'RESET ROLE;';

await run('prelude', `
  CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
  CREATE SCHEMA auth; CREATE SCHEMA storage;
  CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub','')::uuid $$;
  CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
  CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT coalesce(current_setting('request.jwt.claims', true)::json->>'role','anon') $$;
  CREATE TABLE storage.objects (id uuid, bucket_id text);
  GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;
`);

for (const f of [
  'supabase-schema.sql', 'supabase-collections.sql', '@products-extra',
  'supabase/migrations/001_ecommerce_schema.sql', 'supabase/migrations/002_add_tracking_number.sql',
  'supabase-featured.sql', 'supabase/migrations/003_security_hardening.sql', 'supabase/migrations/004_storage_and_rate_limits.sql',
  'supabase/migrations/005_lock_down_inserts.sql', 'supabase/migrations/006_fix_orders_select_policy.sql',
  'supabase/migrations/007_product_details.sql', 'supabase/migrations/008_page_views.sql',
]) await run(f, f === '@products-extra' ? 'ALTER TABLE products ADD COLUMN details text, ADD COLUMN details_mk text;' : readFileSync(R + f, 'utf8'));

// Objects production has but the repo never created (made in the dashboard)
await run('dashboard-created objects', `
  ALTER TABLE products ADD COLUMN IF NOT EXISTS title_mk text, ADD COLUMN IF NOT EXISTS description_mk text,
    ADD COLUMN IF NOT EXISTS image_url_canvas text, ADD COLUMN IF NOT EXISTS image_url_roll text, ADD COLUMN IF NOT EXISTS image_url_framed text;
  ALTER TABLE collections ADD COLUMN IF NOT EXISTS title_mk text, ADD COLUMN IF NOT EXISTS description_mk text;
  CREATE TABLE blog_posts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text, title_mk text, slug text UNIQUE, excerpt text, excerpt_mk text,
    content text, content_mk text, cover_image text, author text DEFAULT 'Dysnomia', is_published boolean DEFAULT false, published_at timestamptz,
    created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
  ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY; CREATE POLICY "Anyone all" ON blog_posts FOR ALL USING (true);
  CREATE TABLE announcements (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), text text, is_active boolean DEFAULT true, sort_order int DEFAULT 0, created_at timestamptz DEFAULT now());
  ALTER TABLE announcements ENABLE ROW LEVEL SECURITY; CREATE POLICY "Authenticated all" ON announcements FOR ALL USING (auth.role() = 'authenticated');
`);

const release = readFileSync(R + 'supabase/release/2026-10-release.sql', 'utf8');
await run('RELEASE (1st run)', release);
await run('RELEASE (2nd run, idempotent)', release);

const campaigns = readFileSync(R + 'supabase/migrations/011_newsletter_campaigns.sql', 'utf8');
await run('011 newsletter campaigns (1st run)', campaigns);
await run('011 newsletter campaigns (2nd run, idempotent)', campaigns);

const ADMIN = '11111111-1111-1111-1111-111111111111';
const CUST = '22222222-2222-2222-2222-222222222222';
const P1 = 'aaaaaaaa-0000-0000-0000-000000000001';
const P2 = 'aaaaaaaa-0000-0000-0000-000000000002';
await run('seed', `
  INSERT INTO auth.users VALUES ('${ADMIN}','admin@x.mk',now(),'{}'), ('${CUST}','cust@x.mk',null,'{}');
  INSERT INTO user_roles VALUES ('${ADMIN}','admin');
  INSERT INTO products (id,title,slug,price,status,image_url) VALUES ('${P1}','Pub','pub',0,'published','https://img/p.webp'), ('${P2}','Draft','draft',0,'draft',null);
  INSERT INTO collections (id,title,slug,is_active) VALUES ('cccccccc-0000-0000-0000-000000000001','Kids','kids',false);
  INSERT INTO reviews (product_id,customer_name,customer_email,rating,is_approved) VALUES ('${P1}','Ana','ana@x.mk',5,true);
  INSERT INTO orders (order_number,customer_email,customer_name,shipping_address,items,subtotal,total_amount) VALUES ('O1','cust@x.mk','C','{}','[]',1,1);
  INSERT INTO blog_posts (title,slug,is_published) VALUES ('d','draft-post',false);
`);

console.log('\n--- functional checks ---');
await run('anon reads public review columns', asRole('anon') + 'SELECT id, customer_name, rating FROM reviews;' + reset);
await expectFail('anon reads reviewer e-mail', asRole('anon') + 'SELECT customer_email FROM reviews;');

await db.exec(asRole('authenticated', CUST, 'cust@x.mk'));
await db.exec(`UPDATE products SET title='hacked'`);
await db.exec(reset);
console.log('     product title after customer UPDATE attempt:', (await q(`SELECT title FROM products WHERE id='${P1}'`))[0].title, '(must be Pub)');

await db.exec(asRole('anon'));
console.log('     anon sees products:', (await q('SELECT slug FROM products ORDER BY slug')).map((r) => r.slug).join(','), '(draft must be hidden)');
console.log('     anon sees inactive kids collection:', (await q('SELECT slug FROM collections')).map((r) => r.slug).join(',') || '-');
console.log('     anon sees blog drafts:', (await q('SELECT count(*)::int c FROM blog_posts'))[0].c, '(must be 0)');
await db.exec(reset);
await expectFail('anon writes announcements', asRole('anon') + `INSERT INTO announcements (text) VALUES ('x');`);
await expectFail('customer writes announcements', asRole('authenticated', CUST, 'cust@x.mk') + `INSERT INTO announcements (text) VALUES ('x');`);

await db.exec(asRole('authenticated', CUST, 'cust@x.mk'));
console.log('     unconfirmed customer sees own orders:', (await q('SELECT count(*)::int c FROM orders'))[0].c, '(must be 0)');
await db.exec(reset);

await db.exec(asRole('authenticated', ADMIN, 'admin@x.mk'));
console.log('     admin sees orders:', (await q('SELECT count(*)::int c FROM orders'))[0].c);
console.log('     admin_list_reviews emails:', (await q('SELECT customer_email FROM admin_list_reviews()')).map((r) => r.customer_email).join(','));
await run('admin replace_bestsellers', `SELECT replace_bestsellers(ARRAY['${P1}']::uuid[]);`);
await run('admin set_product_collection', `SELECT set_product_collection('${P1}','cccccccc-0000-0000-0000-000000000001');`);
await run('admin renames slug', `UPDATE products SET slug='pub-new' WHERE id='${P1}';`);
await run('admin deletes order', `DELETE FROM orders WHERE order_number='O1';`);
console.log('     orders left:', (await q('SELECT count(*)::int c FROM orders'))[0].c, '(must be 0)');
await run('admin writes announcement', `INSERT INTO announcements (text) VALUES ('ok');`);
await db.exec(reset);
console.log('     slug_redirects:', JSON.stringify(await q('SELECT entity, old_slug, new_slug FROM slug_redirects')));

await expectFail('customer calls replace_bestsellers', asRole('authenticated', CUST, 'cust@x.mk') + 'SELECT replace_bestsellers(ARRAY[]::uuid[]);');
await expectFail('customer calls get_visitor_summary', asRole('authenticated', CUST, 'cust@x.mk') + 'SELECT get_visitor_summary(30);');
await expectFail('anon calls admin_list_reviews', asRole('anon') + 'SELECT * FROM admin_list_reviews();');

const item = (o) => JSON.stringify([{ productId: P1, productTitle: '<b>fake</b>', imageUrl: 'https://evil/x.png', printType: 'canvas', sizeId: '50x70', sizeLabel: '50 x 70', quantity: 2, ...o }]);
const order = (items, extra = '') =>
  `SELECT create_validated_order('buyer@x.mk','Buyer Name','070','{"address":"a","city":"Skopje","postalCode":"1000","country":"MK"}'::jsonb,'${items}'::jsonb, NULL ${extra});`;

await run('anon places valid order', asRole('anon') + order(item({})) + reset);
const saved = (await q(`SELECT items, total_amount, language FROM orders WHERE customer_email='buyer@x.mk'`))[0];
console.log('     stored title/image/total/lang:', saved.items[0].productTitle, saved.items[0].imageUrl, saved.total_amount, saved.language, '(expect Pub, https://img/p.webp, 2598, mk)');
await expectFail('negative quantity', asRole('anon') + order(item({ quantity: -3 })));
await expectFail('quantity 500', asRole('anon') + order(item({ quantity: 500 })));
await expectFail('empty order', asRole('anon') + order('[]'));
await expectFail('draft product', asRole('anon') + order(item({ productId: P2 })));
await run('order with p_language=en', asRole('anon') + order(item({}), ", 'en'") + reset);
await run('old 6-arg call (current production frontend)', asRole('anon') +
  `SELECT create_validated_order(p_customer_email=>'old@x.mk', p_customer_name=>'Old Client', p_customer_phone=>null, p_shipping_address=>'{"address":"a"}'::jsonb, p_items=>'${item({})}'::jsonb, p_notes=>null);` + reset);

const oid = (await q("SELECT id FROM orders WHERE customer_email='buyer@x.mk' LIMIT 1"))[0].id;
await db.exec(asRole('anon'));
const conf = await q(`SELECT * FROM get_order_by_id('${oid}')`).catch((e) => { console.log('FAIL get_order_by_id', e.message); return []; });
await db.exec(reset);
console.log('     get_order_by_id (anon) rows:', conf.length, '| exposes admin_notes:', Object.keys(conf[0] || {}).includes('admin_notes'));
console.log('     print_prices canvas 50x70:', (await q(`SELECT price_mkd FROM print_prices WHERE print_type='canvas' AND size_id='50x70'`))[0].price_mkd, '(expect 1299)');

await db.exec(`INSERT INTO newsletter_subscribers (email, consent) VALUES ('n@x.mk', true)`);
await db.exec(asRole('anon'));
console.log('     anon sees subscribers:', (await q('SELECT count(*)::int c FROM newsletter_subscribers'))[0].c, '(must be 0)');
await db.exec(reset);

await db.exec(`INSERT INTO newsletter_campaigns (subject_mk, body_mk, recipients) VALUES ('Наслов', 'Текст', 1)`);
await db.exec(asRole('anon'));
console.log('     anon sees campaigns:', (await q('SELECT count(*)::int c FROM newsletter_campaigns'))[0].c, '(must be 0)');
await db.exec(reset);
await db.exec(asRole('authenticated', CUST, 'cust@x.mk'));
console.log('     customer sees campaigns:', (await q('SELECT count(*)::int c FROM newsletter_campaigns'))[0].c, '(must be 0)');
await db.exec(reset);
await db.exec(asRole('authenticated', ADMIN, 'admin@x.mk'));
console.log('     admin sees campaigns:', (await q('SELECT count(*)::int c FROM newsletter_campaigns'))[0].c, '(must be 1)');
await db.exec(reset);
await expectFail('customer writes a campaign', asRole('authenticated', CUST, 'cust@x.mk') + `INSERT INTO newsletter_campaigns (subject_mk, body_mk) VALUES ('x', 'x');`);
await expectFail('3 gallery images on a blog post', `UPDATE blog_posts SET gallery_images='[{},{},{}]'::jsonb;`);
console.log('\nDONE');
