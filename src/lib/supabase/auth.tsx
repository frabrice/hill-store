import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './client';

interface AuthState {
  session: Session | null;
  user: User | null;
  /** Membership in the `staff` table, not just "logged in" — a shopper
   * account and an admin account are both just Supabase auth users. */
  isStaff: boolean;
  /** True until the initial session check (and, if a session exists, the
   * staff check) has resolved. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** `needsConfirmation` is true when Supabase requires the shopper to click
   * a confirmation link before a session exists — the default project
   * setting, and not something the client can skip. */
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function checkIsStaff(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_staff');
  if (error) return false;
  return data === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function syncStaffStatus(nextSession: Session | null) {
      const staff = nextSession ? await checkIsStaff() : false;
      if (!cancelled) {
        setSession(nextSession);
        setIsStaff(staff);
        setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => syncStaffStatus(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      syncStaffStatus(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthState['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp: AuthState['signUp'] = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null, needsConfirmation: !error && !data.session };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, isStaff, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
