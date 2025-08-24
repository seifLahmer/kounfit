
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
  const [isAuthorizedClient, setIsAuthorizedClient] = useState(false);

  const handleNewUserFromRedirect = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const existingProfile = await getUserProfile(firebaseUser.uid);
      if (!existingProfile) {
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
              // This is a non-client user. Do not proceed.
              // This prevents other layouts (caterer, admin) from being blocked by this one.
              // We stop loading and do not authorize rendering of the client layout.
              setIsAuthorizedClient(false);
              setIsLoading(false);
              // The correct layout for the user's role will handle the redirection.
              return;
            }

            // User is a 'client'. Proceed with client-specific logic.
            const profile = await getUserProfile(user.uid);
            if (!profile?.age || !profile.mainGoal) { 
              router.replace('/signup/step2');
            } else {
              setIsAuthorizedClient(true);
            }
          } catch (error) {
             console.error("Authentication check failed:", error);
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

  // Only render the layout if the user is an authorized client.
  if (isAuthorizedClient) {
    return (
      <MainLayout>
        {children}
      </MainLayout>
    );
  }

  // If not loading and not an authorized client, render nothing.
  // This allows other layouts to take over without this one interfering.
  return null;
}
