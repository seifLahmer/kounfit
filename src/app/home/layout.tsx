
"use client";

import { MainLayout } from "@/components/main-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getUserRole } from "@/lib/services/roleService";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";

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
    let profileUnsubscribe: Unsubscribe | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      // If a previous user was being listened to, unsubscribe first.
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        
        profileUnsubscribe = onSnapshot(userDocRef, async (docSnap) => {
          try {
            if (docSnap.exists()) {
              const profile = docSnap.data();
              if (profile?.age && profile.mainGoal) {
                setIsAuthorized(true);
                setIsLoading(false);
              } else {
                // Profile exists but is incomplete
                setIsAuthorized(false);
                router.replace('/signup/step2');
                setIsLoading(false);
              }
            } else {
              // User is authenticated but has no 'client' profile doc.
              // This means they need to complete onboarding.
              const role = await getUserRole(user.uid);
              if (role === 'unknown' || role === 'client') {
                 router.replace('/signup/step2');
              } else {
                 // User has another role (caterer, etc.), redirect them.
                 router.replace('/login');
              }
              setIsAuthorized(false);
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error processing user profile snapshot:", error);
            toast({ title: "Erreur", description: "Impossible de vérifier votre profil.", variant: "destructive" });
            auth.signOut();
            setIsAuthorized(false);
            setIsLoading(false);
          }
        }, (error) => {
            console.error("Firestore snapshot listener error:", error);
            toast({ title: "Erreur de connexion", description: "Impossible de synchroniser votre profil.", variant: "destructive" });
            auth.signOut();
            setIsLoading(false);
        });

      } else {
        // No user is logged in
        setIsAuthorized(false);
        setIsLoading(false);
        router.replace('/welcome');
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, [router, toast]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthorized) {
    return (
      <MainLayout>
        {children}
      </MainLayout>
    );
  }

  return null;
}
