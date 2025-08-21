"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "@/data/actions/comment-actions"; // jouw fetch functie

type User = {
  id: string;
  username: string;
  email: string;
} | null;

type AuthContextType = {
  user: User;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
