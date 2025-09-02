"use client";

import { MainLayout } from "@/components/main-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized' | 'incomplete_profile'>('loading');

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const profile = docSnap.data();
            // Check if profile is complete
            if (profile?.age && profile.mainGoal) {
              setAuthStatus('authorized');
            } else {
              // Profile exists but is incomplete, send to step 2
              setAuthStatus('incomplete_profile');
            }
          } else {
            // This case handles a new user who has just signed up via email/password
            // but hasn't created a user document yet.
             setAuthStatus('incomplete_profile');
          }
        } catch (error) {
          console.error("Error processing user profile:", error);
          toast({ title: "Erreur", description: "Impossible de vérifier votre profil.", variant: "destructive" });
          setAuthStatus('unauthorized');
        }
      } else {
        // No user is logged in.
        setAuthStatus('unauthorized');
      }
    });

    return () => {
      authUnsubscribe();
    };
  }, [toast]);
  
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (authStatus === 'authorized') {
    return (
      <MainLayout>
        {children}
      </MainLayout>
    );
  }

  if (authStatus === 'incomplete_profile') {
      router.replace('/signup/step2');
      return null;
  }
  
  // This covers 'unauthorized'
  router.replace('/welcome');
  return null;
}
