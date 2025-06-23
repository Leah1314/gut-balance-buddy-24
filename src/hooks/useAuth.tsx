import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id ? 'User logged in' : 'User logged out');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Only set loading to false after we have processed the auth change
          if (loading) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://gut-health-in-and-out.lovable.app/'
        }
      });
      return { error };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://gut-health-in-and-out.lovable.app/'
        }
      });
      return { error };
    } catch (error) {
      console.error('Error in signInWithGoogle:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      
      // Check if we have a session first
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log('No active session found, clearing local state');
        // If no session exists, just clear local state
        setSession(null);
        setUser(null);
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        // If it's a session missing error, we can still clear local state
        if (error.message?.includes('Auth session missing') || error.message?.includes('session_not_found')) {
          console.log('Session already invalid, clearing local state');
          setSession(null);
          setUser(null);
          return;
        }
        throw error;
      }
      console.log('Sign out successful');
      // Clear local state immediately
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Error in signOut:', error);
      // If we get here and it's a session error, clear local state anyway
      if (error instanceof Error && (error.message?.includes('Auth session missing') || error.message?.includes('session_not_found'))) {
        console.log('Clearing local state despite error');
        setSession(null);
        setUser(null);
        return;
      }
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
