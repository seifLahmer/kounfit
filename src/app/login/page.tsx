
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Loader2 } from "lucide-react";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider, getRedirectResult, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { getUserRole } from "@/lib/services/roleService";
import { getUserProfile, updateUserProfile } from "@/lib/services/userService";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const redirectUser = async (uid: string) => {
    try {
        const userProfile = await getUserProfile(uid);
        // If the profile is incomplete (e.g., from a fresh Google sign-in)
        if (!userProfile || !userProfile.mainGoal) {
           router.replace('/signup/step2');
           return;
        }
        
        const role = await getUserRole(uid);
        if (role === 'admin') {
          router.replace('/admin');
        } else if (role === 'caterer') {
          router.replace('/caterer');
        } else {
          router.replace('/home');
        }
    } catch(error) {
        toast({ title: "Erreur de redirection", description: "Impossible de vérifier le profil utilisateur.", variant: "destructive"});
        setLoading(false);
        setIsCheckingRedirect(false);
        router.replace('/welcome'); // Fallback
    }
  }

  // Effect to check for redirect result on component mount
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const firebaseUser = result.user;
          const userProfile = await getUserProfile(firebaseUser.uid);

          if (!userProfile) {
            // This is a brand new user. Create a partial profile.
            await updateUserProfile(firebaseUser.uid, {
              fullName: firebaseUser.displayName || 'Utilisateur Google',
              email: firebaseUser.email!,
              photoURL: firebaseUser.photoURL,
              role: 'client'
            });
            // Redirect to step 2 to complete the profile.
            router.replace('/signup/step2');
          } else {
            // Existing user, redirect them to the correct dashboard.
            await redirectUser(firebaseUser.uid);
          }
        } else {
          // No redirect result, just rendering the login page normally.
          setIsCheckingRedirect(false);
        }
      } catch (error: any) {
        console.error("Google Redirect Error:", error);
        toast({
          title: "Erreur de connexion Google",
          description: `Une erreur est survenue: ${error.message} (code: ${error.code})`,
          variant: "destructive",
        });
        setIsCheckingRedirect(false);
      }
    };
    
    checkRedirect();
    // The dependency array should be empty to run only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      await redirectUser(userCredential.user.uid);
    } catch (error: any) {
      let description = "An error occurred during login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Email ou mot de passe invalide. Veuillez réessayer.";
      }
      toast({
        title: "Échec de la connexion",
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsCheckingRedirect(true); // Show loading spinner
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // The user is redirected. The result is handled by the useEffect hook on the next page load.
    } catch (error: any) {
        console.error("Google Sign-In Redirect Initiation Error:", error);
        toast({
          title: "Erreur de connexion Google",
          description: `Impossible de démarrer la connexion Google: ${error.message}`,
          variant: "destructive",
        });
        setIsCheckingRedirect(false); // Hide loading spinner on error
    }
  };

  if (isCheckingRedirect) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-destructive" />
            <p className="ml-4">Vérification de la connexion...</p>
        </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
           <Link href="/welcome" className="flex justify-center items-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-destructive" />
            <span className="text-2xl font-bold">NutriTrack</span>
          </Link>
          <CardTitle className="text-2xl">Content de vous revoir!</CardTitle>
          <CardDescription>Entrez vos identifiants pour accéder à votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.4l-63.1 61.9C338.4 97.2 297.6 80 248 80c-82.8 0-150.5 67.7-150.5 150.5S165.2 406.5 248 406.5c92.2 0 142.2-64.7 146.7-104.4H248V261.8h239.2c.8 12.2 1.2 24.5 1.2 37z"></path></svg>
              Continuer avec Google
            </Button>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    OU
                    </span>
                </div>
            </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <FormControl>
                      <Input type="email" placeholder="nom@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <Label>Mot de passe</Label>
                      <Link href="#" className="text-sm text-muted-foreground hover:underline">
                        Mot de passe oublié?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={loading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Vous n'avez pas de compte?{" "}
            <Link href="/signup" className="text-destructive hover:underline">
              S'inscrire
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
