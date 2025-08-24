
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
              // Profile is incomplete, redirect to step 2
              router.replace('/signup/step2');
            } else {
              // Profile is complete, authorize access
              setIsAuthorized(true);
            }
          } else if (role !== 'unknown') {
            // This is a user with a defined role that is NOT client (e.g., caterer, admin).
            // Do not authorize them here. Redirect them away from the client area.
            router.replace('/login');
          } else {
            // Role is 'unknown'. This could be a new user from Google Sign-In.
            // Redirect them to step 2 to complete their profile.
            router.replace('/signup/step2');
          }
        } catch (error) {
           console.error("ClientLayout auth check failed:", error);
           toast({ title: "Erreur", description: "Impossible de vérifier votre session.", variant: "destructive" });
           await auth.signOut();
           router.replace('/login');
        } finally {
          setIsLoading(false);
        }
      } else {
        // No user is logged in, send them to the welcome page.
        router.replace('/login');
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

  // Only render the client layout if the user is a fully onboarded client.
  if (isAuthorized) {
    return (
      <MainLayout>
        {children}
      </MainLayout>
    );
  }

  // If not authorized, render nothing. This prevents flicker and content flashes.
  return null;
}
