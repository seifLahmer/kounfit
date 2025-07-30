
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
import { createUserWithEmailAndPassword, signInWithPopup, User as FirebaseUser } from "firebase/auth";
import { auth, facebookProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile, getUserProfile } from "@/lib/services/userService";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="#1877F2" viewBox="0 0 24 24" {...props}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
  </svg>
);


const signupSchema = z.object({
  fullName: z.string().min(2, "Le nom complet doit comporter au moins 2 caractères."),
  email: z.string().email("Veuillez saisir une adresse e-mail valide."),
  password: z.string().min(6, "Le mot de passe doit comporter au moins 6 caractères."),
});

type SignupFormValues = z.infer<typeof signupSchema>;


export default function SignupStep1Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });
  
  const handleSocialSignIn = async (firebaseUser: FirebaseUser) => {
    setLoading(true);
    try {
        const userProfile = await getUserProfile(firebaseUser.uid);
        if (userProfile && userProfile.mainGoal) {
            router.replace('/home'); // Already exists and profile is complete
        } else {
             await updateUserProfile(firebaseUser.uid, {
                fullName: firebaseUser.displayName || 'New User',
                email: firebaseUser.email!,
                photoURL: firebaseUser.photoURL,
                role: 'client'
             });
            router.replace('/signup/step2'); // New user or incomplete profile
        }
    } catch (error) {
        console.error("Social sign-in error:", error);
        toast({ title: "Erreur", description: "Impossible de vous connecter. Veuillez réessayer.", variant: "destructive" });
        setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      await handleSocialSignIn(result.user);
    } catch (error: any) {
      setLoading(false);
      let description = "Une erreur s'est produite lors de l'inscription avec Facebook.";
      if (error.code === 'auth/account-exists-with-different-credential') {
        description = "Un compte existe déjà avec cette adresse e-mail. Essayez de vous connecter avec une autre méthode.";
      }
      toast({
        title: "Échec de l'inscription",
        description: description,
        variant: "destructive",
      });
    }
  };


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
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={handleFacebookSignIn} disabled={loading}>
            <FacebookIcon className="mr-2 h-5 w-5" />
            S'inscrire avec Facebook
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
