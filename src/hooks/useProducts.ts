import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { validateImageFile } from '../lib/fileValidation';
import type { Product, ProductFormData } from '../types';

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

interface CurrentImages {
  image_url: string | null;
  image_url_canvas: string | null;
  image_url_roll: string | null;
  image_url_framed: string | null;
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

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

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
