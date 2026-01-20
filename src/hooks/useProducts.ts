import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, ProductFormData } from '../types';

export function useProducts(includeUnpublished = false) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.in('status', ['published', 'sold']);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }, [includeUnpublished]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  return { product, loading, error };
}

export function useProductById(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}

export function useProductMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

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
      let imageUrl: string | null = null;

      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          title: formData.title,
          slug: formData.slug,
          description: formData.description || null,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          status: formData.status,
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

  const updateProduct = async (id: string, formData: ProductFormData, currentImageUrl: string | null) => {
    setLoading(true);
    setError(null);

    try {
      let imageUrl = currentImageUrl;

      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      const { data, error } = await supabase
        .from('products')
        .update({
          title: formData.title,
          slug: formData.slug,
          description: formData.description || null,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          status: formData.status,
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
