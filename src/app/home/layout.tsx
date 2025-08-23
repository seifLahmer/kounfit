
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
  const [isClient, setIsClient] = useState(false);

  const handleNewUserFromRedirect = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      // For Google sign-in, we assume the role is client
      const existingProfile = await getUserProfile(firebaseUser.uid);
      if (!existingProfile) {
        // If profile doesn't exist, they need to complete it
        router.replace('/signup/step2');
        return true; 
      }
      return false; 
    } catch (error) {
      console.error("New user handling error:", error);
      toast({ title: "Erreur", description: "Impossible de finaliser votre inscription.", variant: "destructive" });
      await auth.signOut();
      router.replace('/welcome');
      return true;
    }
  }, [router, toast]);


  useEffect(() => {
    const processAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // This handles users signing in with Google
          const isNew = await handleNewUserFromRedirect(result.user);
          if (isNew) return; 
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
            
            if (role !== 'client') {
              // This is not a client, so this layout should not handle them.
              // Another layout (caterer, admin, etc.) will take over.
              // We set loading to false to prevent the spinner from showing indefinitely
              // if no other layout matches and handles the redirect.
              setIsLoading(false);
              return;
            }

            setIsClient(true);
            const profile = await getUserProfile(user.uid);
            if (!profile?.age || !profile.mainGoal) { 
              router.replace('/signup/step2');
            } else {
              setIsLoading(false);
            }
          } catch (error) {
             console.error("Authentication check failed:", error);
             toast({ title: "Erreur", description: "Impossible de vérifier votre session.", variant: "destructive" });
             await auth.signOut();
             router.replace('/welcome');
          }
        } else {
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

  // Only render the client layout and its children if the user is a client.
  if (isClient) {
    return (
      <MainLayout>
        {children}
      </MainLayout>
    );
  }

  // If not a client and loading is finished, render nothing.
  // This allows the correct layout for other roles to take over.
  return null;
}
