export type ProductStatus = 'draft' | 'published' | 'sold';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  status: ProductStatus;
  is_featured?: boolean;
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
