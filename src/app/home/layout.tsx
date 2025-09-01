
"use client";

import { MainLayout } from "@/components/main-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
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
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        
        profileUnsubscribe = onSnapshot(userDocRef, async (docSnap) => {
          try {
            // This is the key fix: if a write from the client is still pending,
            // we wait for the next snapshot after the write is confirmed by the server.
            // This prevents the race condition after signup.
            if (docSnap.metadata.hasPendingWrites) {
              setIsLoading(true);
              return;
            }

            if (docSnap.exists()) {
              const profile = docSnap.data();
              if (profile?.age && profile.mainGoal) {
                setIsAuthorized(true);
              } else {
                setIsAuthorized(false);
                router.replace('/signup/step2');
              }
            } else {
              const role = await getUserRole(user.uid);
              if (role === 'client' || role === 'unknown') {
                router.replace('/signup/step2');
              } else {
                router.replace('/login');
              }
              setIsAuthorized(false);
            }
          } catch (error) {
            console.error("Error processing user profile:", error);
            toast({ title: "Erreur", description: "Impossible de vérifier votre profil.", variant: "destructive" });
            auth.signOut();
            setIsAuthorized(false);
          } finally {
            setIsLoading(false);
          }
        }, (error) => {
            console.error("Firestore listener error:", error);
            toast({ title: "Erreur de connexion", description: "Impossible de synchroniser votre profil.", variant: "destructive" });
            auth.signOut();
            setIsLoading(false);
        });
      } else {
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
