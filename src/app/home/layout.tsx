
"use client";

import { MainLayout } from "@/components/main-layout";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/services/userService";
import { getUserRole } from "@/lib/services/roleService";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          
          if (role === 'client') {
            const profile = await getUserProfile(user.uid);
            if (!profile?.age || !profile.mainGoal) { 
              router.replace('/signup/step2');
            } else {
              setIsAuthorized(true);
            }
          } else if (role !== 'unknown') {
            // Not a client, don't authorize and let other layouts handle it.
            // This prevents the dreaded permission error.
            setIsAuthorized(false);
          } else {
            // Role is unknown, likely a new user being redirected by login page.
            // Let them pass through to be handled by step2 or another page.
          }
        } catch (error) {
           console.error("ClientLayout auth check failed:", error);
           toast({ title: "Erreur", description: "Impossible de vérifier votre session.", variant: "destructive" });
           await auth.signOut();
           router.replace('/welcome');
        } finally {
          setIsLoading(false);
        }
      } else {
        router.replace('/welcome');
      }
    });

    return () => unsubscribe();
  }, [router, toast]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Only render the client layout if the user is authorized.
  if (isAuthorized) {
    return (
      <MainLayout>
        {children}
      </MainLayout>
    );
  }

  return null;
}
