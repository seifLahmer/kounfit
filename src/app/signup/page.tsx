
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
import { createUserWithEmailAndPassword, signInWithPopup, User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile, getUserProfile } from "@/lib/services/userService";
import { Separator } from "@/components/ui/separator";


const signupSchema = z.object({
  fullName: z.string().min(2, "Le nom complet doit comporter au moins 2 caractères."),
  email: z.string().email("Veuillez saisir une adresse e-mail valide."),
  password: z.string().min(6, "Le mot de passe doit comporter au moins 6 caractères."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.3v2.84C4.02 20.44 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.3C1.46 8.85 1 10.42 1 12s.46 3.15 1.3 4.93l3.54-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4.02 3.56 2.3 6.96l3.54 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);


export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is already signed in. Check if their profile is complete.
        const userProfile = await getUserProfile(user.uid);
        if (userProfile?.mainGoal) {
          router.replace('/home'); // Already fully registered
        } else {
          router.replace('/signup/step2'); // Needs to complete profile
        }
      } else {
        // No user, safe to show the signup page.
        setIsAuthChecked(true);
      }
    });
    return () => unsubscribe();
  }, [router]);


  const handleNewUser = async (firebaseUser: FirebaseUser, fullName?: string | null) => {
    try {
        const existingProfile = await getUserProfile(firebaseUser.uid);
        if (!existingProfile) {
            // Only create a new profile if one doesn't exist
            await updateUserProfile(firebaseUser.uid, {
                fullName: fullName || firebaseUser.displayName || 'New User',
                email: firebaseUser.email!,
                photoURL: firebaseUser.photoURL,
                role: 'client'
            });
        }
        // Whether new or existing, the onAuthStateChanged in layout will handle redirection.
    } catch (error) {
        console.error("New user handling error:", error);
        toast({ title: "Erreur", description: "Impossible de finaliser votre inscription.", variant: "destructive" });
        throw error; // Re-throw to be caught by the calling function
    }
  };
  
  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await handleNewUser(userCredential.user, data.fullName);
      // onAuthStateChanged in step2 layout will handle redirection if needed.
      router.push('/signup/step2');
    } catch (error: any) {
       console.error("Signup Error:", error);
       let description = "Une erreur s'est produite lors de l'inscription.";
       if (error.code === 'auth/email-already-in-use') {
         description = "Cette adresse e-mail est déjà utilisée. Essayez de vous connecter.";
       }
       toast({
         title: "Erreur d'inscription",
         description: description,
         variant: "destructive",
       });
       setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleNewUser(result.user);
       // onAuthStateChanged in layouts will handle the final redirection.
      router.push('/signup/step2');
    } catch (error: any) {
       if (error.code !== 'auth/popup-closed-by-user') {
            toast({
                title: "Erreur de connexion Google",
                description: "Une erreur s'est produite lors de la tentative de connexion avec Google.",
                variant: "destructive",
            });
        }
       setLoading(false);
    }
  };
  
  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-destructive" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
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
          <CardTitle className="text-2xl">Créer votre compte (Étape 1/2)</CardTitle>
          <CardDescription>Rejoignez-nous pour atteindre vos objectifs de forme.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Nom et Prénom</Label>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <Label>Mot de passe</Label>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <Button type="submit" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={loading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Création du compte..." : "Continuer vers l'étape 2"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <Separator />
            <div className="absolute inset-0 flex items-center">
                <span className="bg-card px-2 text-sm text-muted-foreground mx-auto">OU</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
            <GoogleIcon />
            <span className="ml-2">Continuer avec Google</span>
          </Button>
          
          <div className="mt-4 text-center text-sm">
            Vous avez déjà un compte?{" "}
            <Link href="/login" className="text-destructive hover:underline">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
