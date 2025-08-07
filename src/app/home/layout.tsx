
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
  const [authStatus, setAuthStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  const handleNewUserFromRedirect = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const existingProfile = await getUserProfile(firebaseUser.uid);
      if (!existingProfile) {
        await updateUserProfile(firebaseUser.uid, {
            fullName: firebaseUser.displayName || 'New User',
            email: firebaseUser.email!,
            photoURL: firebaseUser.photoURL,
            role: 'client'
        });
        // This is a new user, they need to complete onboarding
        router.replace('/signup/step2');
        return true; // Indicates a redirect happened
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
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // A redirect sign-in just happened.
          setAuthStatus("loading"); // Stay in loading state while we process it.
          const isNew = await handleNewUserFromRedirect(result.user);
          if (isNew) return; // Stop processing, redirection to onboarding is happening
        }
      } catch (error) {
        console.error("Error getting redirect result", error);
        toast({ title: "Erreur d'authentification", description: "Un problème est survenu lors de la connexion.", variant: "destructive" });
        setAuthStatus("unauthorized");
        router.replace('/welcome');
        return;
      }
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const role = await getUserRole(user.uid);
            if (role === 'client') {
              const profile = await getUserProfile(user.uid);
              if (!profile?.age) { // Check if onboarding is complete
                router.replace('/signup/step2');
              } else {
                setAuthStatus("authorized");
              }
            } else {
              setAuthStatus("unauthorized");
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
    };
    
    processAuth();
  }, [router, toast, handleNewUserFromRedirect]);
  
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
