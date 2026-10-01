import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  preferred_language: string | null;
  preferred_currency: string | null;
}

export type UserProfileUpdate = Partial<Omit<UserProfile, 'id'>>;

const PROFILE_COLUMNS = 'id, full_name, phone, preferred_language, preferred_currency';

/** The signed-in user's own row in user_profiles (RLS: own row only). */
export function useUserProfile(userId: string | undefined) {
  const [state, setState] = useState<{
    userId: string;
    profile: UserProfile | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('user_profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        setState({ userId, profile: (data as UserProfile | null) ?? null, error: error?.message ?? null });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const current = state && state.userId === userId ? state : null;

  const saveProfile = useCallback(
    async (updates: UserProfileUpdate): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Not signed in' };
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ id: userId, ...updates }, { onConflict: 'id' })
        .select(PROFILE_COLUMNS)
        .single();
      if (error) return { error: error.message };
      setState({ userId, profile: data as UserProfile, error: null });
      return { error: null };
    },
    [userId]
  );

  return {
    profile: current?.profile ?? null,
    loading: !!userId && !current,
    error: current?.error ?? null,
    saveProfile,
  };
}
