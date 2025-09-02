
"use client";

import { Shield, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserRole } from "@/lib/services/roleService";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          if (role === 'admin') {
            setAuthStatus('authorized');
          } else {
            setAuthStatus('unauthorized');
          }
        } catch (error) {
           console.error("Error verifying admin role:", error);
           setAuthStatus('unauthorized');
        }
      } else {
        setAuthStatus('unauthorized');
      }
    });

    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/welcome');
  };

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (authStatus !== 'authorized') {
     router.replace('/login');
     return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 pb-24">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around items-center h-16">
          <Link href="/admin" className="flex flex-col items-center gap-1 text-primary">
            <Shield />
            <span className="text-xs">Admin</span>
          </Link>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-gray-500">
            <LogOut />
            <span className="text-xs">Déconnexion</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
