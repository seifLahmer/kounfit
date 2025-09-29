"use client"; // ← impératif pour les hooks React et createContext
import { createContext, useContext, PropsWithChildren } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { User as AppUser } from '@/lib/types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const { user, loading ,error} = useAuthUser();

  if (loading) return <div>Loading... {error}</div>; // empêche le white screen

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
