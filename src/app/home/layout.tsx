
"use client";

import { MainLayout } from "@/components/main-layout";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, getRedirectResult, User as FirebaseUser } from "firebase/auth";
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

  const handleNewUserFromRedirect = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const role = await getUserRole(firebaseUser.uid);
      if (role === 'client' || role === 'unknown') {
        const existingProfile = await getUserProfile(firebaseUser.uid);
        if (!existingProfile) {
          router.replace('/signup/step2');
          return true; // Is a new user, stop processing
        }
      }
      return false; // Not a new user needing profile completion
    } catch (error) {
      console.error("New user handling error:", error);
      toast({ title: "Erreur", description: "Impossible de finaliser votre inscription.", variant: "destructive" });
      await auth.signOut();
      router.replace('/welcome');
      return true; // Stop processing
    }
  }, [router, toast]);


  useEffect(() => {
    const processAuth = async () => {
      // This function handles the logic for ANY authenticated user who hits this layout.
      // It has become the central authority for redirection.

      try {
        // Handle Google sign-in redirect first
        const result = await getRedirectResult(auth);
        if (result) {
          const isNew = await handleNewUserFromRedirect(result.user);
          if (isNew) return; // Stop processing to allow redirect to step2
        }
      } catch (error: any) {
        console.error("Error processing redirect result:", error);
        toast({ title: "Erreur de connexion", description: "Un problème est survenu lors de la connexion.", variant: "destructive" });
        router.replace('/welcome');
        return;
      }
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const role = await getUserRole(user.uid);
            
            // **AUTHORITATIVE REDIRECTION**
            if (role === 'admin') {
                router.replace('/admin');
                return; // Stop processing, user is an admin
            }
            if (role === 'caterer') {
                router.replace('/caterer');
                return; // Stop processing, user is a caterer
            }
            
            // At this point, user MUST be a client or unknown
            const profile = await getUserProfile(user.uid);
            
            if (!profile?.age || !profile.mainGoal) { 
              // Profile is incomplete, force to step2
              router.replace('/signup/step2');
            } else {
              // User is a valid, fully registered client. Allow access.
              setIsLoading(false);
            }
          } catch (error) {
             console.error("Authentication check failed:", error);
             toast({ title: "Erreur", description: "Impossible de vérifier votre session.", variant: "destructive" });
             await auth.signOut();
             router.replace('/welcome');
          }
        } else {
          // No user logged in.
          router.replace('/welcome');
        }
      });

      return () => unsubscribe();
    };
    
    processAuth();
  }, [router, toast, handleNewUserFromRedirect]);
  
  if (isLoading) {
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
