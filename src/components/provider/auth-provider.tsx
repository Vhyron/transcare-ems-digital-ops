"use client";

import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchUserWithCurrency = async () => {
      const {
        data: { user: supabaseUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !supabaseUser) {
        console.error(error);
        setUser(null);
        return;
      }

      setUser(supabaseUser);
    };

    fetchUserWithCurrency();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
