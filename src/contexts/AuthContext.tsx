import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the user is an admin
  const checkAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) console.error("Error checking admin role:", error);
      setIsAdmin(!!data);
    } catch (err) {
      console.error("Unexpected error checking admin role:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Initialize session on load
    const initSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkAdmin(session.user.id);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error initializing session:", err);
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkAdmin(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}