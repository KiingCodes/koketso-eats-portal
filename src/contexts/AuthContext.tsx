import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const clearStoredSession = () => {
  if (typeof window === "undefined") return;

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith("sb-") && key.endsWith("-auth-token"))
    .forEach((key) => window.localStorage.removeItem(key));
};

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
        return false;
      }
      console.log("[Auth] Admin check result:", data);
      return !!data;
    } catch (err) {
      console.error("[Auth] Unexpected error checking admin role:", err);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const syncSession = async (nextSession: Session | null) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const admin = await checkAdmin(nextSession.user.id);
        if (!mounted) return;
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }

      if (mounted) setLoading(false);
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

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[Auth] Failed to restore session:", error);
          clearStoredSession();
          await supabase.auth.signOut({ scope: "local" });
          if (!mounted) return;
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        console.log("[Auth] Initial session:", data.session?.user?.email ?? "none");
        await syncSession(data.session);
      } catch (err) {
        console.error("[Auth] Unexpected session restore error:", err);
        clearStoredSession();
        if (!mounted) return;
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    void initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log("[Auth] Signing out...");
      setLoading(true);
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        console.error("[Auth] Sign out error:", error);
        // Force clear local state even if API call fails
      }
      clearStoredSession();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (err) {
      console.error("[Auth] Error signing out:", err);
      // Force clear state
      clearStoredSession();
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
