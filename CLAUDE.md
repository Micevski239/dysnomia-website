# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` (Vite)
- **Build**: `npm run build` (runs `tsc -b && vite build`)
- **Lint**: `npm run lint` (ESLint with flat config)
- **Preview**: `npm run preview`

No test framework is configured.

## Architecture

React 19 + TypeScript SPA for an art gallery e-commerce site. Vite 7 bundler with Tailwind CSS 4 (via `@tailwindcss/vite` plugin). Supabase backend (auth, database, storage, edge functions). React Router v7 for routing. Deployed on Vercel.

### Two distinct UI worlds

**Shop (public)** — Uses **inline styles only**, no Tailwind classes. Calm Scandinavian aesthetic with generous whitespace, rounded cards (24–40px), and subtle animations. See `STYLE-GUIDE.mkd` for the full palette and conventions.

Key palette: backgrounds `#FFFFFF`/`#FAFAFA`/`#f6f3ed`, text `#0A0A0A`, supporting copy `#666666`, accent `#FBBE63`. Typography: Playfair Display for headings, Inter for body. Hover animations ~200ms, image scale 1.05–1.08.

**Admin** — Uses a **mix of Tailwind utility classes and inline styles**. Dark sidebar (`#121012`) with light content area (`#f3f1eb`). Reusable UI components in `src/components/ui/` (Button, Input, Accordion).

Do not introduce Tailwind to shop pages. Do not use pure inline styles in admin tables/forms. After admin form success, always navigate to `/admin/products` or `/admin/collections` — there is no dashboard route to return to.

### Key directories

- `src/pages/` — Route-level page components. `admin/`, `account/`, `auth/` subdirectories.
- `src/components/shop/` — Public-facing shop UI components. Barrel-exported via `index.ts`.
- `src/components/admin/` — Admin UI components (DataTable, StatsCard, etc.). Barrel-exported via `index.ts`.
- `src/components/ui/` — Shared low-level UI primitives (Button, Input, Accordion).
- `src/hooks/` — Data-fetching hooks wrapping Supabase. Use these rather than calling supabase directly from components.
- `src/context/` — React context providers: Auth, Cart, Wishlist, Language, Currency. All wrap `<App>` in `App.tsx`.
- `src/lib/` — Utilities: Supabase client, zod validation schemas, currency formatting, file validation, localization, email sending.
- `src/config/` — Static config: print size options and price matrix (`printOptions.ts`), product content.
- `src/types/index.ts` — All shared TypeScript interfaces.

### Routing structure

Public shop routes are wrapped in `<ShopLayoutWrapper>` (provides Header/Footer). Admin routes behind `<ProtectedRoute>` + `<AdminLayout>`. Lazy loading via `React.lazy()` for secondary pages (ProductDetail, Cart, Checkout, admin pages).

### Data patterns

- Supabase client initialized from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars.
- Collection-product relationships use a `collection_products` join table. Fetch with `.select('product:products(*)')` pattern.
- Products have multiple image variants: `image_url`, `image_url_canvas`, `image_url_roll`, `image_url_framed`.
- Use `FALLBACK_IMAGE` pattern (Unsplash placeholder) when data lacks imagery.
- Product status: `'draft' | 'published' | 'sold'`. RLS policies allow anon reads only for `published` and `sold`.

### Pricing model

Products are not sold at a fixed price. Pricing is determined by a print type × size matrix defined in `src/config/printOptions.ts`. Print types: `canvas`, `roll`, `framed`. Sizes: 50×70 through 100×150 cm. All prices are stored and computed in **MKD (Macedonian Denar)**. The `price` field on the `Product` type is unused for checkout — always use `getPrice(printType, sizeId)` from `printOptions.ts`.

### Localization (i18n)

The site is bilingual: English (default) and Macedonian (mk). Every content field that has a translation has a `_mk` suffix variant (e.g. `title` / `title_mk`, `description` / `description_mk`). Use `localize(defaultValue, mkValue, language)` from `src/lib/localize.ts` to render the correct value. The active language comes from `LanguageContext`.

### Currency

All prices are stored in MKD. `CurrencyContext` tracks the user's preferred currency (MKD or EUR). Use `formatPriceInCurrency(priceInMKD, currency)` from `src/lib/currency.ts` to display prices — it applies a static rate of 1 EUR ≈ 61.5 MKD.

### Edge functions & caching

Supabase Edge Functions live in `supabase/functions/`:
- `cached-products`, `cached-product`, `cached-collections` — serve cached product/collection data
- `invalidate-cache` — purges cached responses
- `send-order-email` — fire-and-forget transactional emails triggered by order status changes via `src/lib/sendOrderEmail.ts`

### Build config

Vite config includes manual chunks (vendor, supabase, charts) and drops `console`/`debugger` in production builds. Vercel deployment uses `vercel.json` for SPA rewrites and security headers (CSP, X-Frame-Options, etc.).
