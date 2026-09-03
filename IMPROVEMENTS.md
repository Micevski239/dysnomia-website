# Dysnomia Art Gallery - Improvement Roadmap

A prioritized list of features and improvements to make the e-commerce gallery more professional.

---

## Current Status

### What's Implemented
- Product management (CRUD, images, status, featured)
- Collection management with product linking
- Admin authentication and protected routes
- Product browsing with filters and sorting
- Collection pages and showcases
- New arrivals page
- Responsive design with Scandinavian aesthetic
- Supabase backend with RLS policies

### What's Missing
- Shopping cart and checkout
- Payment processing
- Order management
- Customer accounts
- Product search
- Reviews and ratings

---

## Priority 1: Essential E-Commerce (Must Have)

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Shopping Cart** | Cart context, add-to-cart buttons, cart drawer/page, quantity controls | Medium |
| **Checkout Flow** | Multi-step checkout with shipping, billing, review | High |
| **Payment Integration** | Stripe integration for secure card payments | Medium |
| **Order Management** | Orders table, order confirmation, admin order list | High |
| **Product Search** | Full-text search with Supabase, search results page | Medium |
| **Customer Accounts** | User registration, login, profile, saved addresses | Medium |

### Database Changes Needed
```sql
-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  title TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  size TEXT,
  image_url TEXT
);

-- Customer profiles table
CREATE TABLE customer_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  default_shipping_address JSONB,
  default_billing_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Priority 2: Product Enhancements

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Multiple Product Images** | Gallery with thumbnails, lightbox view | Medium |
| **Product Variants** | Size options with different prices | Medium |
| **Stock Management** | Inventory tracking, "Only X left" indicators | Low |
| **Related Products** | "You may also like" recommendations | Low |
| **Wishlist** | Save favorites, persist to account | Medium |
| **Recently Viewed** | Track and display recently viewed products | Low |

### Database Changes Needed
```sql
-- Product images table (multiple images per product)
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants table
CREATE TABLE product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Add stock column to products
ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
```

---

## Priority 3: Trust & Social Proof

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Customer Reviews** | Ratings and written reviews on products | Medium |
| **Testimonials** | Curated customer stories with photos | Low |
| **Certificates** | Authenticity certificates for artworks | Low |
| **Artist Profiles** | Dedicated artist pages with bio and portfolio | Medium |
| **Press Section** | Media mentions and press features | Low |

### Database Changes Needed
```sql
-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artists table
CREATE TABLE artists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  photo_url TEXT,
  website TEXT,
  instagram TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add artist_id to products
ALTER TABLE products ADD COLUMN artist_id UUID REFERENCES artists(id);

-- Testimonials table
CREATE TABLE testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_location TEXT,
  author_photo_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Priority 4: Marketing & Growth

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Newsletter Backend** | Connect signup form to email service | Low |
| **Discount Codes** | Promo codes and percentage/fixed discounts | Medium |
| **Gift Cards** | Digital gift card purchase and redemption | High |
| **Referral Program** | Share links with rewards | High |
| **SEO Optimization** | Meta tags, Open Graph, structured data | Low |
| **Abandoned Cart Emails** | Remind users of items left in cart | Medium |

### Database Changes Needed
```sql
-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Discount codes
CREATE TABLE discount_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('percentage', 'fixed')) NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift cards
CREATE TABLE gift_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  initial_balance NUMERIC(10,2) NOT NULL,
  current_balance NUMERIC(10,2) NOT NULL,
  purchaser_email TEXT,
  recipient_email TEXT,
  message TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Priority 5: Admin & Analytics

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Sales Dashboard** | Revenue charts, top sellers, conversion rates | Medium |
| **Customer List** | View and manage customer accounts | Low |
| **Order Fulfillment** | Process orders, update status, print labels | Medium |
| **Email Templates** | Order confirmation, shipping updates | Medium |
| **Inventory Alerts** | Low stock notifications | Low |
| **Export Data** | CSV export for products, orders, customers | Low |

---

## Quick Wins (Low Effort, High Impact)

These can be implemented quickly to improve the professional feel:

### Pages to Add
- [ ] **Size Guide** (`/size-guide`) - Dimensions, scale comparisons
- [ ] **Shipping Info** (`/shipping`) - Delivery times, costs, regions
- [ ] **Returns Policy** (`/returns`) - Return window, conditions, process
- [ ] **FAQ** (`/faq`) - Common questions and answers
- [ ] **Contact** (`/contact`) - Contact form, email, location
- [ ] **About** (`/about`) - Brand story, mission, team
- [ ] **Terms & Conditions** (`/terms`)
- [ ] **Privacy Policy** (`/privacy`)

### UI Improvements
- [ ] "Sold" badge overlay on sold artwork images
- [ ] "Low stock" indicator when stock < 3
- [ ] Breadcrumb navigation on product pages
- [ ] Social share buttons on product pages
- [ ] Image zoom on hover for product images
- [ ] Sticky add-to-cart bar on mobile
- [ ] Back to top button
- [ ] Loading progress bar for page transitions

### Footer Additions
- [ ] Social media links (Instagram, Pinterest, Facebook)
- [ ] Payment method icons (Visa, Mastercard, PayPal)
- [ ] Trust badges (SSL secure, money-back guarantee)
- [ ] Newsletter signup in footer

---

## Technical Improvements

### Performance
- [ ] Image optimization with next-gen formats (WebP)
- [ ] Lazy loading for images below the fold
- [ ] Code splitting for faster initial load
- [ ] CDN for static assets
- [ ] Database query optimization with indexes

### SEO
- [ ] Meta title and description on all pages
- [ ] Open Graph tags for social sharing
- [ ] Structured data (JSON-LD) for products
- [ ] XML sitemap generation
- [ ] Robots.txt configuration
- [ ] Canonical URLs

### Security
- [ ] Rate limiting on API endpoints
- [ ] Input validation and sanitization
- [ ] Two-factor authentication for admin
- [ ] Regular security audits
- [ ] GDPR compliance tools

### Code Quality
- [ ] Extract inline styles to CSS modules
- [ ] Add unit tests for critical functions
- [ ] Add E2E tests for checkout flow
- [ ] Set up error monitoring (Sentry)
- [ ] Add analytics (Google Analytics, Mixpanel)

---

## Implementation Order Recommendation

### Phase 1: Core E-Commerce (Weeks 1-3)
1. Shopping cart with context and localStorage
2. Checkout page with form validation
3. Stripe payment integration
4. Order confirmation page
5. Basic order management in admin

### Phase 2: User Experience (Weeks 4-5)
1. Product search functionality
2. Multiple product images
3. Customer account registration/login
4. Wishlist functionality
5. Order history page

### Phase 3: Trust Building (Weeks 6-7)
1. Customer reviews system
2. Static pages (FAQ, Shipping, Returns)
3. Contact form with email
4. Newsletter integration
5. Social media links

### Phase 4: Growth (Weeks 8+)
1. Discount codes
2. Admin analytics dashboard
3. Email notifications
4. SEO optimization
5. Performance improvements

---

## Resources

### Recommended Services
- **Payments**: Stripe
- **Email**: Resend, SendGrid, or Mailchimp
- **Analytics**: Google Analytics 4, Mixpanel
- **Error Tracking**: Sentry
- **Image CDN**: Cloudinary, ImageKit
- **Shipping**: EasyPost, ShipStation

### Useful Libraries
- `@stripe/stripe-js` - Stripe Elements
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `zustand` - State management for cart
- `react-hot-toast` - Toast notifications
- `framer-motion` - Animations
- `react-helmet-async` - SEO meta tags

---

*Last updated: January 2026*
