
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult, User as FirebaseUser } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { getUserProfile, updateUserProfile } from "@/lib/services/userService";
import { getUserRole } from "@/lib/services/roleService";

type AuthRedirectHandlerProps = {
  setGoogleLoading: (loading: boolean) => void;
};

export function AuthRedirectHandler({ setGoogleLoading }: AuthRedirectHandlerProps) {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const processRedirect = async () => {
      try {
        setGoogleLoading(true);
        const result = await getRedirectResult(auth);

        if (result) {
          const user = result.user;

          const redirectUser = async (uid: string) => {
            const userProfile = await getUserProfile(uid);
            if (userProfile && !userProfile.mainGoal) {
              router.push('/signup/step2');
              return;
            }
            
            const role = await getUserRole(uid);
            if (role === 'admin') {
              router.push('/admin');
            } else if (role === 'caterer') {
              router.push('/caterer');
            } else {
              router.push('/home');
            }
          };

          const userProfile = await getUserProfile(user.uid);

          if (!userProfile) {
            // This is a new user signing up.
            await updateUserProfile(user.uid, {
              fullName: user.displayName || "New User",
              email: user.email!,
              photoURL: user.photoURL,
              role: "client"
            });
            toast({
              title: "Bienvenue !",
              description: "Finalisez votre profil pour commencer.",
            });
            router.push('/signup/step2');
          } else {
            // This is an existing user logging in.
            toast({
              title: "Connexion réussie !",
              description: "Bienvenue !",
            });
            await redirectUser(user.uid);
          }
        }
      } catch (error: any) {
        console.error("Redirect Result Error:", error);
        toast({
          title: "Erreur de connexion Google",
          description: "Impossible de se connecter avec Google. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setGoogleLoading(false);
      }
    };

    processRedirect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return null; // This component does not render anything
}
