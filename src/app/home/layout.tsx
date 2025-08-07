
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
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          if (role === 'client') {
            setIsAuthorized(true);
          } else {
            // User is logged in but not a client, boot them out
            router.replace('/welcome'); 
          }
        } catch (error) {
           console.error("Error verifying client role:", error);
           router.replace('/welcome');
        }
      } else {
        // No user is logged in, redirect to welcome
        router.replace('/welcome');
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  if (!isAuthorized) {
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
