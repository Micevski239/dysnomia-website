import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { validateImageFile } from '../lib/fileValidation';
import type { Exhibition } from '../types';

export type ExhibitionInput = Omit<Exhibition, 'id' | 'created_at' | 'updated_at'>;

/** Published exhibitions (or all of them for the admin), newest first. */
export function useExhibitions(publishedOnly = true) {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let query = supabase.from('exhibitions').select('*').order('start_date', { ascending: false });
    if (publishedOnly) query = query.eq('is_published', true);
    query.then(({ data, error }) => {
      if (cancelled) return;
      setError(error ? error.message : null);
      setExhibitions((data as Exhibition[]) || []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [publishedOnly, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { exhibitions, loading, error, refetch };
}

export function useExhibition(slug: string) {
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('exhibitions')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        setExhibition((data as Exhibition) || null);
        setNotFound(!!error || !data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { exhibition, loading, notFound };
}

export function useExhibitionMutations() {
  const { exhibitions, loading, error, refetch } = useExhibitions(false);

  const uploadImage = async (file: File): Promise<string> => {
    const validation = validateImageFile(file);
    if (!validation.valid) throw new Error(validation.error);

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `art-scena/${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { contentType: file.type });
    if (uploadError) throw uploadError;

    return supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
  };

  const addExhibition = async (input: ExhibitionInput) => {
    const { error } = await supabase.from('exhibitions').insert(input);
    if (!error) refetch();
    return { error };
  };

  const updateExhibition = async (id: string, input: Partial<ExhibitionInput>) => {
    const { data, error } = await supabase
      .from('exhibitions')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id');
    if (!error) refetch();
    // RLS turns a forbidden update into "0 rows" instead of an error
    return { error: error || (data && data.length === 0 ? new Error('Nothing was saved (no permission?)') : null) };
  };

  const deleteExhibition = async (id: string) => {
    const { data, error } = await supabase.from('exhibitions').delete().eq('id', id).select('id');
    if (!error) refetch();
    return { error: error || (data && data.length === 0 ? new Error('Nothing was deleted (no permission?)') : null) };
  };

  return { exhibitions, loading, error, refetch, uploadImage, addExhibition, updateExhibition, deleteExhibition };
}
