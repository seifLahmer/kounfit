
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          if (role === 'client') {
            setIsAuthorized(true);
          } else {
            // User is an admin or caterer, redirect them away
            router.replace('/login');
          }
        } catch (error) {
           console.error("Error verifying client role:", error);
           router.replace('/login');
        }
      } else {
        // No user is logged in, redirect
        router.replace('/welcome');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    // This part is mainly for safety, as the redirect should have already happened.
    // It prevents flashing the content if the redirect is slow.
    return null;
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
