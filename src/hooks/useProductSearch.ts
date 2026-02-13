import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  price: number;
  image_url: string | null;
}

const RECENT_SEARCHES_KEY = 'dysnomia_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function useProductSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sanitize query: escape PostgREST filter special chars
      const sanitized = query.replace(/[%_\\.,()]/g, '');
      if (!sanitized.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      const { data, error: searchError } = await supabase
        .from('products')
        .select('id, title, slug, price, image_url')
        .or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
        .in('status', ['published', 'sold'])
        .limit(10);

      if (searchError) throw searchError;

      setResults(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const timer = setTimeout(() => {
        searchProducts(query);
      }, 300);

      setDebounceTimer(timer);
    },
    [debounceTimer, searchProducts]
  );

  const addToRecentSearches = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }

      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }, [debounceTimer]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    results,
    loading,
    error,
    search: debouncedSearch,
    clearResults,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
  };
}
