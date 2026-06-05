# Customer Photos Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a horizontally scrollable "From Our Customers" photo strip to the product detail page between the product grid and the Reviews section.

**Architecture:** Single JSX block inserted into `ProductDetail.tsx`. Five static WebP files already exist in `public/lifestyle/`. No new components, no new hooks, no database changes.

**Tech Stack:** React 19, TypeScript, inline styles (shop convention), Vite dev server for verification.

---

### Task 1: Add the customer photos strip to ProductDetail.tsx

**Files:**
- Modify: `src/pages/ProductDetail.tsx:653` (before the Reviews section `<div style={{ marginTop: '64px' }}>`)

- [ ] **Step 1: Open `src/pages/ProductDetail.tsx` and locate the Reviews section**

Find the block that starts at around line 653:
```tsx
{/* Reviews Section */}
<div style={{ marginTop: '64px' }}>
  <ReviewList
```

- [ ] **Step 2: Insert the customer photos strip immediately before the Reviews section**

Insert the following JSX block directly before `{/* Reviews Section */}`:

```tsx
{/* Customer Photos Strip */}
<div style={{ marginTop: '64px', paddingTop: '48px', borderTop: '1px solid #e5e5e5' }}>
  <h2 style={{
    fontSize: 'clamp(20px, 3vw, 28px)',
    fontWeight: 300,
    color: '#1a1a1a',
    marginBottom: '24px',
    letterSpacing: '0.02em',
  }}>
    {language === 'mk' ? 'Од нашите купувачи' : 'From Our Customers'}
  </h2>
  <div style={{
    display: 'flex',
    gap: '16px',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  } as React.CSSProperties}>
    {([
      '/lifestyle/lifestyle1.webp',
      '/lifestyle/lifestyle2.webp',
      '/lifestyle/lifestyle3.webp',
      '/lifestyle/lifestyle4.webp',
      '/lifestyle/lifestyle5.webp',
    ] as const).map((src, i) => (
      <img
        key={src}
        src={src}
        alt={`Customer photo ${i + 1}`}
        style={{
          height: '380px',
          width: 'auto',
          flexShrink: 0,
          objectFit: 'cover',
          scrollSnapAlign: 'start',
          display: 'block',
        }}
      />
    ))}
  </div>
</div>
```

- [ ] **Step 3: Hide the scrollbar via a global CSS rule**

The `scrollbarWidth: 'none'` covers Firefox and `msOverflowStyle: 'none'` covers IE/Edge. For WebKit browsers (Chrome, Safari), a CSS rule is needed. Open `src/index.css` (or the existing global stylesheet) and confirm whether a `.hide-scrollbar` utility or a global `*::-webkit-scrollbar` rule already exists.

Run:
```bash
grep -r "webkit-scrollbar" "/Users/filipmicevski/Desktop/Filip/Finished Projects/Dysnomia/website/DysnomiaArtGallery/src"
```

If no result: add to the global stylesheet (whichever `.css` file is imported in `main.tsx`):
```css
.lifestyle-strip::-webkit-scrollbar {
  display: none;
}
```

Then add `className="lifestyle-strip"` to the scrollable `<div>` in the JSX above. If a global `*::-webkit-scrollbar { display: none }` already exists, skip this step — WebKit is already handled.

- [ ] **Step 4: Start the dev server and verify visually**

```bash
npm run dev
```

Open the browser at `http://localhost:5173`, navigate to any product detail page, and confirm:
- The "From Our Customers" heading appears between the product grid and the reviews
- Five photos are visible in a horizontal strip at ~380px height
- The strip scrolls horizontally on both desktop and mobile viewport widths
- No scrollbar is visible
- The section has a top border matching the other sections

- [ ] **Step 5: Commit**

```bash
git add src/pages/ProductDetail.tsx src/index.css
git commit -m "$(cat <<'EOF'
add From Our Customers lifestyle photo strip to product detail

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```
