
"use client";

import { MainLayout } from "@/components/main-layout";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, getRedirectResult, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, updateUserProfile } from "@/lib/services/userService";
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  const handleNewUserFromRedirect = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const existingProfile = await getUserProfile(firebaseUser.uid);
      // Only create a new profile if one doesn't exist.
      if (!existingProfile) {
        await updateUserProfile(firebaseUser.uid, {
            fullName: firebaseUser.displayName || 'New User',
            email: firebaseUser.email!,
            photoURL: firebaseUser.photoURL,
            role: 'client'
        });
        // This is a new user, they must complete onboarding.
        router.replace('/signup/step2');
        return true; // Indicates a redirect to onboarding happened
      }
      return false; // Not a new user
    } catch (error) {
        console.error("New user handling error:", error);
        toast({ title: "Erreur", description: "Impossible de finaliser votre inscription.", variant: "destructive" });
        return false;
    }
  }, [router, toast]);

  useEffect(() => {
    const processAuth = async () => {
      // First, check if a redirect from Google sign-in just happened
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // If it's a new user, they will be redirected to onboarding.
          // We can stop processing here to avoid conflicts.
          const isNew = await handleNewUserFromRedirect(result.user);
          if (isNew) return;
        }
      } catch (error: any) {
        console.error("Error getting redirect result", error);
        toast({ title: "Erreur d'authentification", description: "Un problème est survenu lors de la connexion.", variant: "destructive" });
        setIsLoading(false);
        router.replace('/welcome');
        return;
      }
      
      // If there was no redirect, or the user was not new, set up the standard auth state listener.
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const role = await getUserRole(user.uid);
            if (role === 'client') {
              const profile = await getUserProfile(user.uid);
              if (!profile?.age) { // Check if onboarding (step 2) is complete
                router.replace('/signup/step2');
              } else {
                setIsAuthorized(true); // Authorize and show content
              }
            } else {
              // User has the wrong role, send them away
              router.replace('/welcome');
            }
          } catch (error) {
             console.error("Error verifying client role:", error);
             router.replace('/welcome');
          }
        } else {
          // No user logged in, send to welcome page
          router.replace('/welcome');
        }
        setIsLoading(false);
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

  if (!isAuthorized) {
    return null; // Render nothing while redirects are happening
  }

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}
