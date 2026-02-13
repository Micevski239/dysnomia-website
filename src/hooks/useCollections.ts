import { useCallback, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { validateImageFile } from '../lib/fileValidation';
import type { Collection, CollectionFormData } from '../types';

const LEGACY_COVER_FIELD_KEY = 'collections:useLegacyCoverField';

const getInitialLegacyFlag = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(LEGACY_COVER_FIELD_KEY) === 'true';
};

let useLegacyCoverField = getInitialLegacyFlag();

const persistLegacyFlag = (value: boolean) => {
  useLegacyCoverField = value;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LEGACY_COVER_FIELD_KEY, value ? 'true' : 'false');
  }
};

export function useCollections(includeInactive = false) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.from('collections').select('*, collection_products(count)');

    if (error) {
      setError(error.message);
      setCollections([]);
      setLoading(false);
      return;
    }

    let result = data || [];

    if (!includeInactive) {
      result = result.filter((item) => item.is_active ?? true);
    }

    result = [...result].sort((a, b) => {
      const orderDiff = (a.display_order ?? 0) - (b.display_order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    setCollections(result);
    setLoading(false);
  }, [includeInactive]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return { collections, loading, error, refetch: fetchCollections };
}

export function useCollectionById(id: string | undefined) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setCollection(null);
      setLoading(false);
      return;
    }

    async function fetchCollection() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
        setCollection(null);
      } else {
        setCollection(data);
      }

      setLoading(false);
    }

    fetchCollection();
  }, [id]);

  return { collection, loading, error };
}

export function useCollectionMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const COLLECTION_BUCKET = 'product-images';

  const uploadImage = async (file: File): Promise<string | null> => {
    // Validate file before upload
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = fileName;

    const { error } = await supabase.storage
      .from(COLLECTION_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(COLLECTION_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSchemaFallback = async <T>(
    action: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    fallback: () => Promise<{ data: T | null; error: PostgrestError | null }>
  ) => {
    if (useLegacyCoverField) {
      const { data, error } = await fallback();
      if (error && error.message?.toLowerCase().includes('cover_image_url')) {
        persistLegacyFlag(false);
        return action();
      }
      return { data, error };
    }

    const { data, error } = await action();
    if (error && error.message?.toLowerCase().includes('cover_image')) {
      persistLegacyFlag(true);
      return fallback();
    }
    return { data, error };
  };

  const createCollection = async (formData: CollectionFormData) => {
    setLoading(true);
    setError(null);

    try {
      let coverUrl: string | null = null;

      if (formData.coverImage) {
        coverUrl = await uploadImage(formData.coverImage);
      }

      const payload = {
        title: formData.title,
        title_mk: formData.title_mk || null,
        slug: formData.slug,
        description: formData.description || null,
        description_mk: formData.description_mk || null,
        cover_image: coverUrl,
        display_order: Number(formData.display_order) || 0,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      };

      const insert = async () =>
        supabase.from('collections').insert(payload).select().single();

      const fallbackInsert = async () => {
        const { cover_image: _cover, ...rest } = payload;
        return supabase
          .from('collections')
          .insert({ ...rest, cover_image_url: payload.cover_image })
          .select()
          .single();
      };

      const { data, error } = await handleSchemaFallback(insert, fallbackInsert);

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

  const updateCollection = async (
    id: string,
    formData: CollectionFormData,
    currentCoverUrl: string | null
  ) => {
    setLoading(true);
    setError(null);

    try {
      let coverUrl = currentCoverUrl;

      if (formData.coverImage) {
        coverUrl = await uploadImage(formData.coverImage);
      }

      const payload = {
        title: formData.title,
        title_mk: formData.title_mk || null,
        slug: formData.slug,
        description: formData.description || null,
        description_mk: formData.description_mk || null,
        cover_image: coverUrl,
        display_order: Number(formData.display_order) || 0,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      };

      const update = async () =>
        supabase
          .from('collections')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

      const fallbackUpdate = async () => {
        const { cover_image: _cover, ...rest } = payload;
        return supabase
          .from('collections')
          .update({ ...rest, cover_image_url: payload.cover_image })
          .eq('id', id)
          .select()
          .single();
      };

      const { data, error } = await handleSchemaFallback(update, fallbackUpdate);

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

  const deleteCollection = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('collections')
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

  return { createCollection, updateCollection, deleteCollection, loading, error };
}
