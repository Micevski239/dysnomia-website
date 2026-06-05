# Customer Photos Strip — Product Detail Page

**Date:** 2026-06-05  
**Status:** Approved

## Overview

Add a horizontal scrollable strip of real customer order photos to the product detail page. The section provides social proof by showing how artworks look in real homes.

## Placement

Inserted in `src/pages/ProductDetail.tsx` between the product details grid and the existing Reviews section (before the `<ReviewList>` block at line ~653).

## Heading

- English: **"From Our Customers"**
- Macedonian: **"Од нашите купувачи"**

Uses the existing `language === 'mk'` pattern consistent with the rest of the page. No `t()` translation key needed — the strings are hardcoded directly in the component (same approach used for the "More from" related products heading).

## Images

Five static global WebP files, already converted and stored in `public/lifestyle/`:

- `lifestyle1.webp` (866×1154)
- `lifestyle2.webp` (900×1600)
- `lifestyle3.webp` (1441×1921)
- `lifestyle4.webp` (1800×3200)
- `lifestyle5.webp` (864×1152)

All images are hardcoded — they appear on every product detail page. No per-product customisation.

## Layout

- Full-width section, `marginTop: 64px`, top border `1px solid #e5e5e5` matching the Reviews and Related Products section spacing.
- Heading: left-aligned, `fontSize: 'clamp(20px, 3vw, 28px)'`, `fontWeight: 300`, `color: '#1a1a1a'`, `marginBottom: 24px` — matches the "More from this collection" heading style.
- Photo strip: `display: flex`, `gap: 16px`, `overflowX: 'auto'`, scrollbar hidden via `-webkit-scrollbar: none` / `msOverflowStyle: none`.
- Each photo: fixed `height: 380px`, `width: auto` (natural aspect ratio), `objectFit: 'cover'`, `flexShrink: 0`, `borderRadius: 0` (flat Scandinavian aesthetic).
- Mobile scroll-snap: `scrollSnapType: 'x mandatory'` on container, `scrollSnapAlign: 'start'` on each photo.
- No click/lightbox behaviour — display only.

## Styling Constraints

- Inline styles only — no Tailwind classes (shop page convention per CLAUDE.md).
- Colours and spacing match the existing shop palette: `#1a1a1a` text, `#e5e5e5` borders, generous whitespace.

## What Is Not In Scope

- Admin upload UI for lifestyle photos.
- Per-product lifestyle photo overrides.
- Lightbox on photo click.
- Caption text on photos.
