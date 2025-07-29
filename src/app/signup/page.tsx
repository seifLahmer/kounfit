
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
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile, getUserProfile } from "@/lib/services/userService";

const signupSchema = z.object({
  fullName: z.string().min(2, "Le nom complet doit comporter au moins 2 caractères."),
  email: z.string().email("Veuillez saisir une adresse e-mail valide."),
  password: z.string().min(6, "Le mot de passe doit comporter au moins 6 caractères."),
});

type SignupFormValues = z.infer<typeof signupSchema>;


export default function SignupStep1Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Create a partial user profile in Firestore
      const userProfileData = {
          fullName: data.fullName,
          email: data.email,
          role: "client" as const,
      };
      await updateUserProfile(user.uid, userProfileData);

      toast({
        title: "Compte créé!",
        description: "Il ne reste plus qu'à finaliser votre profil.",
      });

      // 3. Redirect to step 2
      router.push("/signup/step2");

    } catch (error: any) {
       console.error("Signup Error:", error);
       let description = "Une erreur s'est produite lors de l'inscription.";
       if (error.code === 'auth/email-already-in-use') {
         description = "Cette adresse e-mail est déjà utilisée par un autre compte.";
       }
       toast({
         title: "Erreur d'inscription",
         description: description,
         variant: "destructive",
       });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userProfile = await getUserProfile(user.uid);
       if (!userProfile) {
          await updateUserProfile(user.uid, {
            fullName: user.displayName || 'Utilisateur Google',
            email: user.email!,
            photoURL: user.photoURL,
            role: 'client'
          });
        }
      
      router.push("/signup/step2");

    } catch (error: any) {
       console.error("Google Sign-Up Error:", error);
       toast({
         title: "Erreur d'inscription Google",
         description: `Une erreur est survenue: ${error.message}`,
         variant: "destructive",
       });
    } finally {
      setGoogleLoading(false);
    }
  };


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
           <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={googleLoading || loading}>
                {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.4l-63.1 61.9C338.4 97.2 297.6 80 248 80c-82.8 0-150.5 67.7-150.5 150.5S165.2 406.5 248 406.5c92.2 0 142.2-64.7 146.7-104.4H248V261.8h239.2c.8 12.2 1.2 24.5 1.2 37z"></path></svg>
                )}
                {googleLoading ? "Inscription..." : "S'inscrire avec Google"}
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

              <Button type="submit" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={loading || googleLoading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Création du compte..." : "Continuer vers l'étape 2"}
              </Button>
            </form>
          </Form>

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
