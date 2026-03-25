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

  const checkAdmin = async (userId: string) => {
    setLoading(true);
    try {
      console.log("[Auth] Checking admin role for:", userId);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("[Auth] Error checking admin role:", error);
        setIsAdmin(false);
        return;
      }
      console.log("[Auth] Admin check result:", data);
      setIsAdmin(!!data);
    } catch (err) {
      console.error("[Auth] Unexpected error checking admin role:", err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const syncSession = async (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await checkAdmin(nextSession.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[Auth] State change:", event, session?.user?.email);
        setLoading(true);

        // Use setTimeout to avoid potential deadlock with auth callbacks
        setTimeout(() => {
          void syncSession(session);
        }, 0);
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[Auth] Initial session:", session?.user?.email ?? "none");
      void syncSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log("[Auth] Signing out...");
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[Auth] Sign out error:", error);
        // Force clear local state even if API call fails
      }
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (err) {
      console.error("[Auth] Error signing out:", err);
      // Force clear state
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
