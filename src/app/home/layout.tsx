
"use client";

import { MainLayout } from "@/components/main-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getUserRole } from "@/lib/services/roleService";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
              setIsAuthorized(true);
            } else {
              // Profile exists but is incomplete, send to step 2
              setIsAuthorized(false);
              router.replace('/signup/step2');
            }
          } else {
            // Document doesn't exist, this could be a new signup
            // or a different user type trying to access /home.
            // Check their role to decide.
            const role = await getUserRole(user.uid);
            if (role === 'client' || role === 'unknown') {
              router.replace('/signup/step2');
            } else {
              // It's a caterer, admin, or delivery person; they shouldn't be here.
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
      } else {
        // No user is logged in.
        setIsAuthorized(false);
        setIsLoading(false);
        router.replace('/welcome');
      }
    });

    return () => {
      authUnsubscribe();
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

  // Return null while redirects are happening to prevent flashing content
  return null;
}
