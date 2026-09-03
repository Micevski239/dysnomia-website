import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { validateImageFile } from '../lib/fileValidation';
import type { BlogPost } from '../types';

export function useBlogPosts(publishedOnly = true) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false });

    if (publishedOnly) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  }, [publishedOnly]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, refetch: fetchPosts };
}

export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    async function fetchPost() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('blog_posts')
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
        setPost(data);
      }
      setLoading(false);
    }

    if (slug) {
      fetchPost();
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [slug]);

  return { post, loading, error };
}

export function useBlogMutations() {
  const { posts, loading: fetching, refetch } = useBlogPosts(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `blog/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const addPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>, coverFile?: File | null) => {
    let coverImage = post.cover_image;
    if (coverFile) {
      coverImage = await uploadImage(coverFile);
    }

    const { error } = await supabase.from('blog_posts').insert({
      ...post,
      cover_image: coverImage,
    });
    if (!error) await refetch();
    return { error };
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>, coverFile?: File | null) => {
    let coverImage = updates.cover_image;
    if (coverFile) {
      coverImage = await uploadImage(coverFile);
    }

    const { error } = await supabase
      .from('blog_posts')
      .update({ ...updates, cover_image: coverImage, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) await refetch();
    return { error };
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (!error) await refetch();
    return { error };
  };

  return { posts, loading: fetching, refetch, addPost, updatePost, deletePost, uploadImage };
}
