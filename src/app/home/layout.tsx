
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
  const [isLoading, setIsLoading] = useState(true);

  // This function handles the logic for a user who has just signed in via Google redirect.
  const handleNewUserFromRedirect = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      // First, check if a profile already exists.
      const existingProfile = await getUserProfile(firebaseUser.uid);
      if (existingProfile) {
        return false; // Not a new user, no further action needed here.
      }

      // If no profile exists, create one.
      await updateUserProfile(firebaseUser.uid, {
          fullName: firebaseUser.displayName || 'New User',
          email: firebaseUser.email!,
          photoURL: firebaseUser.photoURL,
          role: 'client'
      });
      
      // Since this is a new user, redirect to the profile completion step.
      router.replace('/signup/step2');
      return true; // Indicates a new user was handled.

    } catch (error) {
        console.error("New user handling error:", error);
        toast({ title: "Erreur", description: "Impossible de finaliser votre inscription.", variant: "destructive" });
        router.replace('/welcome'); // Redirect to welcome on error
        return true; // Prevent further processing
    }
  }, [router, toast]);


  useEffect(() => {
    const processAuth = async () => {
      setIsLoading(true);

      // First, check for a redirect result from Google Sign-In.
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // If there's a result, it means the user just signed in via Google.
          // The function will create their profile and redirect to step2 if they are new.
          const isNewUser = await handleNewUserFromRedirect(result.user);
          if (isNewUser) {
            // Stop further execution because the user has been redirected.
            return; 
          }
        }
      } catch (error: any) {
        console.error("Error processing redirect result:", error);
        toast({ title: "Erreur de connexion", description: "Un problème est survenu lors de la connexion avec Google.", variant: "destructive" });
        router.replace('/welcome');
        return;
      }
      
      // Set up the listener for direct logins or existing sessions.
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const role = await getUserRole(user.uid);
            
            if (role === 'admin') {
                router.replace('/admin');
                return;
            }
            if (role === 'caterer') {
                router.replace('/caterer');
                return;
            }

            // At this point, user MUST be a client.
            // Let's fetch their profile to see if it's complete.
            const profile = await getUserProfile(user.uid);
            if (!profile) {
              // This can happen if the user document wasn't created correctly.
              // Treat as a new user from Google and attempt to fix it.
              const fixed = await handleNewUserFromRedirect(user);
              if (fixed) return;
            } else if (!profile.age) { 
              // Profile exists but is incomplete.
              router.replace('/signup/step2');
            } else {
              // Profile is complete, show the dashboard.
              setIsLoading(false);
            }
          } catch (error) {
             console.error("Authentication check failed:", error);
             toast({ title: "Erreur", description: "Impossible de vérifier votre session.", variant: "destructive" });
             await auth.signOut(); // Log out the user to be safe
             router.replace('/welcome');
          }
        } else {
          // No user is logged in.
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
