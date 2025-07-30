
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
import { signInWithEmailAndPassword, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
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
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const handleNewOrReturningUser = async (firebaseUser: FirebaseUser) => {
    try {
      let userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile) {
         await updateUserProfile(firebaseUser.uid, {
            fullName: firebaseUser.displayName || 'New User',
            email: firebaseUser.email!,
            photoURL: firebaseUser.photoURL,
            role: 'client'
         });
         userProfile = await getUserProfile(firebaseUser.uid);
      }

      if (!userProfile || !userProfile.mainGoal) {
         router.replace('/signup/step2');
      } else {
          const role = await getUserRole(firebaseUser.uid);
          if (role === 'admin') {
              router.replace('/admin');
          } else if (role === 'caterer') {
              router.replace('/caterer');
          } else {
              router.replace('/home');
          }
      }
    } catch (error) {
        console.error("Redirection error:", error);
        toast({ title: "Erreur", description: "Impossible de vous rediriger après la connexion.", variant: "destructive" });
        setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Layouts will handle redirection
      }
      setIsAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      await handleNewOrReturningUser(userCredential.user);
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
          <CardTitle className="text-2xl">Content de vous revoir!</CardTitle>
          <CardDescription>Entrez vos identifiants pour accéder à votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
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
