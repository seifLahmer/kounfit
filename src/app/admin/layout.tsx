
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          if (role !== 'admin') {
            router.replace('/welcome');
            return; // Stop execution if not admin
          } else {
            setIsAuthorized(true);
            setIsLoading(false);
          }
        } catch (error) {
           console.error("Error verifying admin role:", error);
           router.replace('/welcome');
        }
      } else {
        router.replace('/welcome');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-red-500" />
      </div>
    );
  }
  
  if (!isAuthorized) {
     // This part should theoretically not be reached if the redirection logic works,
     // but it's a good fallback.
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Accès non autorisé</h1>
        <p className="text-muted-foreground mb-4">Vous n'avez pas les permissions pour voir cette page.</p>
        <Link href="/welcome" className="text-blue-500 hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 pb-20">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around items-center h-16">
          <Link href="/admin" className="flex flex-col items-center gap-1 text-red-500">
            <Shield />
            <span className="text-xs">Admin</span>
          </Link>
          <Link href="/welcome" className="flex flex-col items-center gap-1 text-gray-600">
            <LogOut />
            <span className="text-xs">Logout</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
