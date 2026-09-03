# Footer Redesign Plan

## Current Footer Structure Analysis

### Current Sections:
1. **GALLERY** - Artworks, Collections, Limited Edition, New Arrivals
2. **DISCOVER** - Artists, Contemporary, Abstract, Home Décor
3. **ABOUT DYSNOMIA** - Our Story, Sustainability, Quality & Materials, Reviews
4. **SUPPORT** - Contact Us, Shipping & Delivery, Returns & Refunds, FAQ, Privacy Policy
5. **STAY INSPIRED** - Newsletter signup + Social links

---

## Route Validation

### Existing Routes (Pages that work):
- `/` - Home
- `/shop` - Shop/Artworks listing
- `/collections` - Collections page
- `/collections/:slug` - Individual collection
- `/artwork/:slug` - Product detail
- `/about` - About page
- `/new-arrivals` - New Arrivals page
- `/top-sellers` - Top Sellers page
- `/cart` - Cart
- `/checkout` - Checkout
- `/login` / `/register` - Auth pages
- `/account/*` - Account pages

### Missing Routes (404 pages - need to remove or create):
- `/limited-edition` - No page exists
- `/artists` - Redirects to ShopHome (placeholder)
- `/collections/contemporary` - May not exist
- `/collections/abstract` - May not exist
- `/collections/home-decor` - May not exist
- `/sustainability` - No page exists
- `/quality` - No page exists
- `/reviews` - No public page exists
- `/contact` - No page exists
- `/shipping` - No page exists
- `/returns` - No page exists
- `/faq` - No page exists
- `/privacy` - No page exists

---

## Recommended Changes

### REMOVE:
1. **STAY INSPIRED section** (newsletter) - As requested
2. **Limited Edition** link - No page
3. **Artists** link - Just a placeholder
4. **Sustainability** link - No page
5. **Quality & Materials** link - No page
6. **Reviews** link - No public page
7. **Shipping & Delivery** link - No page
8. **Returns & Refunds** link - No page
9. **FAQ** link - No page
10. **DISCOVER section entirely** - Most links don't work

### KEEP:
1. **GALLERY section** (rename to "SHOP"):
   - Artworks → `/shop`
   - Collections → `/collections`
   - New Arrivals → `/new-arrivals`
   - Top Sellers → `/top-sellers`

2. **ABOUT section**:
   - About Us → `/about`

3. **SUPPORT section** (simplified):
   - Contact Us → `/contact` (need to create or use email link)
   - Privacy Policy → `/privacy` (need to create or remove)

4. **Social Links** - Keep Instagram, Facebook, Pinterest

5. **Bottom section**:
   - Currency selector
   - Logo
   - Tagline
   - Copyright

### ADD:
1. **Social links** moved to main grid (not under newsletter)
2. **Contact email** as a simple mailto link
3. **Account link** for logged-in users

---

## Proposed New Footer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   SHOP              ABOUT             CONNECT               │
│   ─────             ─────             ───────               │
│   All Artworks      About Us          Instagram             │
│   Collections                         Facebook              │
│   New Arrivals      SUPPORT           Pinterest             │
│   Top Sellers       ───────                                 │
│                     Contact Us        hello@dysnomia.com    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     EU | EUR                                │
│                    DYSNOMIA                                 │
│              Art • Design • Lifestyle                       │
│         © 2025 Dysnomia Art Gallery. All rights reserved.  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

1. Remove STAY INSPIRED section (newsletter form)
2. Simplify footer links to only working pages
3. Reorganize into 3 columns: SHOP, ABOUT/SUPPORT combined, CONNECT (social)
4. Add email contact link
5. Keep bottom section (currency, logo, tagline, copyright)
6. Add translations for new structure
