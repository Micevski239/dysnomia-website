# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` (Vite)
- **Build**: `npm run build` (runs `tsc -b && vite build`)
- **Lint**: `npm run lint` (ESLint with flat config)
- **Preview**: `npm run preview`

No test framework is configured.

## Architecture

React 19 + TypeScript SPA for an art gallery e-commerce site. Vite 7 bundler with Tailwind CSS 4 (via `@tailwindcss/vite` plugin). Supabase backend (auth, database, storage). React Router v7 for routing.

### Two distinct UI worlds

**Shop (public)** — Uses **inline styles only**, no Tailwind classes. Calm Scandinavian aesthetic with generous whitespace, rounded cards (24–40px), and subtle animations. See `STYLE-GUIDE.mkd` for palette and conventions.

**Admin** — Uses a **mix of Tailwind utility classes and inline styles**. Dark sidebar (`#121012`) with light content area (`#f3f1eb`). Reusable UI components in `src/components/ui/` (Button, Input, Accordion).

Do not introduce Tailwind to shop pages. Do not use pure inline styles in admin tables/forms.

### Key directories

- `src/pages/` — Route-level page components. `admin/`, `account/`, `auth/` subdirectories.
- `src/components/shop/` — Public-facing shop UI components (Header, Footer, Hero, ProductCard, etc.). Barrel-exported via `index.ts`.
- `src/components/admin/` — Admin UI components (DataTable, StatsCard, etc.). Barrel-exported via `index.ts`.
- `src/components/ui/` — Shared low-level UI primitives (Button, Input, Accordion).
- `src/hooks/` — Data-fetching hooks wrapping Supabase (`useProducts`, `useCollections`, `useOrders`, `useReviews`, etc.).
- `src/context/` — React context providers: Auth, Cart, Wishlist, Language, Currency. All wrap `<App>` in `App.tsx`.
- `src/lib/` — Utilities: Supabase client (`supabase.ts`), validation (zod schemas), currency formatting, file validation.
- `src/config/` — Static config: print size options (`printOptions.ts`), product content.
- `src/types/index.ts` — All shared TypeScript interfaces (Product, Collection, Order, Review, etc.).

### Routing structure

Public shop routes are wrapped in `<ShopLayoutWrapper>` (provides Header/Footer). Admin routes behind `<ProtectedRoute>` + `<AdminLayout>`. Lazy loading via `React.lazy()` for secondary pages (ProductDetail, Cart, Checkout, admin pages).

### Data patterns

- Supabase client initialized from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars.
- Data hooks in `src/hooks/` handle all Supabase queries. Use these rather than calling supabase directly from components.
- Collection-product relationships use a `collection_products` join table. Fetch with `.select('product:products(*)')` pattern.
- Products have multiple image variants: `image_url`, `image_url_canvas`, `image_url_roll`, `image_url_framed`.
- Use `FALLBACK_IMAGE` pattern (Unsplash placeholder) when data lacks imagery.

### Build config

Vite config includes manual chunks (vendor, supabase, charts) and drops `console`/`debugger` in production builds.
