
"use client";

import { MainLayout } from "@/components/main-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserRole } from "@/lib/services/roleService";
import { Loader2 } from "lucide-react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          if (role === 'client') {
            setAuthStatus("authorized");
          } else {
            setAuthStatus("unauthorized");
            // If user is admin or caterer, redirect them to their respective dashboards
            if (role === 'admin') router.replace('/admin');
            else if (role === 'caterer') router.replace('/caterer');
            else router.replace('/welcome'); 
          }
        } catch (error) {
           console.error("Error verifying client role:", error);
           setAuthStatus("unauthorized");
           router.replace('/welcome');
        }
      } else {
        setAuthStatus("unauthorized");
        router.replace('/welcome');
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  if (authStatus !== "authorized") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
