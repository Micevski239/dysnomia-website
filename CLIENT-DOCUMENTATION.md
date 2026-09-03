# Dysnomia Art Gallery — Client Documentation

---

## 1. Website Overview

Dysnomia Art Gallery is a bilingual (English & Macedonian) e-commerce website for selling art prints. Customers can browse artworks, view them in room mockups, choose print types and sizes, and complete purchases online. The site supports two currencies (EUR and MKD).

---

## 2. Public Website Pages

### Home Page
The landing page features a full-screen hero with the DYSNOMIA branding, featured artworks carousel, brand story section, and call-to-action links to collections and the shop.

### Shop
The main product browsing page. All published products are displayed in a responsive grid. Customers can search by title and browse all available artworks.

### Collections
Displays all collections as visual cards with cover images. Clicking a collection opens its dedicated page showing all products within that collection.

### New Arrivals
Automatically shows the 12 most recently added products, with a featured spotlight product at the top.

### Kids Pictures
A dedicated page for children's artwork, pulling products from the "Kid" collection.

### Top Sellers
Showcases the bestselling products as curated by the admin.

### Product Detail Page
Each artwork has its own page with:
- Large image with zoom capability
- Three print type options: Canvas, Roll, Decorative Frame
- Frame color selection (Gold, Silver, White, Black) for framed prints
- Room mockup preview showing how the artwork looks on a wall
- Size selection (50x70, 60x90, 70x100, 80x120, 100x150 cm)
- Price display based on selected print type and size
- Add to Cart and Wishlist buttons
- Product details, description, delivery & returns info, and support info in accordion sections
- Customer reviews with star ratings

### Blog
Published blog posts with cover images, bilingual content, and author attribution.

### About
Company story and brand values page.

### Contact
Contact form for customer inquiries.

### Shipping
Shipping information and delivery policies.

---

## 3. Customer Features

### Shopping Cart
- Add products with chosen print type, size, and frame color
- Adjust quantities or remove items
- View subtotal, shipping, and total
- Proceed to checkout

### Checkout
- Fill in shipping details (name, email, phone, address, city, postal code, country)
- Add order notes
- Review order summary
- Place order

### Order Confirmation
After a successful order, customers see a confirmation page with their order number, items, shipping address, and total. A confirmation email is sent automatically.

### Customer Account
Customers can register and log in to access:
- **Dashboard** — Overview with quick links
- **Order History** — View all past orders with status tracking
- **Wishlist** — Saved favorite products
- **Settings** — Update profile information and password

### Language & Currency
- Toggle between English and Macedonian using the language switcher in the header
- Toggle between EUR and MKD currency display

### Announcement Bar
A banner at the top of the site displays promotions or important messages (managed from admin).

---

## 4. Admin Panel

### Accessing the Admin Panel
1. Go to `yourdomain.com/admin`
2. Log in with your admin email and password
3. You will be redirected to the Admin Dashboard

### Dashboard
The dashboard shows at a glance:
- Pending orders count
- Today's orders
- Monthly revenue
- Pending reviews to moderate
- Total products and published percentage
- Collections count
- Recent activity feed
- Quick action buttons (Add Product, Add Collection, View Store)

---

### Managing Products

#### Viewing Products
Go to **Products** in the sidebar. You'll see a table of all products with image thumbnails, title, slug, price, and status.

- **Search** by title, slug, or description
- **Filter** by status: All, Published, Draft, Sold

#### Adding a New Product
1. Click **Add Product** in the sidebar or dashboard
2. Fill in the required fields:
   - **Title** (English) — the product name
   - **Title (MK)** — Macedonian translation
   - **Slug** — auto-generated from the title, used in the URL
   - **Description** (English & Macedonian)
   - **Details** (English & Macedonian) — materials, specs, etc.
   - **Product Code** — your internal reference code
   - **Price**
   - **Status** — Draft (hidden), Published (visible), or Sold
3. Upload images:
   - **Main Image** — the primary product image
   - **Canvas Image** — how it looks as a canvas print
   - **Roll Image** — how it looks as a rolled print
   - **Framed Image** — how it looks framed
4. Assign to a **Collection** if applicable
5. Click **Save**

#### Editing a Product
Click the edit icon on any product in the list. Make your changes and save.

#### Bulk Actions
Select multiple products using checkboxes, then use the bulk action buttons to:
- **Publish** selected products
- **Set as Draft** (hide from store)
- **Delete** selected products

---

### Managing Collections

#### Viewing Collections
Go to **Collections** in the sidebar. Collections are displayed as cards with cover images.

#### Adding a New Collection
1. Click **Add Collection**
2. Fill in:
   - **Title** (English & Macedonian)
   - **Description** (English & Macedonian)
   - **Slug** — auto-generated, used in the URL
   - **Cover Image** — the main image for the collection
   - **Display Order** — controls the order collections appear
   - **Active** — toggle visibility on the store
   - **Featured** — mark as featured collection
3. Click **Save**

#### Editing a Collection
Click the edit icon on any collection card. Update fields and save.

---

### Managing Orders

#### Viewing Orders
Go to **Orders** in the sidebar. You'll see all orders listed with:
- Order number
- Customer name and email
- Date placed
- Current status
- Total amount

Use the **status filter** tabs (All, Pending, Confirmed, Shipped, Delivered, Cancelled) and **search** to find specific orders.

#### Order Detail
Click on any order to view full details:
- All ordered items with images, print type, size, quantity, and price
- Customer information and shipping address
- Order totals (subtotal, shipping, total)

#### Updating Order Status
On the order detail page, use the status buttons to progress the order:
1. **Pending** → **Confirmed** (order accepted)
2. **Confirmed** → **Shipped** (add tracking number)
3. **Shipped** → **Delivered** (order completed)

You can also **Cancel** an order at any stage.

**Important:** Each status change automatically sends an email notification to the customer.

#### Adding Notes
Use the notes section on the order detail page to add internal notes about the order.

---

### Managing Reviews

Go to **Reviews** in the sidebar.

- **Pending tab** — shows reviews waiting for approval (default view)
- **All tab** — shows all reviews

For each review you can:
- **Approve** — makes the review visible on the product page
- **Delete** — permanently removes the review

Use bulk actions to approve or delete multiple reviews at once. You can also filter by star rating.

---

### Managing Featured Sections

Go to **Featured** in the sidebar. This controls what appears on the homepage.

#### Bestsellers
1. Search and select up to 12 products to feature as bestsellers
2. Drag to reorder them
3. Set one product as the **Spotlight** (appears as the large hero product)
4. Click **Save**

#### New Arrivals Spotlight
The 12 newest products appear automatically. You can override which product appears as the spotlight hero image.

---

### Managing Announcements

Go to **Announcements** in the sidebar. These appear as a banner bar at the top of the store.

#### Creating an Announcement
1. Click **Add Announcement**
2. Fill in:
   - **Text** — the main message (English)
   - **Highlight** — the emphasized/gold text portion
   - **Suffix** — text after the highlight
   - **Macedonian versions** of all three fields
   - **Link URL** — optional link (e.g., to a sale page)
   - **Sort Order** — display priority
   - **Active** — toggle on/off
3. Save

#### Editing
Click on any announcement to edit it inline. Toggle visibility with the eye icon.

---

### Managing Blog Posts

Go to **Blog** in the sidebar.

#### Creating a Post
1. Click **Add Post**
2. Fill in:
   - **Title** (English & Macedonian)
   - **Slug** — auto-generated for the URL
   - **Author** — defaults to "Dysnomia"
   - **Excerpt** (English & Macedonian) — short summary
   - **Content** (English & Macedonian) — full article text
   - **Cover Image**
   - **Published** — toggle to make visible on the store
3. Save

#### Editing
Click on any post to edit. Toggle the published status to show/hide from the store.

---

## 5. Pricing Structure

Prices are based on a fixed matrix by print type and size. All products share the same pricing:

| Size | Canvas Print | Roll Print | Decorative Frame |
|------|-------------|------------|-----------------|
| 50 x 70 cm | 2,640 MKD | 1,000 MKD | 5,043 MKD |
| 60 x 90 cm | 2,930 MKD | 1,150 MKD | 5,596 MKD |
| 70 x 100 cm | 3,260 MKD | 1,300 MKD | 6,150 MKD |
| 80 x 120 cm | 3,460 MKD | 1,700 MKD | 6,765 MKD |
| 100 x 150 cm | 3,800 MKD | 2,150 MKD | 7,749 MKD |

EUR prices are converted automatically at the approximate rate of 1 EUR = 61.5 MKD.

---

## 6. Quick Reference

| Task | Where to Go |
|------|------------|
| Add a new product | Sidebar → Products → Add Product |
| Edit a product | Sidebar → Products → click edit icon |
| Create a collection | Sidebar → Collections → Add Collection |
| View/manage orders | Sidebar → Orders |
| Update order status | Orders → click order → use status buttons |
| Approve reviews | Sidebar → Reviews → Pending tab → Approve |
| Update homepage featured | Sidebar → Featured |
| Add announcement banner | Sidebar → Announcements |
| Write a blog post | Sidebar → Blog → Add Post |
| View the live store | Sidebar → View Gallery |

---

## 7. Important Notes

- **Always save** after making changes — unsaved changes will be lost
- **Product status**: Draft = hidden from customers, Published = visible, Sold = shown with "Sold" badge
- **Order emails** are sent automatically when you change order status — customers are notified of confirmations, shipments, and deliveries
- **Reviews** must be approved before they appear on product pages
- **Images**: Upload high-quality images for best results. The site supports main image plus canvas, roll, and framed variants
- **Bilingual content**: Always fill in both English and Macedonian fields to ensure the full site works in both languages
