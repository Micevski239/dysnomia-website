import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { validateImageFile } from '../lib/fileValidation';
import type { Product, ProductFormData } from '../types';

async function fetchCachedProducts(): Promise<Product[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke('cached-products');
    if (error) return null;
    return data as Product[];
  } catch {
    return null;
  }
}

interface UseProductsOptions {
  includeUnpublished?: boolean;
  limit?: number;
  offset?: number;
}

export function useProducts(includeUnpublished = false, options?: Omit<UseProductsOptions, 'includeUnpublished'>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const limit = options?.limit;
  const offset = options?.offset ?? 0;

  const fetchProducts = useCallback(async (append = false) => {
    setLoading(true);
    setError(null);

    // For public queries without pagination, try cached edge function first
    if (!includeUnpublished && !limit) {
      const cached = await fetchCachedProducts();
      if (cached) {
        if (append) {
          setProducts((prev) => [...prev, ...cached]);
        } else {
          setProducts(cached);
        }
        setTotalCount(cached.length);
        setHasMore(false);
        setLoading(false);
        return;
      }
    }

    // Fallback: direct Supabase query
    let query = supabase
      .from('products')
      .select('id, title, title_mk, slug, description, description_mk, price, image_url, status, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.in('status', ['published', 'sold']);
    }

    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      setError(error.message);
    } else {
      if (append) {
        setProducts((prev) => [...prev, ...(data || [])]);
      } else {
        setProducts(data || []);
      }
      setTotalCount(count || 0);
      setHasMore(limit ? (data?.length || 0) === limit : false);
    }
    setLoading(false);
  }, [includeUnpublished, limit, offset]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts, hasMore, totalCount };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      // Try cached edge function first
      try {
        const { data: cached, error: fnError } = await supabase.functions.invoke(
          'cached-product',
          { body: { slug } }
        );
        if (!fnError && cached && !('error' in cached) && isMounted) {
          setProduct(cached as Product);
          setLoading(false);
          return;
        }
      } catch {
        // Edge function unavailable — fall through to direct query
      }

      // Fallback: direct Supabase query
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .abortSignal(abortController.signal)
        .single();

      if (!isMounted) return;

      if (error) {
        if (error.message !== 'AbortError') {
          setError(error.message);
        }
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    if (slug) {
      fetchProduct();
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [slug]);

  return { product, loading, error };
}

export function useProductById(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .abortSignal(abortController.signal)
        .single();

      if (!isMounted) return;

      if (error) {
        if (error.message !== 'AbortError') {
          setError(error.message);
        }
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchProduct();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [id]);

  return { product, loading, error };
}

async function invalidateProductCache(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.functions.invoke('invalidate-cache', {
        body: { type: 'products' },
      });
    }
  } catch {
    // Cache invalidation is best-effort
  }
}

interface CurrentImages {
  image_url: string | null;
  image_url_canvas: string | null;
  image_url_roll: string | null;
  image_url_framed: string | null;
}

function compressToWebP(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('WebP conversion failed'))),
        'image/webp',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

export function useProductMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const baseName = `${crypto.randomUUID()}.webp`;

    // Compress & convert full image to WebP (max 1200px, quality 0.8)
    const fullBlob = await compressToWebP(file, 1200, 0.8);

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(baseName, fullBlob, {
        contentType: 'image/webp',
        cacheControl: '31536000',
      });

    if (uploadError) {
      throw uploadError;
    }

    // Generate & upload thumbnail (max 400px, quality 0.8)
    try {
      const thumbBlob = await compressToWebP(file, 400, 0.8);
      await supabase.storage
        .from('product-images')
        .upload(`thumbnails/${baseName}`, thumbBlob, {
          contentType: 'image/webp',
          cacheControl: '31536000',
        });
    } catch {
      // Thumbnail is best-effort — full image still works
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(baseName);

    return data.publicUrl;
  };

  const createProduct = async (formData: ProductFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Upload main image
      let imageUrl: string | null = null;
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      // Upload category images
      let imageUrlCanvas: string | null = null;
      let imageUrlRoll: string | null = null;
      let imageUrlFramed: string | null = null;

      if (formData.image_canvas) {
        imageUrlCanvas = await uploadImage(formData.image_canvas);
      }
      if (formData.image_roll) {
        imageUrlRoll = await uploadImage(formData.image_roll);
      }
      if (formData.image_framed) {
        imageUrlFramed = await uploadImage(formData.image_framed);
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          title: formData.title,
          title_mk: formData.title_mk || null,
          slug: formData.slug,
          description: formData.description || null,
          description_mk: formData.description_mk || null,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          image_url_canvas: imageUrlCanvas,
          image_url_roll: imageUrlRoll,
          image_url_framed: imageUrlFramed,
          status: formData.status,
          product_code: formData.product_code || null,
          details: formData.details || null,
          details_mk: formData.details_mk || null,
        })
        .select()
        .single();

      if (error) throw error;

      await invalidateProductCache();
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      return { data: null, error: errorMessage };
    }
  };

  const updateProduct = async (
    id: string,
    formData: ProductFormData,
    currentImages: CurrentImages | string | null
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Handle backwards compatibility - if currentImages is a string, it's the old image_url
      const images: CurrentImages =
        typeof currentImages === 'string' || currentImages === null
          ? {
              image_url: currentImages,
              image_url_canvas: null,
              image_url_roll: null,
              image_url_framed: null,
            }
          : currentImages;

      // Upload main image if new one provided
      let imageUrl = images.image_url;
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      // Upload category images if new ones provided
      let imageUrlCanvas = images.image_url_canvas;
      let imageUrlRoll = images.image_url_roll;
      let imageUrlFramed = images.image_url_framed;

      if (formData.image_canvas) {
        imageUrlCanvas = await uploadImage(formData.image_canvas);
      }
      if (formData.image_roll) {
        imageUrlRoll = await uploadImage(formData.image_roll);
      }
      if (formData.image_framed) {
        imageUrlFramed = await uploadImage(formData.image_framed);
      }

      const { data, error } = await supabase
        .from('products')
        .update({
          title: formData.title,
          title_mk: formData.title_mk || null,
          slug: formData.slug,
          description: formData.description || null,
          description_mk: formData.description_mk || null,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          image_url_canvas: imageUrlCanvas,
          image_url_roll: imageUrlRoll,
          image_url_framed: imageUrlFramed,
          status: formData.status,
          product_code: formData.product_code || null,
          details: formData.details || null,
          details_mk: formData.details_mk || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await invalidateProductCache();
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      return { data: null, error: errorMessage };
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await invalidateProductCache();
      setLoading(false);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      return { error: errorMessage };
    }
  };

  return { createProduct, updateProduct, deleteProduct, loading, error };
}
