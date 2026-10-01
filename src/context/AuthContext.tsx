import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // User id whose admin status was last confirmed by a *successful* is_admin RPC.
    let adminCheckedForUserId: string | null = null;
    // User id we currently consider signed in (to detect user changes).
    let currentUserId: string | null = null;

    const resetAuthState = () => {
      currentUserId = null;
      adminCheckedForUserId = null;
      setSession(null);
      setUser(null);
      setIsAdmin(false);
    };

    /**
     * Resolves admin status for `userId`. On RPC error the last known value is kept
     * (a transient network/token hiccup must not kick an admin out). isAdmin only
     * becomes false when the RPC succeeds with false, or on sign-out/user change.
     */
    async function checkAdmin(userId: string, attempt = 1): Promise<void> {
      const { data, error } = await supabase.rpc('is_admin');
      if (!isMounted || currentUserId !== userId) return; // stale result
      if (error) {
        console.warn('is_admin check failed; keeping last known admin status', error.message);
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          return checkAdmin(userId, attempt + 1);
        }
        return;
      }
      adminCheckedForUserId = userId;
      setIsAdmin(data === true);
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        resetAuthState();
        setLoading(false);
        return;
      }

      // Validate persisted session token; stale local sessions can cause 403s on protected tables.
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        await supabase.auth.signOut();
        resetAuthState();
        setLoading(false);
        return;
      }

      if (!isMounted) return;
      if (currentUserId !== userData.user.id) {
        currentUserId = userData.user.id;
        setIsAdmin(false);
      }
      setSession(session);
      setUser(userData.user);
      if (adminCheckedForUserId !== userData.user.id) {
        await checkAdmin(userData.user.id);
      }
      if (isMounted) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user || event === 'SIGNED_OUT') {
        resetAuthState();
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session.user);

      const userId = session.user.id;
      const userChanged = currentUserId !== userId;
      if (userChanged) {
        currentUserId = userId;
        adminCheckedForUserId = null;
        setIsAdmin(false);
      }

      // Same user with a confirmed status (TOKEN_REFRESHED, USER_UPDATED, tab-focus
      // SIGNED_IN, ...): nothing to re-check.
      if (adminCheckedForUserId === userId) {
        setLoading(false);
        return;
      }

      if (userChanged) setLoading(true);
      // Defer the RPC: awaiting Supabase calls inside onAuthStateChange can deadlock the auth lock.
      setTimeout(() => {
        checkAdmin(userId).finally(() => {
          if (isMounted) setLoading(false);
        });
      }, 0);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
