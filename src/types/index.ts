export type ProductStatus = 'draft' | 'published' | 'sold';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_url_canvas?: string | null;
  image_url_roll?: string | null;
  image_url_framed?: string | null;
  status: ProductStatus;
  is_featured?: boolean;
  product_code?: string;
  details?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  price: string;
  status: ProductStatus;
  image: File | null;
  image_canvas: File | null;
  image_roll: File | null;
  image_framed: File | null;
  product_code?: string;
  details?: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  cover_image_url?: string | null;
  slug: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionFormData {
  title: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  coverImage: File | null;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// Order types
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  imageUrl: string;
  printType: 'canvas' | 'roll' | 'framed';
  sizeId: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  status: OrderStatus;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  notes?: string;
}

// Review types
export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface CreateReviewData {
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title?: string;
  content?: string;
}
